package com.animeblack.core.data.repository.impl

import android.content.Context
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.analytics.AnalyticsHelper
import com.animeblack.core.data.auth.GoogleSignInClient
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.str
import com.animeblack.core.data.presence.PresenceManager
import com.animeblack.core.data.push.PushTokenManager
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.AuthState
import com.animeblack.core.data.repository.ProfileStatus
import com.animeblack.core.data.session.SessionManager
import com.animeblack.core.datastore.SettingsDataSource
import com.animeblack.core.model.SavedAccount
import com.animeblack.core.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

@Singleton
class FirebaseAuthRepository @Inject constructor(
    private val auth: FirebaseAuth,
    private val firestore: FirebaseFirestore,
    private val google: GoogleSignInClient,
    private val settings: SettingsDataSource,
    private val sessionManager: SessionManager,
    private val pushTokenManager: PushTokenManager,
    private val presence: PresenceManager,
    private val analytics: AnalyticsHelper,
    private val errorMapper: FirebaseErrorMapper,
    @ApplicationContext private val appContext: Context,
    @ApplicationScope private val scope: CoroutineScope,
) : AuthRepository {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Initializing)
    override val authState: StateFlow<AuthState> = _authState.asStateFlow()

    private val _profileStatus = MutableStateFlow<ProfileStatus>(ProfileStatus.Loading)
    override val profileStatus: StateFlow<ProfileStatus> = _profileStatus.asStateFlow()

    override val currentUid: String? get() = auth.currentUser?.uid
    override val savedAccounts: Flow<List<SavedAccount>> = settings.savedAccounts

    @Volatile private var bootstrappedUid: String? = null
    @Volatile private var pendingSignUpName: String? = null

    init {
        auth.addAuthStateListener { firebaseAuth -> onAuthChanged(firebaseAuth.currentUser) }
        sessionManager.onRemoteRevoke = { scope.launch { signOut() } }
    }

    private fun onAuthChanged(user: FirebaseUser?) {
        if (user == null) {
            bootstrappedUid = null
            _profileStatus.value = ProfileStatus.Loading
            _authState.value = AuthState.SignedOut
            analytics.setUser(null)
            return
        }
        _authState.value = user.toState()
        if (bootstrappedUid != user.uid) {
            bootstrappedUid = user.uid
            scope.launch { bootstrap(user) }
        }
    }

    private fun FirebaseUser.toState() = AuthState.SignedIn(
        uid = uid,
        email = email,
        emailVerified = isEmailVerified,
        provider = providerData.firstOrNull { it.providerId != "firebase" }?.providerId ?: "password",
        displayName = displayName,
        photoUrl = photoUrl?.toString(),
    )

    /**
     * Mirrors the web onAuthStateChanged bootstrap: existing documents are kept (only blank fields are
     * filled), new users get the same default document the web creates.
     */
    private suspend fun bootstrap(user: FirebaseUser) {
        _profileStatus.value = ProfileStatus.Loading
        val ref = firestore.collection(Collections.USERS).document(user.uid)
        val snapshot = try {
            ref.get().await()
        } catch (_: Exception) {
            null
        }
        val status = when {
            snapshot == null -> ProfileStatus.Ready // offline without cache: never block the app
            snapshot.exists() -> {
                val data = snapshot.data.orEmpty()
                val updates = mutableMapOf<String, Any?>()
                val username = data.str("username")
                if (username.isBlank() || username == "guest" || username == "otaku") {
                    updates["username"] = Validators.defaultUsername(user.email, user.uid)
                }
                if (data.str("email").isBlank() && !user.email.isNullOrBlank()) updates["email"] = user.email
                if (data.str("avatar").isBlank() && user.photoUrl != null) updates["avatar"] = user.photoUrl.toString()
                if (data.str("name").isBlank() && !user.displayName.isNullOrBlank()) updates["name"] = user.displayName
                if (!data.containsKey("id")) {
                    updates["id"] = user.uid
                    updates["uid"] = user.uid
                }
                if (updates.isNotEmpty()) {
                    updates["updatedAt"] = System.currentTimeMillis()
                    ref.set(updates, SetOptions.merge())
                }
                if (data.containsKey("profileCompleted") && !data.bool("profileCompleted", true)) {
                    ProfileStatus.NeedsCompletion
                } else {
                    ProfileStatus.Ready
                }
            }
            else -> {
                ref.set(defaultUserDocument(user), SetOptions.merge())
                ProfileStatus.NeedsCompletion
            }
        }
        pendingSignUpName = null
        _profileStatus.value = status

        settings.upsertSavedAccount(
            SavedAccount(
                uid = user.uid,
                name = user.displayName ?: snapshot?.data?.str("name").orEmpty(),
                email = user.email.orEmpty(),
                avatar = user.photoUrl?.toString() ?: snapshot?.data?.str("avatar").orEmpty(),
                provider = (user.toState()).provider,
                lastUsedAt = System.currentTimeMillis(),
            ),
        )
        analytics.setUser(user.uid)
        sessionManager.start(user.uid)
        pushTokenManager.register()
        presence.setOnline(true)
    }

    private fun defaultUserDocument(user: FirebaseUser): Map<String, Any?> {
        val isAdminEmail = user.email.equals(User.ADMIN_EMAIL, ignoreCase = true)
        val name = pendingSignUpName ?: user.displayName ?: "أوتاكو أنمي بلاك"
        return mapOf(
            "id" to user.uid,
            "uid" to user.uid,
            "name" to name,
            "username" to Validators.defaultUsername(user.email, user.uid),
            "email" to user.email.orEmpty(),
            "avatar" to (user.photoUrl?.toString() ?: DEFAULT_AVATAR),
            "bio" to "عضو في مجتمع أنمي بلاك",
            "role" to if (isAdminEmail) "admin" else User.ROLE_MEMBER,
            "level" to 1,
            "followers" to 0,
            "following" to 0,
            "reputation" to 15,
            "coins" to 150,
            "stars" to 10,
            "joined" to System.currentTimeMillis(),
            "badges" to listOf("badge_rookie"),
            "titles" to emptyList<String>(),
            "equippedTitle" to null,
            "ownedCards" to emptyList<String>(),
            "avatarFrame" to null,
            "profileEffect" to null,
            "history" to emptyList<Any>(),
            "saved" to emptyList<String>(),
            "following_list" to emptyList<String>(),
            "profileCompleted" to false,
            "platform" to "android",
        )
    }

    override suspend fun signInWithEmail(email: String, password: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        auth.signInWithEmailAndPassword(email.trim(), password).await()
        analytics.logEvent("login", mapOf("method" to "password"))
    }

    override suspend fun signUpWithEmail(name: String, email: String, password: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        pendingSignUpName = name.trim()
        val result = auth.createUserWithEmailAndPassword(email.trim(), password).await()
        val user = result.user ?: throw AppErrorException(AppError.Unknown())
        user.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build()).await()
        try {
            user.sendEmailVerification().await()
        } catch (_: Exception) {
            // Verification e-mail is optional; the user can resend it from settings.
        }
        analytics.logEvent("sign_up", mapOf("method" to "password"))
    }

    override suspend fun signInWithGoogle(activityContext: Context, onlyAuthorizedAccounts: Boolean): AppResult<Unit> =
        runCatchingApp(errorMapper) {
            val token = google.requestIdToken(activityContext, onlyAuthorizedAccounts)
            val credential = GoogleAuthProvider.getCredential(token.idToken, null)
            val result = auth.signInWithCredential(credential).await()
            val isNew = result.additionalUserInfo?.isNewUser == true
            analytics.logEvent(if (isNew) "sign_up" else "login", mapOf("method" to "google"))
        }

    override suspend fun sendPasswordReset(email: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        auth.sendPasswordResetEmail(email.trim()).await()
        Unit
    }

    override suspend fun sendEmailVerification(): AppResult<Unit> = runCatchingApp(errorMapper) {
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        user.sendEmailVerification().await()
        Unit
    }

    override suspend fun reloadUser(): AppResult<Boolean> = runCatchingApp(errorMapper) {
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        user.reload().await()
        val refreshed = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        _authState.value = refreshed.toState()
        refreshed.isEmailVerified
    }

    override suspend fun signOut() {
        presence.setOnline(false)
        pushTokenManager.unregister()
        sessionManager.end()
        google.clearCredentialState(appContext)
        auth.signOut()
    }

    override suspend fun deleteAccount(): AppResult<Unit> = runCatchingApp(errorMapper) {
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        val lastSignIn = user.metadata?.lastSignInTimestamp ?: 0L
        if (System.currentTimeMillis() - lastSignIn > RECENT_LOGIN_WINDOW_MS) {
            throw AppErrorException(AppError.Auth("requires-recent-login"))
        }
        val uid = user.uid
        pushTokenManager.unregister()
        sessionManager.end()
        firestore.collection(Collections.USER_STATES).document(uid).delete().await()
        firestore.collection(Collections.USERS).document(uid).delete().await()
        user.delete().await()
        settings.removeSavedAccount(uid)
        google.clearCredentialState(appContext)
    }

    override suspend fun forgetSavedAccount(uid: String) = settings.removeSavedAccount(uid)

    override suspend fun markProfileCompleted() {
        _profileStatus.value = ProfileStatus.Ready
    }

    companion object {
        /** Web default avatar (`AV[0]`), used when the provider has no photo. */
        const val DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
        private const val RECENT_LOGIN_WINDOW_MS = 5 * 60_000L
    }
}
