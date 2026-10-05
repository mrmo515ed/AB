package com.animeblack.feature.auth

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GlowChip
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.IconTile
import com.animeblack.core.designsystem.component.Pill
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
            .background(AbColors.HeroGradient)
            .drawBehind {
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AbColors.Cyan.copy(alpha = 0.16f), Color.Transparent),
                        center = Offset(size.width * 0.2f, size.height * 0.16f),
                        radius = size.minDimension * 0.72f,
                    ),
                )
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(AbColors.Purple.copy(alpha = 0.22f), Color.Transparent),
                        center = Offset(size.width * 0.82f, size.height * 0.74f),
                        radius = size.minDimension * 0.78f,
                    ),
                )
            },
    ) { content() }
}

@Composable
private fun BrandHeader(logoRes: Int?) {
    val transition = rememberInfiniteTransition(label = "logoSpin")
    val spin by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 4800, easing = LinearEasing),
            repeatMode = RepeatMode.Restart,
        ),
        label = "spin",
    )
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        if (logoRes != null) {
            Box(
                modifier = Modifier
                    .size(98.dp)
                    .glow(AbColors.Cyan, radius = 34.dp, alpha = 0.42f)
                    .drawBehind {
                        rotate(spin) {
                            drawCircle(
                                brush = AbColors.StoryRing,
                                style = Stroke(width = 2.8.dp.toPx()),
                            )
                        }
                    }
                    .padding(5.dp)
                    .clip(RoundedCornerShape(26.dp))
                    .background(AbColors.Ink),
                contentAlignment = Alignment.Center,
            ) {
                Image(
                    painter = painterResource(logoRes),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize().clip(RoundedCornerShape(23.dp)),
                )
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
            Text(
                stringResource(R.string.auth_welcome),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center,
            )
            Spacer(Modifier.width(8.dp))
            Pill(text = "v25 PRO", color = AbColors.Cyan, textColor = Color.White)
        }
        Spacer(Modifier.height(4.dp))
        Text(
            stringResource(R.string.auth_tagline),
            style = MaterialTheme.typography.bodyMedium,
            color = AbTheme.colors.textMuted,
            textAlign = TextAlign.Center,
        )
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
private fun PasswordStrengthBar(password: String) {
    val score = remember(password) {
        var s = 0
        if (password.length >= 6) s++
        if (password.length >= 10) s++
        if (password.any { it.isUpperCase() } && password.any { it.isLowerCase() }) s++
        if (password.any { it.isDigit() } || password.any { !it.isLetterOrDigit() }) s++
        s.coerceIn(1, 4)
    }
    val (label, color) = when (score) {
        1 -> "ضعيفة" to AbColors.Rose
        2 -> "متوسطة" to AbColors.Gold
        3 -> "جيدة" to AbColors.Cyan
        else -> "قوية جداً" to AbColors.Emerald
    }
    Column(Modifier.fillMaxWidth()) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            for (i in 1..4) {
                Box(
                    Modifier
                        .weight(1f)
                        .height(4.dp)
                        .clip(CircleShape)
                        .background(if (i <= score) color else AbColors.Charcoal4),
                )
            }
        }
        Spacer(Modifier.height(4.dp))
        Text("قوة كلمة المرور: $label", style = MaterialTheme.typography.labelSmall, color = color, fontWeight = FontWeight.Bold)
    }
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
            .border(1.dp, (if (isError) AbColors.Rose else AbColors.Emerald).copy(alpha = 0.35f), RoundedCornerShape(14.dp))
            .padding(12.dp),
    ) {
        AbIcon(if (isError) AbIcons.Error else AbIcons.CheckCircle, null, tint = if (isError) AbColors.Rose else AbColors.Emerald, size = 20.dp)
        Spacer(Modifier.size(8.dp))
        Text(stringResource(text), style = MaterialTheme.typography.bodyMedium)
    }
}

/** High-contrast white Google Sign-In button matching the web `.gbtn` design. */
@Composable
private fun GoogleButton(loading: Boolean, onClick: () -> Unit) {
    Surface(
        onClick = { if (!loading) onClick() },
        enabled = !loading,
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        shadowElevation = 6.dp,
        modifier = Modifier
            .fillMaxWidth()
            .height(52.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center,
        ) {
            GoogleColorMark(Modifier.size(20.dp))
            Spacer(Modifier.width(10.dp))
            Text(
                text = stringResource(R.string.auth_google),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F172A),
            )
        }
    }
}

@Composable
private fun GoogleColorMark(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val stroke = size.minDimension * 0.22f
        val inset = stroke / 2f
        val arcSize = Size(size.width - stroke, size.height - stroke)
        val topLeft = Offset(inset, inset)
        drawArc(Color(0xFFEA4335), -145f, 105f, false, topLeft, arcSize, style = Stroke(width = stroke, cap = StrokeCap.Butt))
        drawArc(Color(0xFFFBBC05), 145f, 70f, false, topLeft, arcSize, style = Stroke(width = stroke, cap = StrokeCap.Butt))
        drawArc(Color(0xFF34A853), 45f, 100f, false, topLeft, arcSize, style = Stroke(width = stroke, cap = StrokeCap.Butt))
        drawArc(Color(0xFF4285F4), -15f, 60f, false, topLeft, arcSize, style = Stroke(width = stroke, cap = StrokeCap.Butt))
        drawLine(
            color = Color(0xFF4285F4),
            start = Offset(size.width * 0.52f, size.height * 0.5f),
            end = Offset(size.width - inset * 0.5f, size.height * 0.5f),
            strokeWidth = stroke * 0.9f,
            cap = StrokeCap.Round,
        )
    }
}

@Composable
private fun AuthSegmentedTabs(
    activeTab: Int,
    onSelectTab: (Int) -> Unit,
) {
    val tabs = listOf(
        "تسجيل الدخول" to AbIcons.Login,
        "حساب جديد" to AbIcons.PersonAdd,
        "دخول سريع" to AbIcons.RocketLaunch,
    )
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(AbColors.Ink.copy(alpha = 0.85f))
            .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(14.dp))
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        tabs.forEachIndexed { index, (label, icon) ->
            val selected = activeTab == index
            val shape = RoundedCornerShape(10.dp)
            Row(
                modifier = Modifier
                    .weight(1f)
                    .clip(shape)
                    .then(if (selected) Modifier.background(AbColors.CyanVioletGradient) else Modifier)
                    .clickable { onSelectTab(index) }
                    .padding(vertical = 9.dp, horizontal = 6.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                AbIcon(icon, null, tint = if (selected) Color.White else AbColors.TextMuted, size = 15.dp)
                Spacer(Modifier.width(4.dp))
                Text(
                    text = label,
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = if (selected) FontWeight.ExtraBold else FontWeight.SemiBold,
                    color = if (selected) Color.White else AbColors.TextMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun FeatureMiniPill(
    icon: Int,
    title: String,
    subtitle: String,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(14.dp))
            .background(AbColors.Charcoal2.copy(alpha = 0.88f))
            .border(1.dp, accent.copy(alpha = 0.28f), RoundedCornerShape(14.dp))
            .padding(vertical = 10.dp, horizontal = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AbIcon(icon, contentDescription = null, tint = accent, size = 18.dp)
        Spacer(Modifier.height(4.dp))
        Text(title, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.ExtraBold, color = Color.White, maxLines = 1)
        Text(subtitle, style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp), color = AbColors.TextMuted, maxLines = 1)
    }
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
    var activeTab by rememberSaveable { mutableIntStateOf(0) }
    var showFeaturesDialog by remember { mutableStateOf(false) }
    var showServerDialog by remember { mutableStateOf(false) }
    LaunchedEffect(prefillEmail) { prefillEmail?.let(viewModel::prefill) }
    AuthBackground {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 460.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Spacer(Modifier.height(8.dp))
                BrandHeader(logoRes)
                if (accounts.isNotEmpty()) {
                    SavedAccountsRow(accounts, onPick = { account ->
                        if (account.provider == "google.com") viewModel.google(context, onlyAuthorized = true) else {
                            activeTab = 0
                            viewModel.prefill(account.email)
                        }
                    })
                }
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = 18.dp,
                    borderColor = AbColors.Cyan.copy(alpha = 0.25f),
                ) {
                    AuthSegmentedTabs(activeTab = activeTab, onSelectTab = { activeTab = it })
                    Spacer(Modifier.height(14.dp))
                    GoogleButton(state.loading) { viewModel.google(context) }
                    Spacer(Modifier.height(12.dp))
                    OrDivider()
                    Spacer(Modifier.height(12.dp))
                    ErrorBanner(state.error)
                    if (state.error != null) Spacer(Modifier.height(10.dp))

                    when (activeTab) {
                        0 -> {
                            AbTextField(
                                value = state.email,
                                onValueChange = viewModel::onEmail,
                                label = stringResource(R.string.auth_email),
                                leadingIcon = AbIcons.Mail,
                                error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                            )
                            Spacer(Modifier.height(10.dp))
                            PasswordField(state.password, viewModel::onPassword, state.passwordError, viewModel::signIn)
                            Row(
                                Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.End,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                TextButton(onClick = onForgot) {
                                    Text(stringResource(R.string.auth_forgot), color = AbColors.Violet)
                                }
                            }
                            GradientButton(
                                stringResource(R.string.auth_sign_in),
                                onClick = viewModel::signIn,
                                loading = state.loading,
                                icon = AbIcons.Login,
                                modifier = Modifier.fillMaxWidth(),
                            )
                            TextButton(onClick = onSignUp, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                                Text(stringResource(R.string.auth_no_account), color = AbColors.Violet)
                            }
                        }

                        1 -> {
                            AbTextField(
                                value = state.name,
                                onValueChange = viewModel::onName,
                                label = stringResource(R.string.auth_name),
                                leadingIcon = AbIcons.Person,
                                error = if (state.nameError) stringResource(R.string.auth_err_name) else null,
                            )
                            Spacer(Modifier.height(10.dp))
                            AbTextField(
                                value = state.email,
                                onValueChange = viewModel::onEmail,
                                label = stringResource(R.string.auth_email),
                                leadingIcon = AbIcons.Mail,
                                error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                            )
                            Spacer(Modifier.height(10.dp))
                            PasswordField(state.password, viewModel::onPassword, state.passwordError, viewModel::signUp)
                            if (state.password.isNotEmpty()) {
                                Spacer(Modifier.height(8.dp))
                                PasswordStrengthBar(state.password)
                            }
                            Spacer(Modifier.height(12.dp))
                            GradientButton(
                                stringResource(R.string.auth_sign_up),
                                onClick = viewModel::signUp,
                                loading = state.loading,
                                icon = AbIcons.AutoAwesome,
                                modifier = Modifier.fillMaxWidth(),
                            )
                        }

                    }
                }

                // Feature Showcase Row
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FeatureMiniPill(AbIcons.ChatBubble, "دردشة ونقابات", "غرف حية وصوتية", AbColors.Cyan, Modifier.weight(1f))
                    FeatureMiniPill(AbIcons.LiveTv, "أنمي ومانجا", "مكتبة وريلز", AbColors.Purple, Modifier.weight(1f))
                    FeatureMiniPill(AbIcons.SportsEsports, "ألعاب ومهام", "عملات ومستويات", AbColors.Gold, Modifier.weight(1f))
                }

                // Bottom Utility Chips
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    GlowChip(
                        text = "متصل بالسيرفر • Firebase",
                        icon = AbIcons.CheckCircle,
                        accentColor = AbColors.Emerald,
                        onClick = { showServerDialog = true },
                    )
                    Spacer(Modifier.width(8.dp))
                    GlowChip(
                        text = "مميزات v25",
                        icon = AbIcons.AutoAwesome,
                        accentColor = AbColors.Cyan,
                        onClick = { showFeaturesDialog = true },
                    )
                }

                Text(
                    stringResource(R.string.auth_terms_notice),
                    style = MaterialTheme.typography.labelSmall,
                    color = AbTheme.colors.textMuted,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }

    if (showFeaturesDialog) {
        AlertDialog(
            onDismissRequest = { showFeaturesDialog = false },
            containerColor = AbColors.Charcoal2,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AbIcon(AbIcons.AutoAwesome, null, tint = AbColors.Cyan, size = 22.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("Anime Black v25 • المميزات الكاملة", fontWeight = FontWeight.Black)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("• موجز ذكي مع قصص تفاعلية، استطلاعات، وتفاعلات سريعة.", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                    Text("• دردشة فورية خاصة ومجموعات ونقابات مع ملصقات، رسائل صوتية، وخلفيات مخصصة.", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                    Text("• مركز الأنمي والمانجا، الريلز القصيرة، وصيد الأنمي والألعاب التفاعلية.", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                    Text("• نظام مستويات XP، محفظة عملات ذهبية ونجوم، إطارات أفاتار وألقاب ملكية.", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = {
                TextButton(onClick = { showFeaturesDialog = false }) { Text("حسناً", color = AbColors.Cyan, fontWeight = FontWeight.Bold) }
            },
        )
    }

    if (showServerDialog) {
        AlertDialog(
            onDismissRequest = { showServerDialog = false },
            containerColor = AbColors.Charcoal2,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    AbIcon(AbIcons.CheckCircle, null, tint = AbColors.Emerald, size = 22.dp)
                    Spacer(Modifier.width(8.dp))
                    Text("حالة السيرفر السحابي", fontWeight = FontWeight.Black)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("• المشروع السحابي: animeblackapp-b6223", color = Color.White, style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                    Text("• خدمات المصادقة: البريد الإلكتروني + Google Sign-In", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                    Text("• قاعدة البيانات والتخزين: Cloud Firestore + Realtime Sync + Offline Cache", color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall)
                }
            },
            confirmButton = {
                TextButton(onClick = { showServerDialog = false }) { Text("إغلاق", color = AbColors.Cyan, fontWeight = FontWeight.Bold) }
            },
        )
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
    GlassCard(contentPadding = 10.dp, borderColor = AbColors.Purple.copy(alpha = 0.28f)) {
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
            Modifier.fillMaxSize().statusBarsPadding().navigationBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Column(Modifier.widthIn(max = 460.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                Spacer(Modifier.height(8.dp))
                BrandHeader(logoRes)
                GlassCard(contentPadding = 18.dp, borderColor = AbColors.Cyan.copy(alpha = 0.25f)) {
                    GoogleButton(state.loading) { viewModel.google(context) }
                    Spacer(Modifier.height(12.dp))
                    OrDivider()
                    Spacer(Modifier.height(12.dp))
                    ErrorBanner(state.error)
                    if (state.error != null) Spacer(Modifier.height(10.dp))
                    AbTextField(
                        value = state.name,
                        onValueChange = viewModel::onName,
                        label = stringResource(R.string.auth_name),
                        leadingIcon = AbIcons.Person,
                        error = if (state.nameError) stringResource(R.string.auth_err_name) else null,
                    )
                    Spacer(Modifier.height(10.dp))
                    AbTextField(
                        value = state.email,
                        onValueChange = viewModel::onEmail,
                        label = stringResource(R.string.auth_email),
                        leadingIcon = AbIcons.Mail,
                        error = if (state.emailError) stringResource(R.string.auth_err_email) else null,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                    )
                    Spacer(Modifier.height(10.dp))
                    PasswordField(state.password, viewModel::onPassword, state.passwordError, viewModel::signUp)
                    if (state.password.isNotEmpty()) {
                        Spacer(Modifier.height(8.dp))
                        PasswordStrengthBar(state.password)
                    }
                    Spacer(Modifier.height(14.dp))
                    GradientButton(
                        stringResource(R.string.auth_sign_up),
                        onClick = viewModel::signUp,
                        loading = state.loading,
                        icon = AbIcons.AutoAwesome,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    TextButton(onClick = onSignIn, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                        Text(stringResource(R.string.auth_have_account), color = AbColors.Violet)
                    }
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
