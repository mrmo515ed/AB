package com.animeblack.feature.profile

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors

@Composable
fun EditProfileScreen(onBack: () -> Unit, viewModel: EditProfileViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.saved.collect { onBack() } }
    val avatarPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.update { it.copy(avatarUri = uri.toString()) }
    }
    val coverPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri != null) viewModel.update { it.copy(coverUri = uri.toString()) }
    }
    val imageOnly = PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.profile_edit), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        if (!state.loaded) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        val original = state.original
        Column(Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState())) {
            Box {
                Box(
                    Modifier.fillMaxWidth().aspectRatio(2.8f).background(AbColors.AuroraGradient).clickable { coverPicker.launch(imageOnly) },
                    contentAlignment = Alignment.Center,
                ) {
                    val cover = state.coverUri ?: original?.cover?.takeIf { it.startsWith("http") }
                    if (cover != null) AsyncImage(model = cover, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
                    Box(Modifier.clip(RoundedCornerShape(50)).background(Color(0x88000000)).padding(horizontal = 12.dp, vertical = 6.dp)) {
                        Text(stringResource(R.string.profile_change_cover), color = Color.White, style = MaterialTheme.typography.labelMedium)
                    }
                }
                Box(Modifier.align(Alignment.BottomStart).offset(x = 16.dp, y = 44.dp).clickable { avatarPicker.launch(imageOnly) }) {
                    if (state.avatarUri != null) {
                        AsyncImage(model = state.avatarUri, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.size(92.dp).clip(CircleShape))
                    } else {
                        Avatar(original?.avatar, original?.displayName.orEmpty(), size = 92.dp)
                    }
                    Box(Modifier.align(Alignment.BottomEnd).size(30.dp).clip(CircleShape).background(AbColors.Purple), contentAlignment = Alignment.Center) {
                        AbIcon(AbIcons.PhotoCamera, stringResource(R.string.profile_change_avatar), tint = Color.White, size = 18.dp)
                    }
                }
            }
            Column(Modifier.padding(start = 16.dp, end = 16.dp, top = 60.dp, bottom = 24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                AbTextField(state.name, { v -> viewModel.update { it.copy(name = v.take(50)) } }, label = stringResource(R.string.profile_name), leadingIcon = AbIcons.Person)
                AbTextField(
                    value = state.username,
                    onValueChange = viewModel::onUsername,
                    label = stringResource(R.string.profile_username),
                    leadingIcon = AbIcons.AlternateEmail,
                    error = when (state.usernameCheck) {
                        UsernameCheck.Taken -> stringResource(R.string.profile_username_taken)
                        UsernameCheck.Invalid -> stringResource(R.string.profile_username_invalid)
                        else -> null
                    },
                )
                when (state.usernameCheck) {
                    UsernameCheck.Checking -> Text(stringResource(R.string.profile_checking), color = AbColors.TextMuted, style = MaterialTheme.typography.labelSmall)
                    UsernameCheck.Available -> Text(stringResource(R.string.profile_username_ok), color = AbColors.Emerald, style = MaterialTheme.typography.labelSmall)
                    else -> Unit
                }
                AbTextField(state.bio, { v -> viewModel.update { it.copy(bio = v.take(300)) } }, label = stringResource(R.string.profile_bio), singleLine = false, minLines = 3)
                AbTextField(state.location, { v -> viewModel.update { it.copy(location = v.take(80)) } }, label = stringResource(R.string.profile_location), leadingIcon = AbIcons.LocationOn)
                AbTextField(state.website, { v -> viewModel.update { it.copy(website = v.take(200)) } }, label = stringResource(R.string.profile_website), leadingIcon = AbIcons.Link)
                AbTextField(state.favAnime, { v -> viewModel.update { it.copy(favAnime = v.take(80)) } }, label = stringResource(R.string.profile_fav_anime, "").trimEnd(' ', ':'), leadingIcon = AbIcons.LiveTv)
                AbTextField(state.favStudio, { v -> viewModel.update { it.copy(favStudio = v.take(80)) } }, label = stringResource(R.string.profile_fav_studio, "").trimEnd(' ', ':'), leadingIcon = AbIcons.Movie)
                GradientButton(
                    text = stringResource(R.string.profile_save),
                    onClick = viewModel::save,
                    loading = state.saving,
                    enabled = state.usernameCheck != UsernameCheck.Taken && state.usernameCheck != UsernameCheck.Invalid,
                    icon = AbIcons.Check,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
        }
    }
}
