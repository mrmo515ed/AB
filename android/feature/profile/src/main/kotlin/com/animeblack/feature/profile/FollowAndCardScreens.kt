package com.animeblack.feature.profile

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassButton
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.copyToClipboard
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// ============================================================================ Followers / following

@Composable
fun FollowListScreen(onBack: () -> Unit, openProfile: (String) -> Unit, viewModel: FollowListViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    Scaffold(
        topBar = { AbTopBar(title = stringResource(if (state.followers) R.string.profile_followers_title else R.string.profile_following_title), onBack = onBack) },
        snackbarHost = { SnackbarHost(snackbar) },
    ) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.users.isEmpty() -> EmptyState(title = stringResource(R.string.profile_empty_list), icon = AbIcons.Groups, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
                items(state.users, key = { it.id }) { user ->
                    UserRow(user = user, onClick = { openProfile(user.id) }, trailing = {
                        if (user.id != state.myUid) {
                            val following = user.id in state.myFollowing
                            if (following) {
                                GlassButton(stringResource(R.string.profile_following), onClick = { viewModel.toggleFollow(user) })
                            } else {
                                GradientButton(stringResource(R.string.profile_follow), onClick = { viewModel.toggleFollow(user) })
                            }
                        }
                    })
                }
            }
        }
    }
}

// ============================================================================ Profile card with QR

/** Encodes [content] as a QR code bitmap (black on white, quiet zone of 1 module). */
fun qrBitmap(content: String, sizePx: Int = 720): ImageBitmap {
    val hints = mapOf(
        EncodeHintType.MARGIN to 1,
        EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.M,
        EncodeHintType.CHARACTER_SET to "UTF-8",
    )
    val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, sizePx, sizePx, hints)
    val pixels = IntArray(sizePx * sizePx)
    for (y in 0 until sizePx) {
        val row = y * sizePx
        for (x in 0 until sizePx) pixels[row + x] = if (matrix.get(x, y)) 0xFF000000.toInt() else 0xFFFFFFFF.toInt()
    }
    return Bitmap.createBitmap(pixels, sizePx, sizePx, Bitmap.Config.ARGB_8888).asImageBitmap()
}

@Composable
fun QrCardScreen(onBack: () -> Unit, viewModel: QrCardViewModel = hiltViewModel()) {
    val me by viewModel.me.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()
    val user = me
    val link = user?.let { shareLink("user", it.id) }
    val qr by produceState<ImageBitmap?>(initialValue = null, link) {
        value = link?.let { withContext(Dispatchers.Default) { qrBitmap(it) } }
    }
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.profile_qr), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        if (user == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        Column(
            Modifier.fillMaxSize().padding(padding).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Column(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(28.dp)).background(AbColors.AuroraGradient).padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Avatar(user.avatar, user.displayName, size = 84.dp)
                Spacer(Modifier.height(10.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(user.displayName, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold, color = Color.White)
                    if (user.showsVerifiedBadge) VerifiedBadge(gold = user.isGoldVerified, size = 18.dp, modifier = Modifier.padding(start = 6.dp))
                }
                if (user.handle.isNotBlank()) Text(user.handle, color = Color.White.copy(alpha = 0.8f))
                Spacer(Modifier.height(16.dp))
                Box(Modifier.size(240.dp).clip(RoundedCornerShape(20.dp)).background(Color.White).padding(12.dp), contentAlignment = Alignment.Center) {
                    qr?.let { Image(bitmap = it, contentDescription = link, filterQuality = FilterQuality.None, modifier = Modifier.fillMaxSize()) }
                }
                Spacer(Modifier.height(12.dp))
                Text(stringResource(R.string.profile_card_hint), color = Color.White.copy(alpha = 0.85f), textAlign = TextAlign.Center, style = MaterialTheme.typography.bodySmall)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                GlassButton(stringResource(R.string.profile_copy_link), onClick = {
                    link?.let { copyToClipboard(context, it) }
                    scope.launch { snackbar.showSnackbar(context.getString(R.string.profile_link_copied)) }
                }, icon = AbIcons.ContentCopy, modifier = Modifier.weight(1f))
                GradientButton(stringResource(R.string.profile_share), onClick = {
                    link?.let { context.shareText(user.displayName + "\n" + it, context.getString(com.animeblack.core.ui.R.string.ui_share_via)) }
                }, icon = AbIcons.Share, modifier = Modifier.weight(1f))
            }
        }
    }
}
