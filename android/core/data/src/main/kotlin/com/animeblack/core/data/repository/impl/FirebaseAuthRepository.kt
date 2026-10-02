package com.animeblack.core.data.repository.impl

import android.content.Context
import com.animeblack.core.common.dispatchers.ApplicationScope
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.result.runCatchingApp
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.analytics.AnalyticsHelper
import com.animeblack.core.data.auth.GoogleSignInClient
import com.animeblack.core.data.firebase.ActiveSessionHolder
import com.animeblack.core.data.firebase.AppErrorException
import com.animeblack.core.data.firebase.Collections
import com.animeblack.core.data.firebase.FirebaseErrorMapper
import com.animeblack.core.data.firebase.activeUid
import com.animeblack.core.data.firebase.awaitWrite
import com.animeblack.core.data.firebase.bool
import com.animeblack.core.data.firebase.getFast
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
import com.google.firebase.auth.EmailAuthProvider
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

    override val currentUid: String? get() = auth.activeUid()
    override val savedAccounts: Flow<List<SavedAccount>> = settings.savedAccounts

    @Volatile private var bootstrappedUid: String? = null
    @Volatile private var pendingSignUpName: String? = null
    @Volatile private var pendingGuestName: String? = null
    @Volatile private var pendingGuestUsername: String? = null

    init {
        auth.addAuthStateListener { firebaseAuth -> onAuthChanged(firebaseAuth.currentUser) }
        sessionManager.onRemoteRevoke = { scope.launch { signOut() } }
    }

    private fun onAuthChanged(user: FirebaseUser?) {
        if (user == null) {
            if (ActiveSessionHolder.fallbackUid != null) return
            bootstrappedUid = null
            _profileStatus.value = ProfileStatus.Loading
            _authState.value = AuthState.SignedOut
            analytics.setUser(null)
            return
        }
        ActiveSessionHolder.fallbackUid = null
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
        provider = if (isGuestUser()) PROVIDER_GUEST else providerData.firstOrNull { it.providerId != "firebase" }?.providerId ?: "password",
        displayName = displayName,
        photoUrl = photoUrl?.toString(),
        isAnonymous = isGuestUser(),
    )

    /** Anonymous accounts and quick-start accounts (internal `.invalid` address) are guests. */
    private fun FirebaseUser.isGuestUser(): Boolean = isAnonymous || email.orEmpty().endsWith("@$QUICK_ACCOUNT_DOMAIN")

    /**
     * Fast bootstrap: reads local cache first (0ms), then falls back to a bounded 1.8s server read
     * so app launch and sign-in never block on slow networks or unconfigured Firestore.
     */
    private suspend fun bootstrap(user: FirebaseUser) {
        _profileStatus.value = ProfileStatus.Loading
        val ref = firestore.collection(Collections.USERS).document(user.uid)
        val snapshot = ref.getFast(timeoutMs = 1_800L, preferCache = true)
        val status = when {
            snapshot == null -> {
                ref.set(defaultUserDocument(user), SetOptions.merge())
                ProfileStatus.Ready
            }
            snapshot.exists() -> {
                val data = snapshot.data.orEmpty()
                val updates = mutableMapOf<String, Any?>()
                val username = data.str("username")
                if (username.isBlank() || username == "guest" || username == "otaku") {
                    updates["username"] = Validators.defaultUsername(user.email, user.uid)
                }
                if (data.str("email").isBlank() && !user.email.isNullOrBlank() && !user.isGuestUser()) updates["email"] = user.email
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
                if (user.isGuestUser()) ProfileStatus.Ready else ProfileStatus.NeedsCompletion
            }
        }
        pendingSignUpName = null
        pendingGuestName = null
        pendingGuestUsername = null
        _profileStatus.value = status

        if (!user.isGuestUser()) {
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
        }
        analytics.setUser(user.uid)
        sessionManager.start(user.uid)
        pushTokenManager.register()
        presence.setOnline(true)
    }

    private fun defaultUserDocument(user: FirebaseUser): Map<String, Any?> {
        if (user.isGuestUser()) return guestUserDocument(user.uid, user.displayName)
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

    private fun guestUserDocument(uid: String, displayName: String? = null): Map<String, Any?> {
        val tag = uid.takeLast(4).uppercase()
        return mapOf(
            "id" to uid,
            "uid" to uid,
            "name" to (pendingGuestName ?: displayName?.takeIf { it.isNotBlank() } ?: "زائر $tag"),
            "username" to (pendingGuestUsername ?: "guest_" + uid.take(8).lowercase().filter { it.isLetterOrDigit() }),
            "email" to "",
            "avatar" to DEFAULT_AVATAR,
            "bio" to "ضيف في مجتمع أنمي بلاك",
            "role" to User.ROLE_MEMBER,
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
            "history" to emptyList<Any>(),
            "saved" to emptyList<String>(),
            "following_list" to emptyList<String>(),
            "profileCompleted" to true,
            "isGuest" to true,
            "platform" to "android",
        )
    }

    override suspend fun signInAsGuest(name: String, username: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val cleanName = name.trim().take(50)
        val cleanUsername = Validators.normalizeUsername(username)
        if (cleanUsername.isNotEmpty()) {
            if (!Validators.isValidUsername(cleanUsername)) throw AppErrorException(AppError.Validation("username", "invalid"))
            val snap = firestore.collection(Collections.USERS).whereEqualTo("username", cleanUsername).limit(1).getFast(timeoutMs = 1_200L)
            if (snap != null && !snap.isEmpty) throw AppErrorException(AppError.Validation("username", "taken"))
        }
        pendingGuestName = cleanName.ifEmpty { null }
        pendingGuestUsername = cleanUsername.ifEmpty { null }
        try {
            val result = try {
                auth.signInAnonymously().await()
            } catch (_: Exception) {
                val handle = (cleanUsername.ifEmpty { "guest" } + "_" + randomToken(6)).take(40)
                auth.createUserWithEmailAndPassword("$handle@$QUICK_ACCOUNT_DOMAIN", randomToken(32)).await()
            }
            val user = result.user
            if (user != null && cleanName.isNotEmpty()) {
                user.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(cleanName).build()).awaitWrite(1_200L)
            }
        } catch (_: Exception) {
            // If both Anonymous and Email/Password providers are disabled in Firebase Console,
            // fall back to a local guest session (matching the web app's guest mode).
            val guestUid = "guest_" + randomToken(10)
            val resolvedName = cleanName.ifEmpty { "زائر " + guestUid.takeLast(4).uppercase() }
            val resolvedUser = cleanUsername.ifEmpty { guestUid }
            ActiveSessionHolder.fallbackUid = guestUid
            ActiveSessionHolder.fallbackName = resolvedName
            ActiveSessionHolder.fallbackUsername = resolvedUser
            firestore.collection(Collections.USERS).document(guestUid).set(guestUserDocument(guestUid, resolvedName), SetOptions.merge())
            bootstrappedUid = guestUid
            pendingGuestName = null
            pendingGuestUsername = null
            _profileStatus.value = ProfileStatus.Ready
            _authState.value = AuthState.SignedIn(
                uid = guestUid,
                email = null,
                emailVerified = false,
                provider = PROVIDER_GUEST,
                displayName = resolvedName,
                photoUrl = DEFAULT_AVATAR,
                isAnonymous = true,
            )
        }
        analytics.logEvent("login", mapOf("method" to PROVIDER_GUEST))
    }

    private fun randomToken(length: Int): String {
        val chars = "abcdefghijklmnopqrstuvwxyz0123456789"
        val random = java.security.SecureRandom()
        return (1..length).map { chars[random.nextInt(chars.length)] }.joinToString("")
    }

    override suspend fun upgradeGuestWithEmail(name: String, email: String, password: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        val guest = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        if (!guest.isGuestUser()) throw AppErrorException(AppError.Validation("account", "not-guest"))
        val cleanEmail = email.trim()
        pendingPassword = password
        val linked = if (guest.isAnonymous) {
            guest.linkWithCredential(EmailAuthProvider.getCredential(cleanEmail, password)).await().user ?: guest
        } else {
            guest.updatePassword(password).await()
            guest.verifyBeforeUpdateEmail(cleanEmail).await()
            guest
        }
        val cleanName = name.trim()
        if (cleanName.isNotEmpty()) {
            linked.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(cleanName).build()).awaitWrite()
        }
        val updates = mutableMapOf<String, Any?>("email" to cleanEmail, "isGuest" to false, "updatedAt" to System.currentTimeMillis())
        if (cleanName.isNotEmpty()) updates["name"] = cleanName
        firestore.collection(Collections.USERS).document(linked.uid).set(updates, SetOptions.merge())
        if (guestWasAnonymousOrVerified(linked)) {
            try {
                linked.sendEmailVerification().awaitWrite()
            } catch (_: Exception) {
            }
        }
        finishUpgrade(linked, cleanName.ifEmpty { null })
        analytics.logEvent("guest_upgrade", mapOf("method" to "password"))
    }

    override suspend fun upgradeGuestWithGoogle(activityContext: Context): AppResult<Unit> = runCatchingApp(errorMapper) {
        val guest = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        if (!guest.isGuestUser()) throw AppErrorException(AppError.Validation("account", "not-guest"))
        val token = google.requestIdToken(activityContext, onlyAuthorizedAccounts = false)
        val linked = guest.linkWithCredential(GoogleAuthProvider.getCredential(token.idToken, null)).await().user ?: guest
        val ref = firestore.collection(Collections.USERS).document(linked.uid)
        val current = ref.getFast(preferCache = true)?.data.orEmpty()
        val updates = mutableMapOf<String, Any?>("email" to (linked.email ?: token.email), "isGuest" to false, "updatedAt" to System.currentTimeMillis())
        if (current.str("name").startsWith("زائر") && !token.displayName.isNullOrBlank()) updates["name"] = token.displayName
        if ((current.str("avatar").isBlank() || current.str("avatar") == DEFAULT_AVATAR) && !token.photoUrl.isNullOrBlank()) updates["avatar"] = token.photoUrl
        ref.set(updates, SetOptions.merge())
        finishUpgrade(linked, token.displayName)
        analytics.logEvent("guest_upgrade", mapOf("method" to "google"))
    }

    private fun guestWasAnonymousOrVerified(user: FirebaseUser): Boolean = !user.email.orEmpty().endsWith("@$QUICK_ACCOUNT_DOMAIN")

    private suspend fun finishUpgrade(user: FirebaseUser, name: String?) {
        try {
            user.reload().awaitWrite()
        } catch (_: Exception) {
        }
        val fresh = auth.currentUser ?: user
        _authState.value = fresh.toState()
        settings.upsertSavedAccount(
            SavedAccount(
                uid = fresh.uid,
                name = name ?: fresh.displayName.orEmpty(),
                email = fresh.email.orEmpty(),
                avatar = fresh.photoUrl?.toString().orEmpty(),
                provider = fresh.toState().provider,
                lastUsedAt = System.currentTimeMillis(),
            ),
        )
    }

    override suspend fun signInWithEmail(email: String, password: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        auth.signInWithEmailAndPassword(email.trim(), password).await()
        pendingPassword = password
        analytics.logEvent("login", mapOf("method" to "password"))
    }

    override suspend fun signUpWithEmail(name: String, email: String, password: String): AppResult<Unit> = runCatchingApp(errorMapper) {
        pendingSignUpName = name.trim()
        val result = auth.createUserWithEmailAndPassword(email.trim(), password).await()
        val user = result.user ?: throw AppErrorException(AppError.Unknown())
        user.updateProfile(UserProfileChangeRequest.Builder().setDisplayName(name.trim()).build()).awaitWrite()
        try {
            user.sendEmailVerification().awaitWrite()
        } catch (_: Exception) {
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
        ActiveSessionHolder.fallbackUid = null
        ActiveSessionHolder.fallbackName = null
        ActiveSessionHolder.fallbackUsername = null
        presence.setOnline(false)
        pushTokenManager.unregister()
        sessionManager.end()
        google.clearCredentialState(appContext)
        auth.signOut()
        if (auth.currentUser == null) {
            bootstrappedUid = null
            _profileStatus.value = ProfileStatus.Loading
            _authState.value = AuthState.SignedOut
        }
    }

    override suspend fun deleteAccount(activityContext: Context?): AppResult<Unit> {
        var result = deleteAccountOnce()
        val error = (result as? AppResult.Failure)?.error
        if (error is AppError.Auth && error.code == "requires-recent-login" && activityContext != null) {
            when (val reauth = reauthenticate(activityContext)) {
                is AppResult.Success -> result = deleteAccountOnce()
                is AppResult.Failure -> return reauth
            }
        }
        return result
    }

    private suspend fun deleteAccountOnce(): AppResult<Unit> = runCatchingApp(errorMapper) {
        val fallbackUid = ActiveSessionHolder.fallbackUid
        if (auth.currentUser == null && fallbackUid != null) {
            firestore.collection(Collections.USER_STATES).document(fallbackUid).delete().awaitWrite()
            firestore.collection(Collections.USERS).document(fallbackUid).delete().awaitWrite()
            signOut()
            return@runCatchingApp
        }
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        val lastSignIn = user.metadata?.lastSignInTimestamp ?: 0L
        if (System.currentTimeMillis() - lastSignIn > RECENT_LOGIN_WINDOW_MS) {
            throw AppErrorException(AppError.Auth("requires-recent-login"))
        }
        val uid = user.uid
        pushTokenManager.unregister()
        sessionManager.end()
        firestore.collection(Collections.USER_STATES).document(uid).delete().awaitWrite()
        firestore.collection(Collections.USERS).document(uid).delete().awaitWrite()
        user.delete().await()
        settings.removeSavedAccount(uid)
        google.clearCredentialState(appContext)
    }

    override suspend fun reauthenticate(activityContext: Context?): AppResult<Unit> = runCatchingApp(errorMapper) {
        val user = auth.currentUser ?: throw AppErrorException(AppError.Unauthenticated())
        when (user.providerData.lastOrNull()?.providerId) {
            "google.com" -> {
                val context = activityContext ?: throw AppErrorException(AppError.Auth("requires-recent-login"))
                val token = google.requestIdToken(context, onlyAuthorizedAccounts = false)
                user.reauthenticate(GoogleAuthProvider.getCredential(token.idToken, null)).await()
            }
            else -> {
                val email = user.email ?: throw AppErrorException(AppError.Auth("requires-recent-login"))
                val password = pendingPassword
                if (password.isNullOrBlank()) throw AppErrorException(AppError.Auth("requires-recent-login"))
                user.reauthenticate(EmailAuthProvider.getCredential(email, password)).await()
            }
        }
        Unit
    }

    @Volatile private var pendingPassword: String? = null

    override suspend fun forgetSavedAccount(uid: String) = settings.removeSavedAccount(uid)

    override suspend fun markProfileCompleted() {
        _profileStatus.value = ProfileStatus.Ready
    }

    companion object {
        const val PROVIDER_GUEST = "anonymous"
        const val QUICK_ACCOUNT_DOMAIN = "guest.animeblack.invalid"
        const val DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
        private const val RECENT_LOGIN_WINDOW_MS = 5 * 60_000L
    }
}
