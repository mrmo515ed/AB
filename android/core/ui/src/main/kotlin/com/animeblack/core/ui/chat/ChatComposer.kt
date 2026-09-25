package com.animeblack.core.ui.chat

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbIconButton
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.LocalMedia
import com.animeblack.core.model.MessageQuote
import com.animeblack.core.ui.R
import com.animeblack.core.ui.formatDuration
import kotlinx.coroutines.delay

/**
 * Message composer shared by all chat surfaces: multi-line input, attachments (gallery, camera,
 * documents), reply/edit banners, and tap-to-record voice notes (with cancel).
 */
@Composable
fun ChatComposer(
    text: String,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    modifier: Modifier = Modifier,
    attachments: List<LocalMedia> = emptyList(),
    onRemoveAttachment: (LocalMedia) -> Unit = {},
    replyTo: MessageQuote? = null,
    onCancelReply: () -> Unit = {},
    editing: Boolean = false,
    onCancelEdit: () -> Unit = {},
    onPickMedia: (() -> Unit)? = null,
    onPickFile: (() -> Unit)? = null,
    onCamera: (() -> Unit)? = null,
    onVoiceRecorded: ((VoiceClip) -> Unit)? = null,
    enabled: Boolean = true,
    disabledHint: String? = null,
    sending: Boolean = false,
) {
    val context = LocalContext.current
    val recorder = rememberVoiceRecorder()
    var recording by remember { mutableStateOf(false) }
    var elapsed by remember { mutableLongStateOf(0L) }
    var attachMenu by remember { mutableStateOf(false) }
    var micDenied by remember { mutableStateOf(false) }

    fun startRecording() {
        micDenied = false
        recording = recorder.start()
    }

    val micPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) startRecording() else micDenied = true
    }
    LaunchedEffect(recording) {
        while (recording) {
            elapsed = recorder.elapsedMs
            if (elapsed >= VoiceRecorder.MAX_DURATION_MS) {
                recording = false
                recorder.stop()?.let { onVoiceRecorded?.invoke(it) }
            }
            delay(200)
        }
    }

    Column(modifier.fillMaxWidth().background(AbColors.Charcoal)) {
        HorizontalDivider(color = AbColors.Line2)
        if (!enabled) {
            Text(
                disabledHint.orEmpty(),
                color = AbColors.TextSecondary,
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodyMedium,
                modifier = Modifier.fillMaxWidth().padding(16.dp),
            )
            return@Column
        }
        AnimatedVisibility(replyTo != null || editing) {
            Banner(
                title = if (editing) stringResource(R.string.ui_chat_editing) else stringResource(R.string.ui_chat_replying_to, replyTo?.senderName.orEmpty()),
                body = if (editing) text else replyTo?.let { q -> q.text.ifBlank { q.type } }.orEmpty(),
                onClose = if (editing) onCancelEdit else onCancelReply,
            )
        }
        if (attachments.isNotEmpty()) {
            LazyRow(
                Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(attachments, key = { it.uri }) { media -> AttachmentPreview(media) { onRemoveAttachment(media) } }
            }
        }
        if (micDenied) {
            Text(
                stringResource(R.string.ui_chat_mic_permission),
                color = AbColors.Orange,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
            )
        }
        Row(Modifier.fillMaxWidth().padding(horizontal = 6.dp, vertical = 6.dp), verticalAlignment = Alignment.Bottom) {
            if (recording) {
                AbIconButton(AbIcons.Delete, stringResource(R.string.ui_cancel), onClick = {
                    recorder.cancel()
                    recording = false
                }, tint = AbColors.Rose)
                Row(
                    Modifier.weight(1f).height(48.dp).clip(RoundedCornerShape(24.dp)).background(AbColors.Charcoal3).padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(Modifier.size(10.dp).clip(CircleShape).background(AbColors.Rose))
                    Spacer(Modifier.width(10.dp))
                    Text(stringResource(R.string.ui_chat_recording), color = AbColors.TextSecondary, modifier = Modifier.weight(1f))
                    Text(formatDuration(elapsed), color = AbColors.TextPrimary, style = MaterialTheme.typography.labelLarge)
                }
                Spacer(Modifier.width(6.dp))
                SendButton(enabled = true) {
                    recording = false
                    recorder.stop()?.let { clip -> onVoiceRecorded?.invoke(clip) }
                }
            } else {
                if (!editing && (onPickMedia != null || onPickFile != null || onCamera != null)) {
                    Box {
                        AbIconButton(AbIcons.AddCircle, stringResource(R.string.ui_chat_attach), onClick = { attachMenu = true }, tint = AbColors.Violet)
                        DropdownMenu(expanded = attachMenu, onDismissRequest = { attachMenu = false }, containerColor = AbColors.Charcoal3) {
                            onPickMedia?.let { pick ->
                                DropdownMenuItem(
                                    text = { Text(stringResource(R.string.ui_chat_gallery)) },
                                    leadingIcon = { AbIcon(AbIcons.PhotoLibrary, null, tint = AbColors.Cyan) },
                                    onClick = {
                                        attachMenu = false
                                        pick()
                                    },
                                )
                            }
                            onCamera?.let { cam ->
                                DropdownMenuItem(
                                    text = { Text(stringResource(R.string.ui_chat_camera)) },
                                    leadingIcon = { AbIcon(AbIcons.PhotoCamera, null, tint = AbColors.Pink) },
                                    onClick = {
                                        attachMenu = false
                                        cam()
                                    },
                                )
                            }
                            onPickFile?.let { file ->
                                DropdownMenuItem(
                                    text = { Text(stringResource(R.string.ui_chat_document)) },
                                    leadingIcon = { AbIcon(AbIcons.Description, null, tint = AbColors.Gold) },
                                    onClick = {
                                        attachMenu = false
                                        file()
                                    },
                                )
                            }
                        }
                    }
                }
                TextField(
                    value = text,
                    onValueChange = { onTextChange(it.take(MAX_MESSAGE_LENGTH)) },
                    placeholder = { Text(stringResource(R.string.ui_chat_type_message), color = AbColors.TextMuted) },
                    maxLines = 5,
                    shape = RoundedCornerShape(24.dp),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = AbColors.Charcoal3,
                        unfocusedContainerColor = AbColors.Charcoal3,
                        focusedIndicatorColor = Color.Transparent,
                        unfocusedIndicatorColor = Color.Transparent,
                        cursorColor = AbColors.Cyan,
                    ),
                    modifier = Modifier.weight(1f),
                )
                Spacer(Modifier.width(6.dp))
                val canSend = text.isNotBlank() || attachments.isNotEmpty()
                if (canSend || editing || onVoiceRecorded == null) {
                    SendButton(enabled = canSend && !sending, onClick = onSend)
                } else {
                    Box(
                        Modifier.size(48.dp).clip(CircleShape).background(AbColors.Charcoal3),
                        contentAlignment = Alignment.Center,
                    ) {
                        AbIconButton(AbIcons.Mic, stringResource(R.string.ui_chat_record), onClick = {
                            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                                startRecording()
                            } else {
                                micPermission.launch(Manifest.permission.RECORD_AUDIO)
                            }
                        }, tint = AbColors.Violet)
                    }
                }
            }
        }
    }
}

const val MAX_MESSAGE_LENGTH = 4_000

@Composable
private fun SendButton(enabled: Boolean, onClick: () -> Unit) {
    Box(
        Modifier.size(48.dp).clip(CircleShape).background(if (enabled) AbColors.PrimaryGradient else androidx.compose.ui.graphics.SolidColor(AbColors.Charcoal3)),
        contentAlignment = Alignment.Center,
    ) {
        AbIconButton(AbIcons.Send, stringResource(R.string.ui_send), onClick = onClick, tint = Color.White, enabled = enabled)
    }
}

@Composable
private fun Banner(title: String, body: String, onClose: () -> Unit) {
    Row(
        Modifier.fillMaxWidth().padding(start = 12.dp, end = 4.dp, top = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.width(3.dp).height(36.dp).background(AbColors.Cyan))
        Column(Modifier.weight(1f).padding(horizontal = 10.dp)) {
            Text(title, color = AbColors.Cyan, style = MaterialTheme.typography.labelMedium, maxLines = 1)
            Text(body, color = AbColors.TextSecondary, style = MaterialTheme.typography.bodySmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        AbIconButton(AbIcons.Close, stringResource(R.string.ui_cancel), onClick = onClose, tint = AbColors.TextSecondary)
    }
}

@Composable
private fun AttachmentPreview(media: LocalMedia, onRemove: () -> Unit) {
    Box(Modifier.size(72.dp).clip(RoundedCornerShape(12.dp)).background(AbColors.Charcoal3)) {
        when (media.type) {
            "image", "gif", "video" -> AsyncImage(model = media.uri, contentDescription = null, contentScale = ContentScale.Crop, modifier = Modifier.matchParentSize())
            else -> Column(Modifier.matchParentSize().padding(6.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                AbIcon(if (media.type == "audio" || media.type == "voice") AbIcons.MusicNote else AbIcons.Description, null, tint = AbColors.Gold)
                Text(media.name, color = AbColors.TextSecondary, style = MaterialTheme.typography.labelSmall, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        if (media.type == "video") AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White, modifier = Modifier.align(Alignment.Center))
        Box(
            Modifier.align(Alignment.TopEnd).padding(3.dp).size(22.dp).clip(CircleShape).background(Color(0xAA000000)),
            contentAlignment = Alignment.Center,
        ) {
            AbIconButton(AbIcons.Close, stringResource(R.string.ui_chat_remove_attachment), onClick = onRemove, tint = Color.White, modifier = Modifier.size(22.dp))
        }
    }
}
