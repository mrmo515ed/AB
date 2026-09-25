package com.animeblack.feature.auth

import android.content.Context
import androidx.annotation.StringRes
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.animeblack.core.common.result.AppError
import com.animeblack.core.common.result.AppResult
import com.animeblack.core.common.util.Validators
import com.animeblack.core.data.repository.AuthRepository
import com.animeblack.core.data.repository.ProfileUpdate
import com.animeblack.core.data.repository.UserRepository
import com.animeblack.core.model.SavedAccount
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class AuthUiState(
    val email: String = "",
    val password: String = "",
    val name: String = "",
    val loading: Boolean = false,
    @StringRes val error: Int? = null,
    @StringRes val info: Int? = null,
    val emailError: Boolean = false,
    val passwordError: Boolean = false,
    val nameError: Boolean = false,
)

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val auth: AuthRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(AuthUiState())
    val state: StateFlow<AuthUiState> = _state.asStateFlow()
    val savedAccounts: StateFlow<List<SavedAccount>> =
        auth.savedAccounts.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun onEmail(v: String) = _state.update { it.copy(email = v.trim(), emailError = false, error = null) }
    fun onPassword(v: String) = _state.update { it.copy(password = v, passwordError = false, error = null) }
    fun onName(v: String) = _state.update { it.copy(name = v, nameError = false, error = null) }
    fun prefill(email: String) = _state.update { it.copy(email = email) }

    private fun validate(requireName: Boolean, requirePassword: Boolean = true): Boolean {
        val s = _state.value
        val emailBad = !Validators.isValidEmail(s.email)
        val passBad = requirePassword && !Validators.isValidPassword(s.password)
        val nameBad = requireName && s.name.isBlank()
        _state.update { it.copy(emailError = emailBad, passwordError = passBad, nameError = nameBad) }
        return !emailBad && !passBad && !nameBad
    }

    fun signIn() {
        if (!validate(requireName = false)) return
        perform { auth.signInWithEmail(_state.value.email, _state.value.password) }
    }

    fun signUp() {
        if (!validate(requireName = true)) return
        perform { auth.signUpWithEmail(_state.value.name, _state.value.email, _state.value.password) }
    }

    fun google(activityContext: Context, onlyAuthorized: Boolean = false) =
        perform { auth.signInWithGoogle(activityContext, onlyAuthorized) }

    fun sendReset() {
        if (!validate(requireName = false, requirePassword = false)) return
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, info = null) }
            val r = auth.sendPasswordReset(_state.value.email)
            _state.update {
                // Same message whether or not the account exists (avoids account enumeration).
                if (r is AppResult.Failure && r.error is AppError.Network) it.copy(loading = false, error = R.string.auth_err_network)
                else it.copy(loading = false, info = R.string.auth_reset_sent)
            }
        }
    }

    fun forget(uid: String) = viewModelScope.launch { auth.forgetSavedAccount(uid) }

    private fun perform(block: suspend () -> AppResult<Unit>) {
        if (_state.value.loading) return
        viewModelScope.launch {
            _state.update { it.copy(loading = true, error = null, info = null) }
            val result = block()
            _state.update { it.copy(loading = false, error = (result as? AppResult.Failure)?.error?.let(::messageFor)) }
        }
    }

    companion object {
        @StringRes
        fun messageFor(error: AppError): Int? = when (error) {
            is AppError.Cancelled -> null
            is AppError.Network -> R.string.auth_err_network
            is AppError.RateLimited -> R.string.auth_err_too_many
            is AppError.Auth -> when (error.code) {
                "invalid-credential", "error_wrong_password", "error_invalid_credential" -> R.string.auth_err_invalid_credential
                "user-not-found", "error_user_not_found" -> R.string.auth_err_user_not_found
                "email-already-in-use" -> R.string.auth_err_email_in_use
                "weak-password" -> R.string.auth_err_weak_password
                "google-config", "google-not-configured" -> R.string.auth_err_google_config
                "google-no-account" -> R.string.auth_err_google_no_account
                else -> R.string.auth_err_generic
            }
            else -> R.string.auth_err_generic
        }
    }
}

data class CompleteProfileState(
    val name: String = "",
    val username: String = "",
    val bio: String = "",
    val avatarUri: String? = null,
    val currentAvatar: String = "",
    /** null = unknown/checking, true = available, false = taken */
    val usernameAvailable: Boolean? = null,
    val usernameValid: Boolean = true,
    val saving: Boolean = false,
    val loaded: Boolean = false,
)

@HiltViewModel
class CompleteProfileViewModel @Inject constructor(
    private val users: UserRepository,
    private val auth: AuthRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(CompleteProfileState())
    val state: StateFlow<CompleteProfileState> = _state.asStateFlow()
    private var checkJob: Job? = null

    init {
        viewModelScope.launch {
            val uid = auth.currentUid ?: return@launch
            val me = users.getUser(uid)
            _state.update {
                it.copy(name = me?.name.orEmpty(), username = me?.username.orEmpty(), bio = me?.bio.orEmpty(), currentAvatar = me?.avatar.orEmpty(), loaded = true)
            }
        }
    }

    fun onName(v: String) = _state.update { it.copy(name = v.take(50)) }
    fun onBio(v: String) = _state.update { it.copy(bio = v.take(300)) }
    fun onAvatar(uri: String?) = _state.update { it.copy(avatarUri = uri) }

    @OptIn(FlowPreview::class)
    fun onUsername(v: String) {
        val normalized = Validators.normalizeUsername(v)
        val valid = Validators.isValidUsername(normalized)
        _state.update { it.copy(username = normalized, usernameValid = valid, usernameAvailable = null) }
        checkJob?.cancel()
        if (!valid) return
        checkJob = viewModelScope.launch {
            delay(450)
            val r = users.isUsernameAvailable(normalized)
            _state.update { it.copy(usernameAvailable = (r as? AppResult.Success)?.data) }
        }
    }

    fun save(onDone: () -> Unit) {
        val s = _state.value
        if (s.name.isBlank() || !s.usernameValid || s.usernameAvailable == false) return
        viewModelScope.launch {
            _state.update { it.copy(saving = true) }
            val r = users.updateProfile(
                ProfileUpdate(name = s.name, username = s.username, bio = s.bio, avatarUri = s.avatarUri, profileCompleted = true),
            )
            _state.update { it.copy(saving = false) }
            if (r is AppResult.Success) {
                auth.markProfileCompleted()
                onDone()
            } else {
                _state.update { it.copy(usernameAvailable = if ((r as AppResult.Failure).error is AppError.Validation) false else it.usernameAvailable) }
            }
        }
    }
}
