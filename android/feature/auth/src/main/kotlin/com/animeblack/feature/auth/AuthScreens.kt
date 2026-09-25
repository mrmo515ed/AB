package com.animeblack.feature.auth

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.glow
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.designsystem.theme.AbTheme
import com.animeblack.core.model.SavedAccount

@Composable
private fun AuthBackground(content: @Composable () -> Unit) {
    Box(
        Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0B0620), AbColors.Black, AbColors.Black))),
    ) { content() }
}

@Composable
private fun BrandHeader(logoRes: Int?) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        if (logoRes != null) {
            Image(
                painter = painterResource(logoRes),
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(96.dp).glow(AbColors.Purple, 26.dp).clip(RoundedCornerShape(26.dp)),
            )
        }
        Spacer(Modifier.height(16.dp))
        Text(stringResource(R.string.auth_welcome), style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
        Spacer(Modifier.height(4.dp))
        Text(stringResource(R.string.auth_tagline), style = MaterialTheme.typography.bodyMedium, color = AbTheme.colors.textMuted, textAlign = TextAlign.Center)
    }
}

@Composable
private fun PasswordField(value: String, onChange: (String) -> Unit, error: Boolean, onDone: () -> Unit) {
    var visible by rememberSaveable { mutableStateOf(false) }
    AbTextField(
        value = value,
        onValueChange = onChange,
        label = stringResource(R.string.auth_password),
        leadingIcon = AbIcons.Lock,
        error = if (error) stringResource(R.string.auth_err_password) else null,
        visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
        keyboardActions = androidx.compose.foundation.text.KeyboardActions(onDone = { onDone() }),
        trailing = {
            IconButton(onClick = { visible = !visible }) {
                AbIcon(
                    if (visible) AbIcons.VisibilityOff else AbIcons.Visibility,
                    stringResource(if (visible) R.string.auth_hide_password else R.string.auth_show_password),
                    size = 20.dp,
                )
            }
        },
    )
}

@Composable
private fun ErrorBanner(message: Int?, info: Int? = null) {
    val text = message ?: info ?: return
    val isError = message != null
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background((if (isError) AbColors.Rose else AbColors.Emerald).copy(alpha = 0.14f))
            .padding(12.dp),
    ) {
        AbIcon(if (isError) AbIcons.Error else AbIcons.CheckCircle, null, tint = if (isError) AbColors.Rose else AbColors.Emerald, size = 20.dp)
        Spacer(Modifier.size(8.dp))
        Text(stringResource(text), style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun GoogleButton(loading: Boolean, onClick: () -> Unit) {
    GlassButton(
        text = stringResource(R.string.auth_google),
        onClick = { if (!loading) onClick() },
        icon = AbIcons.AccountCircle,
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
fun LoginScreen(
    onSignUp: () -> Unit,
    onForgot: () -> Unit,
    logoRes: Int?,
    prefillEmail: String? = null,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val accounts by viewModel.savedAccounts.collectAsStateWithLifecycle()
    val context = LocalContext.current
    LaunchedEffect(prefillEmail) { prefillEmail?.let(viewModel::prefill) }
    AuthBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 460.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Spacer(Modifier.height(24.dp))
                BrandHeader(logoRes)
                Spacer(Modifier.height(8.dp))
                if (accounts.isNotEmpty()) SavedAccountsRow(accounts, onPick = { account ->
                    if (account.provider == "google.com") viewModel.google(context, onlyAuthorized = true) else viewModel.prefill(account.email)
                })
                ErrorBanner(state.error)
                AbTextField(
                    value = state.email,
                    onValueChange = viewModel::onEmail,
                    label = stringResource(R.string.auth_email),
                    leadingIcon = AbIcons.Mail,
                    error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                )
                PasswordField(state.password, viewModel::onPassword, state.passwordError, viewModel::signIn)
                TextButton(onClick = onForgot, modifier = Modifier.align(Alignment.End)) {
                    Text(stringResource(R.string.auth_forgot), color = AbColors.Cyan)
                }
                GradientButton(stringResource(R.string.auth_sign_in), onClick = viewModel::signIn, loading = state.loading, modifier = Modifier.fillMaxWidth())
                OrDivider()
                GoogleButton(state.loading) { viewModel.google(context) }
                TextButton(onClick = onSignUp, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                    Text(stringResource(R.string.auth_no_account), color = AbColors.Violet)
                }
                Text(stringResource(R.string.auth_terms_notice), style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun OrDivider() {
    Row(verticalAlignment = Alignment.CenterVertically) {
        HorizontalDivider(Modifier.weight(1f), color = AbTheme.colors.glassBorder)
        Text(stringResource(R.string.auth_or), modifier = Modifier.padding(horizontal = 12.dp), color = AbTheme.colors.textMuted, style = MaterialTheme.typography.labelMedium)
        HorizontalDivider(Modifier.weight(1f), color = AbTheme.colors.glassBorder)
    }
}

@Composable
private fun SavedAccountsRow(accounts: List<SavedAccount>, onPick: (SavedAccount) -> Unit) {
    GlassCard(contentPadding = 10.dp) {
        Text(stringResource(R.string.auth_saved_accounts), style = MaterialTheme.typography.labelLarge, color = AbTheme.colors.textMuted)
        Spacer(Modifier.height(6.dp))
        accounts.take(3).forEach { account ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).clickable { onPick(account) }.padding(6.dp),
            ) {
                Avatar(account.avatar, account.name.ifBlank { account.email }, size = 36.dp)
                Spacer(Modifier.size(10.dp))
                Column(Modifier.weight(1f)) {
                    Text(account.name.ifBlank { account.email }, style = MaterialTheme.typography.titleSmall)
                    Text(account.email, style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                }
                AbIcon(AbIcons.ChevronRight, null, tint = AbTheme.colors.textMuted, size = 20.dp)
            }
        }
    }
}

@Composable
fun SignUpScreen(onSignIn: () -> Unit, logoRes: Int?, viewModel: AuthViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    AuthBackground {
        Column(
            Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 460.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Spacer(Modifier.height(16.dp))
                BrandHeader(logoRes)
                ErrorBanner(state.error)
                AbTextField(
                    value = state.name,
                    onValueChange = viewModel::onName,
                    label = stringResource(R.string.auth_name),
                    leadingIcon = AbIcons.Person,
                    error = if (state.nameError) stringResource(R.string.auth_err_name) else null,
                )
                AbTextField(
                    value = state.email,
                    onValueChange = viewModel::onEmail,
                    label = stringResource(R.string.auth_email),
                    leadingIcon = AbIcons.Mail,
                    error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                )
                PasswordField(state.password, viewModel::onPassword, state.passwordError, viewModel::signUp)
                GradientButton(stringResource(R.string.auth_sign_up), onClick = viewModel::signUp, loading = state.loading, modifier = Modifier.fillMaxWidth())
                OrDivider()
                GoogleButton(state.loading) { viewModel.google(context) }
                TextButton(onClick = onSignIn, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                    Text(stringResource(R.string.auth_have_account), color = AbColors.Violet)
                }
            }
        }
    }
}

@Composable
fun ForgotPasswordScreen(onBack: () -> Unit, viewModel: AuthViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(stringResource(R.string.auth_reset_title), onBack = onBack) }) { padding ->
        Column(Modifier.padding(padding).padding(24.dp).imePadding(), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Text(stringResource(R.string.auth_reset_hint), style = MaterialTheme.typography.bodyMedium, color = AbTheme.colors.textMuted)
            ErrorBanner(state.error, state.info)
            AbTextField(
                value = state.email,
                onValueChange = viewModel::onEmail,
                label = stringResource(R.string.auth_email),
                leadingIcon = AbIcons.Mail,
                error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Send),
            )
            GradientButton(stringResource(R.string.auth_reset_send), onClick = viewModel::sendReset, loading = state.loading, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
fun CompleteProfileScreen(onDone: () -> Unit, viewModel: CompleteProfileViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.onAvatar(uri.toString())
    }
    Scaffold(topBar = { AbTopBar(stringResource(R.string.auth_complete_title)) }) { padding ->
        Column(
            Modifier.padding(padding).fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(stringResource(R.string.auth_complete_hint), color = AbTheme.colors.textMuted)
            Box(
                Modifier.size(112.dp).clip(CircleShape).border(2.dp, AbColors.StoryRing, CircleShape)
                    .clickable { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                contentAlignment = Alignment.Center,
            ) {
                val model = state.avatarUri ?: state.currentAvatar
                if (model.isNotBlank()) {
                    AsyncImage(model = model, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.fillMaxSize())
                } else {
                    AbIcon(AbIcons.PhotoCamera, stringResource(R.string.auth_pick_avatar), size = 34.dp)
                }
            }
            TextButton(onClick = { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }) {
                Text(stringResource(R.string.auth_pick_avatar), color = AbColors.Cyan)
            }
            AbTextField(state.name, viewModel::onName, label = stringResource(R.string.auth_name), leadingIcon = AbIcons.Person)
            AbTextField(
                value = state.username,
                onValueChange = viewModel::onUsername,
                label = stringResource(R.string.auth_username),
                leadingIcon = AbIcons.AlternateEmail,
                error = when {
                    !state.usernameValid -> stringResource(R.string.auth_username_invalid)
                    state.usernameAvailable == false -> stringResource(R.string.auth_username_taken)
                    else -> null
                },
                trailing = if (state.usernameAvailable == true) {
                    { AbIcon(AbIcons.CheckCircle, stringResource(R.string.auth_username_available), tint = AbColors.Emerald, size = 20.dp) }
                } else {
                    null
                },
            )
            AbTextField(state.bio, viewModel::onBio, label = stringResource(R.string.auth_bio), singleLine = false, minLines = 3)
            GradientButton(
                stringResource(R.string.auth_continue),
                onClick = { viewModel.save(onDone) },
                loading = state.saving,
                enabled = state.name.isNotBlank() && state.usernameValid && state.usernameAvailable != false,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
fun AccountSwitcherScreen(
    onBack: () -> Unit,
    onSwitch: (SavedAccount?) -> Unit,
    currentUid: String?,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    val accounts by viewModel.savedAccounts.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(stringResource(R.string.auth_switch_account), onBack = onBack) }) { padding ->
        Column(Modifier.padding(padding).padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            accounts.forEach { account ->
                GlassCard(onClick = { if (account.uid != currentUid) onSwitch(account) }) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(account.avatar, account.name.ifBlank { account.email }, size = 44.dp)
                        Spacer(Modifier.size(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(account.name.ifBlank { account.email }, style = MaterialTheme.typography.titleSmall)
                            Text(account.email, style = MaterialTheme.typography.labelSmall, color = AbTheme.colors.textMuted)
                        }
                        if (account.uid == currentUid) {
                            AbIcon(AbIcons.CheckCircle, null, tint = AbColors.Emerald, size = 22.dp)
                        } else {
                            TextButton(onClick = { viewModel.forget(account.uid) }) {
                                Text(stringResource(R.string.auth_remove_account), color = AbColors.Rose)
                            }
                        }
                    }
                }
            }
            GradientButton(stringResource(R.string.auth_add_account), onClick = { onSwitch(null) }, icon = AbIcons.PersonAdd, modifier = Modifier.fillMaxWidth())
        }
    }
}
