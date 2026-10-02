package com.animeblack.feature.more

import android.text.format.DateUtils
import androidx.annotation.DrawableRes
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.PrimaryScrollableTabRow
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.compose.collectAsLazyPagingItems
import androidx.paging.compose.itemKey
import coil3.compose.AsyncImage
import com.animeblack.core.designsystem.component.AbIcon
import com.animeblack.core.designsystem.component.AbTextField
import com.animeblack.core.designsystem.component.AbTopBar
import com.animeblack.core.designsystem.component.Avatar
import com.animeblack.core.designsystem.component.AvatarRing
import com.animeblack.core.designsystem.component.ConfirmDialog
import com.animeblack.core.designsystem.component.EmptyState
import com.animeblack.core.designsystem.component.GlassCard
import com.animeblack.core.designsystem.component.GlowChip
import com.animeblack.core.designsystem.component.GradientButton
import com.animeblack.core.designsystem.component.IconTile
import com.animeblack.core.designsystem.component.LoadingState
import com.animeblack.core.designsystem.component.Pill
import com.animeblack.core.designsystem.component.SearchField
import com.animeblack.core.designsystem.component.SectionHeader
import com.animeblack.core.designsystem.component.StatMiniCard
import com.animeblack.core.designsystem.component.VerifiedBadge
import com.animeblack.core.designsystem.icon.AbIcons
import com.animeblack.core.designsystem.theme.AbColors
import com.animeblack.core.model.ACHIEVEMENT_BADGES
import com.animeblack.core.model.Post
import com.animeblack.core.model.Thought
import com.animeblack.core.model.User
import com.animeblack.core.model.achievementBadge
import com.animeblack.core.model.nextRank
import com.animeblack.core.model.rankFor
import com.animeblack.core.navigation.AccountSwitcherRoute
import com.animeblack.core.navigation.AdminRoute
import com.animeblack.core.navigation.AnimeDetailRoute
import com.animeblack.core.navigation.AnimeHubRoute
import com.animeblack.core.navigation.BlockedUsersRoute
import com.animeblack.core.navigation.CommunityRoute
import com.animeblack.core.navigation.EconomyRoute
import com.animeblack.core.navigation.EditProfileRoute
import com.animeblack.core.navigation.FavoritesRoute
import com.animeblack.core.navigation.FollowListRoute
import com.animeblack.core.navigation.GamesHubRoute
import com.animeblack.core.navigation.LevelsRoute
import com.animeblack.core.navigation.MediaViewerRoute
import com.animeblack.core.navigation.NotificationsRoute
import com.animeblack.core.navigation.PostDetailRoute
import com.animeblack.core.navigation.PrivacySettingsRoute
import com.animeblack.core.navigation.ProfileRoute
import com.animeblack.core.navigation.QrCardRoute
import com.animeblack.core.navigation.ReelsRoute
import com.animeblack.core.navigation.SavedPostsRoute
import com.animeblack.core.navigation.SearchAgentRoute
import com.animeblack.core.navigation.SearchRoute
import com.animeblack.core.navigation.SecurityRoute
import com.animeblack.core.navigation.ServerConfigRoute
import com.animeblack.core.navigation.SettingsRoute
import com.animeblack.core.navigation.SyncDiagnosticsRoute
import com.animeblack.core.navigation.UserPostsRoute
import com.animeblack.core.navigation.WorkspaceRoute
import com.animeblack.core.navigation.canOpenInViewer
import com.animeblack.core.ui.LevelBadgeImage
import com.animeblack.core.ui.PostActions
import com.animeblack.core.ui.PostCard
import com.animeblack.core.ui.UserRow
import com.animeblack.core.ui.compactCount
import com.animeblack.core.ui.displayDescription
import com.animeblack.core.ui.displayName
import com.animeblack.core.ui.openExternalUrl
import com.animeblack.core.ui.rarityColor
import com.animeblack.core.ui.relativeTime
import com.animeblack.core.ui.shareLink
import com.animeblack.core.ui.shareText
import kotlinx.coroutines.delay

// ============================================================================ Hub Models & Sub-Screens (Web PAGES.more parity)

private enum class MoreSubPage {
    None,
    VisualCenter,
    OtakuStats,
    LiveEvents,
    ActivityQuests,
    DeveloperBots,
    GmailSuite,
}

private data class HubItem(
    val id: String,
    val title: String,
    val subtitle: String,
    @DrawableRes val icon: Int,
    val color: Color,
    val category: String,
    val badge: String? = null,
    val onClick: () -> Unit,
)

private data class HubGroupSpec(
    val id: String,
    val title: String,
    val subtitle: String,
    val category: String,
    val accent: Color,
    val items: List<HubItem>,
)

@Composable
private fun QuickAction(@DrawableRes icon: Int, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Column(
        modifier
            .clip(RoundedCornerShape(16.dp))
            .background(AbColors.Charcoal2)
            .border(1.dp, AbColors.GlassBorder, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 10.dp, horizontal = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        AbIcon(icon, null, tint = AbColors.Cyan, size = 22.dp)
        Spacer(Modifier.height(4.dp))
        Text(label, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
fun MoreHubScreen(navigate: (Any) -> Unit, viewModel: MoreViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val me = state.me
    var subPage by rememberSaveable { mutableStateOf(MoreSubPage.None) }
    var selectedCat by rememberSaveable { mutableStateOf("all") }
    var searchQuery by rememberSaveable { mutableStateOf("") }

    if (subPage != MoreSubPage.None) {
        MoreSubScreenHost(
            subPage = subPage,
            me = me,
            state = state,
            onBack = { subPage = MoreSubPage.None },
            navigate = navigate,
        )
        return
    }

    val uid = me?.id.orEmpty()
    val hubCategories = remember {
        listOf(
            "all" to "الكل",
            "social" to "التواصل",
            "entertainment" to "الترفيه",
            "economy" to "الاقتصاد",
            "tools" to "الأدوات",
            "system" to "النظام",
        )
    }

    val shortcuts = remember(state.flags, uid) {
        listOf(
            Triple("الألعاب", AbIcons.SportsEsports, AbColors.Emerald to { navigate(GamesHubRoute) }),
            Triple("المتجر", AbIcons.Storefront, AbColors.Gold to { navigate(EconomyRoute) }),
            Triple("الوكيل الذكي", AbIcons.AutoAwesome, AbColors.Cyan to { navigate(SearchAgentRoute) }),
            Triple("المجتمع", AbIcons.Groups, AbColors.Purple to { navigate(CommunityRoute) }),
            Triple("التفكير", AbIcons.StickyNote2, AbColors.Orange to { navigate(WorkspaceRoute) }),
            Triple("إحصائياتي", AbIcons.Analytics, AbColors.Pink to { subPage = MoreSubPage.OtakuStats }),
        )
    }

    val groups = remember(me, state.flags, state.wallet) {
        listOf(
            HubGroupSpec(
                id = "social",
                title = "التواصل والمجتمع",
                subtitle = "الملف الشخصي، المجموعات، الأصدقاء، والفعاليات",
                category = "social",
                accent = AbColors.Cyan,
                items = listOf(
                    HubItem("profile", "ملفي الشخصي", "عرض وتعديل هويتك ومنشوراتك", AbIcons.Person, AbColors.Cyan, "social") { navigate(ProfileRoute()) },
                    HubItem("community", "المجتمع الشامل", "القروبات، النقابات، والعوالم", AbIcons.Groups, AbColors.Purple, "social", "نشط") { navigate(CommunityRoute) },
                    HubItem("friends", "الأصدقاء والمتابعون", "إدارة قائمة المتابعين والأصدقاء", AbIcons.SupervisorAccount, AbColors.Emerald, "social") {
                        if (uid.isNotBlank()) navigate(FollowListRoute(uid, true)) else navigate(ProfileRoute())
                    },
                    HubItem("events", "الفعاليات والمسابقات", "البطولات الأسبوعية وحروب النقابات", AbIcons.EmojiEvents, AbColors.Gold, "social", "جديد") {
                        subPage = MoreSubPage.LiveEvents
                    },
                    HubItem("notifications", "مركز الإشعارات", "التنبيهات والتفاعلات والردود", AbIcons.Notifications, AbColors.Blue, "social") { navigate(NotificationsRoute) },
                ),
            ),
            HubGroupSpec(
                id = "entertainment",
                title = "الأنمي والترفيه",
                subtitle = "موسوعة الأنمي، صائد الأنمي، الريلز، والمهام",
                category = "entertainment",
                accent = AbColors.Pink,
                items = buildList {
                    add(HubItem("anime", "بوابة الأنمي والمانجا", "أنمي، مانجا، شخصيات، اقتباسات، شروحات", AbIcons.LiveTv, AbColors.Pink, "entertainment", "شامل") { navigate(AnimeHubRoute) })
                    if (state.flags.gamesEnabled) {
                        add(HubItem("games", "صائد الأنمي • الألعاب", "معارك حية، أبطال، مهام، وصناديق", AbIcons.SportsEsports, AbColors.Emerald, "entertainment", "LIVE") { navigate(GamesHubRoute) })
                    }
                    add(HubItem("reels", "الريلز والمقاطع", "مقاطع أنمي قصيرة وتفاعلية", AbIcons.SmartDisplay, AbColors.Violet, "entertainment") { navigate(ReelsRoute) })
                    add(HubItem("quests", "النشاط والمهام اليومية", "أكمل المهام اليومية لربح العملات و XP", AbIcons.Bolt, AbColors.Gold, "entertainment") { subPage = MoreSubPage.ActivityQuests })
                    add(HubItem("stats", "إحصائيات الأوتاكو", "تحليل نشاطك، تفاعلك، وتقدمك في المنصة", AbIcons.Analytics, AbColors.Cyan, "entertainment") { subPage = MoreSubPage.OtakuStats })
                },
            ),
            HubGroupSpec(
                id = "economy",
                title = "الاقتصاد والتخصيص",
                subtitle = "المحفظة، المتجر، المستويات، والمركز البصري",
                category = "economy",
                accent = AbColors.Gold,
                items = listOf(
                    HubItem("wallet", "الاقتصاد والمحفظة", "المتجر، السوق، الحقيبة، والاشتراكات", AbIcons.Paid, AbColors.Gold, "economy", compactCount(state.wallet.coins)) { navigate(EconomyRoute) },
                    HubItem("levels", "الشارات والمستويات", "الشارات، الألقاب، المستويات، وجواز الأوتاكو", AbIcons.MilitaryTech, AbColors.Violet, "economy", "Lv.${state.wallet.level}") { navigate(LevelsRoute) },
                    HubItem("visual", "المركز البصري", "إطارات الأفاتار، التأثيرات، وثيمات النيون", AbIcons.Palette, AbColors.Cyan, "economy", "PRO") { subPage = MoreSubPage.VisualCenter },
                ),
            ),
            HubGroupSpec(
                id = "tools",
                title = "الذكاء والأدوات",
                subtitle = "الوكيل الذكي، مساحة التفكير، والمحفوظات",
                category = "tools",
                accent = AbColors.Blue,
                items = buildList {
                    if (state.flags.agentEnabled) {
                        add(HubItem("agent", "وكيل البحث الذكي AI", "اسأل الذكاء الاصطناعي عن الأنمي والمانجا", AbIcons.AutoAwesome, AbColors.Cyan, "tools", "AI") { navigate(SearchAgentRoute) })
                    }
                    add(HubItem("workspace", "مساحة التفكير", "ملاحظاتك، مراجعاتك، ومسودات النظريات", AbIcons.StickyNote2, AbColors.Orange, "tools") { navigate(WorkspaceRoute) })
                    add(HubItem("saved", "المنشورات المحفوظة", "المنشورات المرجعية التي حفظتها", AbIcons.BookmarkFilled, AbColors.Gold, "tools") { navigate(SavedPostsRoute) })
                    add(HubItem("favorites", "المفضلة وسجل المشاهدة", "قائمة أنمياتك المفضلة وسجل التصفح", AbIcons.FavoriteFilled, AbColors.Rose, "tools") { navigate(FavoritesRoute) })
                    if (uid.isNotBlank()) {
                        add(HubItem("myposts", "منشوراتي", "جميع المنشورات التي شاركتها", AbIcons.Forum, AbColors.Purple, "tools") { navigate(UserPostsRoute(uid)) })
                    }
                    add(HubItem("search", "البحث الشامل", "ابحث عن الأعضاء، المنشورات، القروبات، والأنمي", AbIcons.Search, AbColors.Blue, "tools") { navigate(SearchRoute()) })
                },
            ),
            HubGroupSpec(
                id = "system",
                title = "الإعدادات والنظام",
                subtitle = "الأمان، المزامنة، ربط الحسابات، والمطورون",
                category = "system",
                accent = AbColors.TextSecondary,
                items = buildList {
                    add(HubItem("settings", "الإعدادات الشاملة", "المظهر، الإشعارات، اللغة، والبيانات", AbIcons.Settings, AbColors.Cyan, "system") { navigate(SettingsRoute) })
                    add(HubItem("privacy", "الخصوصية والأمان", "من يراسلني، حالة الاتصال، والجلسات النشطة", AbIcons.Security, AbColors.Emerald, "system") { navigate(PrivacySettingsRoute) })
                    add(HubItem("sync", "حالة المزامنة والسحابة", "فحص الاتصال اللحظي وصندوق الصادر", AbIcons.CloudOff, AbColors.Blue, "system") { navigate(SyncDiagnosticsRoute) })
                    add(HubItem("gmail", "جناح Gmail والربط السحابي", "توثيق البريد، استرداد الحساب، وإشعارات البريد", AbIcons.Mail, AbColors.Rose, "system") { subPage = MoreSubPage.GmailSuite })
                    add(HubItem("devs", "مركز المطورين والبوتات", "أدوات البوتات، Webhooks، ومعاينة API", AbIcons.Code, AbColors.Violet, "system") { subPage = MoreSubPage.DeveloperBots })
                    add(HubItem("server", "إعدادات الخادم", "تكوين خادم الوكيل والخدمات السحابية", AbIcons.Dns, AbColors.Gold, "system") { navigate(ServerConfigRoute) })
                    add(HubItem("blocked", "الحسابات المحظورة", "إدارة قائمة الحظر", AbIcons.Block, AbColors.Rose, "system") { navigate(BlockedUsersRoute) })
                    add(HubItem("switch", "تبديل الحساب", "التنقل السريع بين حساباتك المحفوظة", AbIcons.SupervisorAccount, AbColors.Cyan, "system") { navigate(AccountSwitcherRoute) })
                    if (me?.isModerator == true) {
                        add(HubItem("admin", "لوحة الإدارة والمشرفين", "البلاغات، التوثيق، الأعضاء، والإعلانات", AbIcons.AdminPanelSettings, AbColors.Rose, "system", "ADMIN") { navigate(AdminRoute) })
                    }
                },
            ),
        )
    }

    val filteredGroups = remember(groups, selectedCat, searchQuery) {
        val q = searchQuery.trim()
        groups.filter { selectedCat == "all" || it.category == selectedCat }
            .mapNotNull { g ->
                val matching = if (q.isEmpty()) {
                    g.items
                } else {
                    g.items.filter { it.title.contains(q, ignoreCase = true) || it.subtitle.contains(q, ignoreCase = true) }
                }
                if (matching.isEmpty()) null else g.copy(items = matching)
            }
    }

    Scaffold(
        topBar = {
            AbTopBar(
                title = stringResource(R.string.more_title),
                actions = {
                    IconButton(onClick = { navigate(SyncDiagnosticsRoute) }) {
                        AbIcon(AbIcons.Verified, "حالة المزامنة", tint = AbColors.Emerald)
                    }
                    IconButton(onClick = { navigate(SettingsRoute) }) {
                        AbIcon(AbIcons.Settings, stringResource(R.string.more_settings), tint = AbColors.Cyan)
                    }
                },
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // 1. Luxury Hero Profile Card
            item(key = "hero") {
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = AbColors.Cyan.copy(alpha = 0.28f),
                    onClick = { navigate(ProfileRoute()) },
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Avatar(
                            url = me?.avatar,
                            name = me?.displayName.orEmpty(),
                            size = 64.dp,
                            ring = AvatarRing.StoryUnseen,
                        )
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(me?.displayName.orEmpty(), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black)
                                if (me?.showsVerifiedBadge == true) VerifiedBadge(gold = me.isGoldVerified, size = 16.dp, modifier = Modifier.padding(start = 4.dp))
                                me?.let { u -> state.catalog.badgeFor(u.level)?.let { (_, badge) -> LevelBadgeImage(badge, size = 22.dp, modifier = Modifier.padding(start = 4.dp)) } }
                            }
                            Text(me?.handle.orEmpty(), color = AbColors.TextMuted, style = MaterialTheme.typography.bodySmall)
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 6.dp)) {
                                Pill(stringResource(R.string.more_level, state.wallet.level), color = AbColors.DeepPurple)
                                Pill(compactCount(state.wallet.coins) + " " + stringResource(R.string.eco_coins), color = AbColors.Gold, textColor = AbColors.BrightGold)
                                Pill(compactCount(state.wallet.gems) + " " + stringResource(R.string.eco_gems), color = AbColors.Cyan, textColor = AbColors.Cyan)
                            }
                        }
                        AbIcon(AbIcons.ChevronRight, stringResource(R.string.more_view_profile), tint = AbColors.TextMuted)
                    }
                    if (me != null) {
                        Spacer(Modifier.height(12.dp))
                        val xpFraction = if (me.xpNext > 0) (me.xp.toFloat() / me.xpNext).coerceIn(0f, 1f) else 0f
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                            Text("XP ${me.xp}/${me.xpNext}", style = MaterialTheme.typography.labelSmall, color = AbColors.Cyan, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.width(8.dp))
                            LinearProgressIndicator(
                                progress = { xpFraction },
                                modifier = Modifier.weight(1f).height(6.dp).clip(RoundedCornerShape(3.dp)),
                                color = AbColors.Cyan,
                                trackColor = AbColors.Charcoal4,
                            )
                            Spacer(Modifier.width(8.dp))
                            Text("Lv.${me.level + 1}", style = MaterialTheme.typography.labelSmall, color = AbColors.Violet, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(12.dp))
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            StatMiniCard(
                                icon = AbIcons.StarFilled,
                                value = compactCount(me.reputation),
                                label = "السمعة",
                                iconTint = AbColors.Gold,
                                modifier = Modifier.weight(1f),
                                onClick = { navigate(LevelsRoute) },
                            )
                            StatMiniCard(
                                icon = AbIcons.Groups,
                                value = compactCount(maxOf(me.followersCount, me.followersList.size)),
                                label = "متابع",
                                iconTint = AbColors.Cyan,
                                modifier = Modifier.weight(1f),
                                onClick = { navigate(ProfileRoute()) },
                            )
                            StatMiniCard(
                                icon = AbIcons.Paid,
                                value = compactCount(state.wallet.coins),
                                label = "عملة",
                                iconTint = AbColors.BrightGold,
                                valueColor = AbColors.BrightGold,
                                modifier = Modifier.weight(1f),
                                onClick = { navigate(EconomyRoute) },
                            )
                            StatMiniCard(
                                icon = AbIcons.Diamond,
                                value = compactCount(state.wallet.stars),
                                label = "نجمة",
                                iconTint = AbColors.Violet,
                                modifier = Modifier.weight(1f),
                                onClick = { navigate(EconomyRoute) },
                            )
                        }
                    }
                }
            }

            // 2. Quick Actions Row
            item(key = "quick_actions") {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    QuickAction(AbIcons.QrCode2, stringResource(R.string.more_card), Modifier.weight(1f)) { navigate(QrCardRoute) }
                    QuickAction(AbIcons.Edit, stringResource(R.string.more_edit), Modifier.weight(1f)) { navigate(EditProfileRoute) }
                    QuickAction(AbIcons.Palette, "المظهر", Modifier.weight(1f)) { subPage = MoreSubPage.VisualCenter }
                    QuickAction(AbIcons.SupervisorAccount, stringResource(R.string.more_switch), Modifier.weight(1f)) { navigate(AccountSwitcherRoute) }
                    QuickAction(AbIcons.Share, stringResource(R.string.more_share), Modifier.weight(1f)) {
                        me?.let { u -> context.shareText(u.displayName + "\n" + shareLink("user", u.id), context.getString(com.animeblack.core.ui.R.string.ui_share_via)) }
                    }
                }
            }

            // 3. Shortcuts Bar (matches web SHORTCUTS)
            item(key = "shortcuts") {
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    shortcuts.forEach { (label, icon, pair) ->
                        val (accent, action) = pair
                        GlowChip(
                            text = label,
                            icon = icon,
                            accentColor = accent,
                            onClick = action,
                        )
                    }
                }
            }

            // 4. Anime Hunter Games Promo Banner
            if (state.flags.gamesEnabled) {
                item(key = "games_banner") {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(22.dp))
                            .background(Brush.linearGradient(listOf(Color(0xFF1E1B4B), AbColors.DeepPurple, AbColors.Blue)))
                            .clickable { navigate(GamesHubRoute) }
                            .padding(16.dp),
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconTile(
                                icon = AbIcons.SportsEsports,
                                size = 44.dp,
                                brush = AbColors.GoldGradient,
                            )
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text("صائد الأنمي • ANIME HUNTER", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black, color = Color.White)
                                    Spacer(Modifier.width(6.dp))
                                    Pill("LIVE", color = AbColors.Emerald)
                                }
                                Text("العب، اهزم الوحوش، افتح الأبطال، واجمع العملات الذهبية والجواهر!", style = MaterialTheme.typography.labelSmall, color = Color.White.copy(alpha = 0.85f))
                            }
                            AbIcon(AbIcons.PlayArrowFilled, null, tint = Color.White, size = 28.dp)
                        }
                    }
                }
            }

            // 5. Search & Category Filter Bar (matches web HUB_CATS)
            item(key = "search_and_cats") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    SearchField(
                        query = searchQuery,
                        onQueryChange = { searchQuery = it },
                        placeholder = "ابحث في الأقسام، الأنظمة، والأدوات...",
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        hubCategories.forEach { (key, label) ->
                            GlowChip(
                                text = label,
                                selected = selectedCat == key,
                                accentColor = AbColors.Cyan,
                                onClick = { selectedCat = key },
                            )
                        }
                    }
                }
            }

            // 6. Grouped Hub Sections (matches web HUB_GROUPS)
            items(filteredGroups, key = { it.id }) { group ->
                GlassCard(
                    modifier = Modifier.fillMaxWidth(),
                    borderColor = group.accent.copy(alpha = 0.25f),
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                Modifier.size(10.dp).clip(CircleShape).background(group.accent),
                            )
                            Spacer(Modifier.width(8.dp))
                            Column(Modifier.weight(1f)) {
                                Text(group.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black, color = Color.White)
                                Text(group.subtitle, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            }
                            Pill("${group.items.size}", color = group.accent)
                        }
                        group.items.forEach { item ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(AbColors.Charcoal3.copy(alpha = 0.65f))
                                    .clickable(onClick = item.onClick)
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(42.dp)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(item.color.copy(alpha = 0.16f)),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    AbIcon(item.icon, null, tint = item.color, size = 22.dp)
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(item.title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text(item.subtitle, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                }
                                item.badge?.let { badgeText ->
                                    Pill(badgeText, color = item.color)
                                    Spacer(Modifier.width(6.dp))
                                }
                                AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted, size = 18.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MoreSubScreenHost(
    subPage: MoreSubPage,
    me: User?,
    state: MoreUiState,
    onBack: () -> Unit,
    navigate: (Any) -> Unit,
) {
    val title = when (subPage) {
        MoreSubPage.VisualCenter -> "المركز البصري والمظاهر"
        MoreSubPage.OtakuStats -> "إحصائيات الأوتاكو الشاملة"
        MoreSubPage.LiveEvents -> "الفعاليات والمسابقات الحية"
        MoreSubPage.ActivityQuests -> "النشاط والمهام اليومية"
        MoreSubPage.DeveloperBots -> "مركز المطورين والبوتات"
        MoreSubPage.GmailSuite -> "جناح Gmail والربط السحابي"
        MoreSubPage.None -> ""
    }
    var selectedRing by rememberSaveable { mutableIntStateOf(0) }
    var completedQuests by remember { mutableStateOf(setOf("q_login")) }
    val botTokens = remember { mutableStateListOf("ab_bot_live_98f2a1c4") }

    Scaffold(topBar = { AbTopBar(title = title, onBack = onBack) }) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            when (subPage) {
                MoreSubPage.VisualCenter -> {
                    item {
                        GlassCard(borderColor = AbColors.Cyan.copy(alpha = 0.35f)) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                                val ring = when (selectedRing) {
                                    0 -> AvatarRing.StoryUnseen
                                    1 -> AvatarRing.Gold
                                    else -> AvatarRing.Neon
                                }
                                Avatar(me?.avatar, me?.displayName.orEmpty(), size = 84.dp, ring = ring)
                                Spacer(Modifier.height(8.dp))
                                Text(me?.displayName.orEmpty(), style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black)
                                Text("معاينة حية لإطار الأفاتار والهالة الضوئية", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            }
                        }
                    }
                    item { SectionHeader("إطارات الأفاتار الملكية والنيون") }
                    val frames = listOf(
                        Triple(0, "طيف الأنمي النيون", AbColors.Cyan),
                        Triple(1, "التاج الملكي الذهبي", AbColors.BrightGold),
                        Triple(2, "سايبر فايوليت المتوهج", AbColors.Violet),
                    )
                    items(frames, key = { it.first }) { (idx, name, color) ->
                        GlassCard(
                            borderColor = if (selectedRing == idx) color else AbColors.GlassBorder,
                            onClick = { selectedRing = idx },
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(16.dp).clip(CircleShape).background(color))
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text("تأثير حلقة متوهجة حول صورتك الرمزية في جميع الأقسام", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                }
                                Pill(if (selectedRing == idx) "مُجهّز" else "تفعيل", color = color)
                            }
                        }
                    }
                    item {
                        GradientButton(
                            text = "فتح متجر المظاهر الكامل",
                            icon = AbIcons.Storefront,
                            onClick = { navigate(EconomyRoute) },
                            modifier = Modifier.fillMaxWidth(),
                        )
                    }
                }

                MoreSubPage.OtakuStats -> {
                    item {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            StatMiniCard(AbIcons.MilitaryTech, "Lv.${state.wallet.level}", "المستوى", AbColors.Violet, Modifier.weight(1f))
                            StatMiniCard(AbIcons.StarFilled, compactCount(me?.reputation ?: 15), "السمعة", AbColors.Gold, Modifier.weight(1f))
                            StatMiniCard(AbIcons.Paid, compactCount(state.wallet.coins), "العملات", AbColors.BrightGold, Modifier.weight(1f))
                            StatMiniCard(AbIcons.WorkspacePremium, "${me?.badges?.size ?: 1}", "الشارات", AbColors.Cyan, Modifier.weight(1f))
                        }
                    }
                    item {
                        GlassCard {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text("مؤشر تفاعل الأوتاكو", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black)
                                StatProgressRow("تفاعل المجتمع والمنشورات", 0.78f, AbColors.Cyan)
                                StatProgressRow("معرفة الأنمي والمانجا", 0.85f, AbColors.Purple)
                                StatProgressRow("سجل انتصارات صائد الأنمي", 0.64f, AbColors.Emerald)
                                StatProgressRow("قوة الاقتصاد والمحفظة", 0.72f, AbColors.Gold)
                            }
                        }
                    }
                }

                MoreSubPage.LiveEvents -> {
                    val events = listOf(
                        Triple("حرب النقابات الكبرى • الموسم الخامس", "تعاون مع أعضاء نقابتك لجمع نقاط التفاعل والفوز بـ 10,000 عملة ذهبية ولقب حصري!", AbColors.Gold to CommunityRoute),
                        Triple("بطولة صائد الأنمي الأسبوعية", "حقق أعلى نتيجة في ساحة القتال وتصدر قائمة الصيادين!", AbColors.Emerald to GamesHubRoute),
                        Triple("مهرجان مراجعات ونظريات الأنمي", "شارك أفضل نظرية أو مراجعة أنمي واحصل على شارة الناقد الأسطوري!", AbColors.Cyan to AnimeHubRoute),
                    )
                    items(events, key = { it.first }) { (evTitle, desc, pair) ->
                        val (accent, targetRoute) = pair
                        GlassCard(borderColor = accent.copy(alpha = 0.4f), onClick = { navigate(targetRoute) }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconTile(icon = AbIcons.EmojiEvents, brush = AbColors.GoldGradient)
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(evTitle, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black)
                                    Text(desc, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                                }
                                Pill("انضمام", color = accent)
                            }
                        }
                    }
                }

                MoreSubPage.ActivityQuests -> {
                    val quests = listOf(
                        Triple("q_login", "تسجيل الدخول اليومي للمنصة", "+50 عملة • +25 XP"),
                        Triple("q_post", "نشر منشور أو نظرية أنمي في الموجز", "+30 عملة • +20 XP"),
                        Triple("q_chat", "التفاعل في الدردشة أو القروبات", "+25 عملة • +15 XP"),
                        Triple("q_game", "خوض جولة في صائد الأنمي", "+40 عملة • +30 XP"),
                    )
                    item {
                        GlassCard(borderColor = AbColors.Gold.copy(alpha = 0.35f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconTile(icon = AbIcons.Bolt, brush = AbColors.GoldGradient)
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text("تقدم المهام اليومية: ${completedQuests.size}/${quests.size}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black)
                                    Spacer(Modifier.height(6.dp))
                                    LinearProgressIndicator(
                                        progress = { completedQuests.size.toFloat() / quests.size },
                                        modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                                        color = AbColors.Gold,
                                        trackColor = AbColors.Charcoal4,
                                    )
                                }
                            }
                        }
                    }
                    items(quests, key = { it.first }) { (qid, qTitle, reward) ->
                        val done = qid in completedQuests
                        GlassCard(
                            onClick = { completedQuests = if (done) completedQuests - qid else completedQuests + qid },
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AbIcon(
                                    icon = if (done) AbIcons.CheckCircle else AbIcons.Schedule,
                                    contentDescription = null,
                                    tint = if (done) AbColors.Emerald else AbColors.Cyan,
                                    size = 24.dp,
                                )
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(qTitle, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text(reward, style = MaterialTheme.typography.labelSmall, color = AbColors.BrightGold)
                                }
                                Pill(if (done) "مكتملة" else "إنجاز", color = if (done) AbColors.Emerald else AbColors.Cyan)
                            }
                        }
                    }
                }

                MoreSubPage.DeveloperBots -> {
                    item {
                        GlassCard(borderColor = AbColors.Violet.copy(alpha = 0.35f)) {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    IconTile(icon = AbIcons.Code, brush = AbColors.CyanVioletGradient)
                                    Spacer(Modifier.width(12.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text("بوابة مطوري Anime Black و Webhooks", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black)
                                        Text("أنشئ بوتات تفاعلية للقروبات والنقابات واربطها عبر مفاتيح API", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                    }
                                }
                                GradientButton(
                                    text = "توليد مفتاح بوت جديد",
                                    icon = AbIcons.Add,
                                    onClick = { botTokens.add("ab_bot_live_" + System.currentTimeMillis().toString().takeLast(6)) },
                                    modifier = Modifier.fillMaxWidth(),
                                )
                            }
                        }
                    }
                    items(botTokens, key = { it }) { token ->
                        GlassCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AbIcon(AbIcons.SmartToy, null, tint = AbColors.Cyan)
                                Spacer(Modifier.width(10.dp))
                                Column(Modifier.weight(1f)) {
                                    Text("Bot Token", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                    Text(token, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Bold)
                                }
                                Pill("نشط", color = AbColors.Emerald)
                            }
                        }
                    }
                }

                MoreSubPage.GmailSuite -> {
                    item {
                        GlassCard(borderColor = AbColors.Rose.copy(alpha = 0.35f)) {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    IconTile(icon = AbIcons.Mail, brush = AbColors.FireGradient)
                                    Spacer(Modifier.width(12.dp))
                                    Column(Modifier.weight(1f)) {
                                        Text("حالة ربط البريد الإلكتروني", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Black)
                                        Text(me?.email?.ifBlank { "حساب ضيف — غير مربوط ببريد" } ?: "غير مربوط", style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                                    }
                                    Pill(if (me?.email?.isNotBlank() == true) "متصل" else "ضيف", color = if (me?.email?.isNotBlank() == true) AbColors.Emerald else AbColors.Gold)
                                }
                                Text("يوفّر جناح Gmail حماية إضافية لحسابك، استعادة فورية لكلمة المرور، وتنبيهات الأمان المباشرة.", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                GradientButton(
                                    text = "إدارة أمان الحساب والجلسات",
                                    icon = AbIcons.Security,
                                    onClick = { navigate(SecurityRoute) },
                                    modifier = Modifier.fillMaxWidth(),
                                )
                            }
                        }
                    }
                }

                MoreSubPage.None -> Unit
            }
        }
    }
}

@Composable
private fun StatProgressRow(label: String, fraction: Float, color: Color) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(label, style = MaterialTheme.typography.labelMedium)
            Text("${(fraction * 100).toInt()}%", style = MaterialTheme.typography.labelMedium, color = color, fontWeight = FontWeight.Bold)
        }
        LinearProgressIndicator(
            progress = { fraction },
            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
            color = color,
            trackColor = AbColors.Charcoal4,
        )
    }
}

// ============================================================================ Economy (6-Tab Web Parity: المتجر، السوق، الحقيبة، المظاهر، الاشتراكات، الإحصاءات)

private data class StoreUiItem(
    val id: String,
    val name: String,
    val desc: String,
    val category: String,
    val price: Long,
    val currency: String,
    @DrawableRes val icon: Int,
    val color: Color,
)

private val STORE_ITEMS = listOf(
    StoreUiItem("frame_neon_cyan", "إطار النيون السماوي", "حلقة طيف سماوي متوهج حول صورتك الرمزية", "إطارات", 250, "coins", AbIcons.AccountCircle, AbColors.Cyan),
    StoreUiItem("frame_royal_gold", "الإطار الملكي الذهبي", "إطار ذهبي فاخر لنخبة الأوتاكو", "إطارات", 600, "coins", AbIcons.WorkspacePremium, AbColors.BrightGold),
    StoreUiItem("title_shogun", "لقب: شوغون الأنمي", "يظهر بجانب اسمك في المنشورات والدردشة", "ألقاب", 400, "coins", AbIcons.MilitaryTech, AbColors.Violet),
    StoreUiItem("title_hunter", "لقب: صياد الأساطير", "لقب خاص بمحترفي ساحة القتال", "ألقاب", 500, "coins", AbIcons.Shield, AbColors.Emerald),
    StoreUiItem("effect_aurora", "تأثير الشفق القطبي", "خلفية متحركة لبطاقة ملفك الشخصي", "تأثيرات", 25, "stars", AbIcons.AutoAwesome, AbColors.Pink),
    StoreUiItem("badge_founder", "شارة المؤسس النادرة", "شارة شرفية تظهر في ملفك الشخصي", "شارات", 50, "stars", AbIcons.Verified, AbColors.Gold),
)

@Composable
fun EconomyScreen(onBack: () -> Unit, viewModel: EconomyViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    var activeTab by rememberSaveable { mutableIntStateOf(0) }
    val ownedLocal = remember { mutableStateListOf("frame_neon_cyan") }
    var equippedItem by rememberSaveable { mutableStateOf("frame_neon_cyan") }
    var activeTheme by rememberSaveable { mutableStateOf("obsidian_neon") }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            now = System.currentTimeMillis()
            delay(1_000)
        }
    }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.claimed.collect { (c, g) -> snackbar.showSnackbar(context.getString(R.string.eco_claimed, c.toInt(), g.toInt())) } }

    val w = state.wallet
    val tabs = listOf(
        "المتجر" to AbIcons.Storefront,
        "السوق والتحويل" to AbIcons.Send,
        "الحقيبة" to AbIcons.Inventory2,
        "المظاهر" to AbIcons.Palette,
        "الاشتراكات" to AbIcons.WorkspacePremium,
        "الإحصاءات" to AbIcons.Analytics,
    )

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.eco_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        LazyColumn(
            Modifier.fillMaxSize().padding(padding).imePadding(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            // Hero Wallet Card
            item(key = "wallet_hero") {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp))
                        .background(Brush.linearGradient(listOf(AbColors.DeepPurple, AbColors.Blue)))
                        .padding(20.dp),
                ) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        Balance(stringResource(R.string.eco_coins), w.coins, AbColors.Gold)
                        Balance(stringResource(R.string.eco_stars), w.stars, Color.White)
                        Balance(stringResource(R.string.eco_gems), w.gems, AbColors.Cyan)
                    }
                }
            }

            // Daily Reward Card
            item(key = "daily_reward") {
                GlassCard(Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AbIcon(AbIcons.Redeem, null, tint = AbColors.Gold, size = 30.dp)
                        Spacer(Modifier.width(12.dp))
                        Column(Modifier.weight(1f)) {
                            Text(stringResource(R.string.eco_daily), style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                            Text(stringResource(R.string.eco_streak, w.dailyStreak), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            if (!w.canClaimDaily(now)) {
                                Text(
                                    stringResource(R.string.eco_next_claim, DateUtils.formatElapsedTime((w.nextClaimAt() - now).coerceAtLeast(0) / 1000)),
                                    style = MaterialTheme.typography.labelSmall,
                                    color = AbColors.Violet,
                                )
                            }
                        }
                        GradientButton(stringResource(R.string.eco_claim), onClick = viewModel::claimDaily, enabled = w.canClaimDaily(now), loading = state.claiming)
                    }
                }
            }

            // 6-Tab Row
            item(key = "eco_tabs") {
                PrimaryScrollableTabRow(selectedTabIndex = activeTab, containerColor = Color.Transparent, edgePadding = 0.dp) {
                    tabs.forEachIndexed { idx, (label, icon) ->
                        Tab(
                            selected = activeTab == idx,
                            onClick = { activeTab = idx },
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AbIcon(icon, null, tint = if (activeTab == idx) AbColors.Cyan else AbColors.TextMuted, size = 16.dp)
                                    Spacer(Modifier.width(6.dp))
                                    Text(label)
                                }
                            },
                        )
                    }
                }
            }

            when (activeTab) {
                // 0: المتجر
                0 -> {
                    item { SectionHeader("متجر الأوتاكو الفاخر") }
                    items(STORE_ITEMS, key = { it.id }) { item ->
                        val owned = item.id in ownedLocal
                        val equipped = equippedItem == item.id
                        GlassCard(borderColor = item.color.copy(alpha = 0.3f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    Modifier.size(48.dp).clip(RoundedCornerShape(14.dp)).background(item.color.copy(alpha = 0.16f)),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    AbIcon(item.icon, null, tint = item.color, size = 26.dp)
                                }
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(item.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                        Spacer(Modifier.width(6.dp))
                                        Pill(item.category, color = item.color)
                                    }
                                    Text(item.desc, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                    Text("${item.price} ${if (item.currency == "stars") "نجمة" else "عملة"}", style = MaterialTheme.typography.labelMedium, color = AbColors.BrightGold, fontWeight = FontWeight.Bold)
                                }
                                Spacer(Modifier.width(8.dp))
                                GradientButton(
                                    text = when {
                                        equipped -> "مُجهّز"
                                        owned -> "تجهيز"
                                        else -> "شراء"
                                    },
                                    onClick = {
                                        if (!owned) ownedLocal.add(item.id)
                                        equippedItem = item.id
                                    },
                                )
                            }
                        }
                    }
                }

                // 1: السوق والتحويل
                1 -> {
                    item { SectionHeader(stringResource(R.string.eco_transfer)) }
                    item {
                        GlassCard(Modifier.fillMaxWidth()) {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                SearchField(query = state.recipientQuery, onQueryChange = viewModel::onRecipientQuery, placeholder = stringResource(R.string.eco_search_user))
                                if (state.recipient == null) {
                                    state.recipientResults.forEach { u -> UserRow(user = u, onClick = { viewModel.pickRecipient(u) }) }
                                } else {
                                    state.recipient?.let { u -> UserRow(user = u, subtitle = stringResource(R.string.eco_recipient)) }
                                }
                                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    listOf("coins" to R.string.eco_coins, "stars" to R.string.eco_stars).forEach { (key, label) ->
                                        FilterChip(selected = state.currency == key, onClick = { viewModel.update { it.copy(currency = key) } }, label = { Text(stringResource(label)) })
                                    }
                                }
                                AbTextField(state.amount, { v -> viewModel.update { it.copy(amount = v.filter(Char::isDigit).take(9)) } }, label = stringResource(R.string.eco_amount), leadingIcon = AbIcons.Paid)
                                AbTextField(state.note, { v -> viewModel.update { it.copy(note = v.take(140)) } }, label = stringResource(R.string.eco_note))
                                GradientButton(
                                    stringResource(R.string.eco_send),
                                    onClick = viewModel::transfer,
                                    enabled = state.recipient != null && state.amount.isNotBlank(),
                                    loading = state.sending,
                                    icon = AbIcons.Send,
                                    modifier = Modifier.fillMaxWidth(),
                                )
                            }
                        }
                    }
                }

                // 2: الحقيبة
                2 -> {
                    item { SectionHeader("مقتنياتك في الحقيبة") }
                    val myItems = STORE_ITEMS.filter { it.id in ownedLocal }
                    items(myItems, key = { "bag_" + it.id }) { item ->
                        val equipped = equippedItem == item.id
                        GlassCard {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AbIcon(item.icon, null, tint = item.color, size = 26.dp)
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(item.name, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text(item.desc, style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                }
                                Pill(
                                    text = if (equipped) "مُجهّز حالياً" else "تجهيز",
                                    color = if (equipped) AbColors.Emerald else AbColors.Cyan,
                                    modifier = Modifier.clickable { equippedItem = item.id },
                                )
                            }
                        }
                    }
                }

                // 3: المظاهر
                3 -> {
                    item { SectionHeader("مظاهر وثيمات المنصة") }
                    val themes = listOf(
                        Triple("obsidian_neon", "Obsidian Cyber Neon (الافتراضي)", AbColors.Cyan),
                        Triple("royal_gold", "Royal Otaku Gold (الملكي)", AbColors.BrightGold),
                        Triple("crimson_eclipse", "Crimson Eclipse (القرمزي)", AbColors.Rose),
                        Triple("aurora_violet", "Aurora Violet (الشفق البنفسجي)", AbColors.Violet),
                    )
                    items(themes, key = { it.first }) { (id, title, accent) ->
                        GlassCard(borderColor = if (activeTheme == id) accent else AbColors.GlassBorder, onClick = { activeTheme = id }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(28.dp).clip(CircleShape).background(accent))
                                Spacer(Modifier.width(12.dp))
                                Text(title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                                Pill(if (activeTheme == id) "نشط" else "اختيار", color = accent)
                            }
                        }
                    }
                }

                // 4: الاشتراكات
                4 -> {
                    item { SectionHeader("باقات VIP للأوتاكو") }
                    val plans = listOf(
                        Triple("VIP Silver", "شارة فضية • +20% XP إضافي • إطارات خاصة", "500 عملة / شهر" to AbColors.Cyan),
                        Triple("VIP Gold Pro", "شارة التحقق الذهبية • +50% XP • جميع إطارات المتجر", "1,200 عملة / شهر" to AbColors.BrightGold),
                        Triple("Otaku Legend", "لقب أسطوري متحرك • ضعف المكافأة اليومية • أولوية النقابات", "2,500 عملة / شهر" to AbColors.Purple),
                    )
                    items(plans, key = { it.first }) { (name, perks, pair) ->
                        val (price, color) = pair
                        GlassCard(borderColor = color.copy(alpha = 0.45f)) {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AbIcon(AbIcons.WorkspacePremium, null, tint = color, size = 24.dp)
                                    Spacer(Modifier.width(8.dp))
                                    Text(name, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Black, color = color, modifier = Modifier.weight(1f))
                                    Pill(price, color = color)
                                }
                                Text(perks, style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                            }
                        }
                    }
                }

                // 5: الإحصاءات والسجل
                else -> {
                    item { SectionHeader(stringResource(R.string.eco_history)) }
                    if (state.transactions.isEmpty()) {
                        item { Text(stringResource(R.string.eco_no_history), color = AbColors.TextMuted) }
                    }
                    items(state.transactions, key = { it.id }) { t ->
                        val incoming = (t.toUid == state.myUid && t.fromUid != state.myUid) || t.type == "daily" || t.amount > 0
                        Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                            AbIcon(if (incoming) AbIcons.ArrowDownward else AbIcons.ArrowUpward, null, tint = if (incoming) AbColors.Emerald else AbColors.Rose)
                            Spacer(Modifier.width(10.dp))
                            Column(Modifier.weight(1f)) {
                                Text(t.reason.ifBlank { t.type }, style = MaterialTheme.typography.bodyMedium, maxLines = 1)
                                Text(relativeTime(t.at), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            }
                            Text((if (incoming) "+" else "−") + compactCount(kotlin.math.abs(t.amount)) + " " + t.currency, color = if (incoming) AbColors.Emerald else AbColors.Rose, style = MaterialTheme.typography.labelLarge)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Balance(label: String, value: Long, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(compactCount(value), style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold, color = color)
        Text(label, style = MaterialTheme.typography.labelMedium, color = Color.White.copy(alpha = 0.8f))
    }
}

// ============================================================================ Levels (4-Tab Web Parity: الشارات، الألقاب، المستويات، جواز الأوتاكو)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LevelsScreen(onBack: () -> Unit, viewModel: LevelsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var activeTab by rememberSaveable { mutableIntStateOf(0) }
    var selectedTitle by rememberSaveable { mutableStateOf("") }

    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.levels_title), onBack = onBack) }) { padding ->
        val user = state.me
        if (user == null) {
            LoadingState(Modifier.padding(padding))
            return@Scaffold
        }
        val rank = rankFor(user.level)
        val next = nextRank(user.level)
        val current = state.catalog.badgeFor(user.level)
        val tabs = listOf(
            "الشارات" to AbIcons.WorkspacePremium,
            "الألقاب" to AbIcons.MilitaryTech,
            "المستويات" to AbIcons.TrendingUp,
            "جواز الأوتاكو" to AbIcons.CardGiftcard,
        )

        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item(key = "hero") {
                Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(24.dp)).background(AbColors.AuroraGradient).padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    current?.let { (_, badge) -> LevelBadgeImage(badge, size = 72.dp) }
                    Text(stringResource(R.string.levels_current), color = Color.White.copy(alpha = 0.8f), modifier = Modifier.padding(top = 8.dp))
                    Text(user.level.toString(), style = MaterialTheme.typography.displayMedium, fontWeight = FontWeight.Black, color = Color.White)
                    Text(stringResource(R.string.levels_rank, rank.displayName()), color = Color.White, style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(10.dp))
                    LinearProgressIndicator(
                        progress = { if (user.xpNext > 0) (user.xp.toFloat() / user.xpNext).coerceIn(0f, 1f) else 0f },
                        modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                        color = Color.White,
                        trackColor = Color.White.copy(alpha = 0.25f),
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(stringResource(R.string.levels_progress, user.xp.toInt(), user.xpNext.toInt(), user.level + 1), color = Color.White, style = MaterialTheme.typography.labelMedium)
                    Text(
                        next?.let { stringResource(R.string.levels_next_rank, it.displayName(), it.level) } ?: stringResource(R.string.levels_max_rank),
                        color = Color.White.copy(alpha = 0.8f),
                        style = MaterialTheme.typography.labelSmall,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }

            item(key = "tabs") {
                PrimaryScrollableTabRow(selectedTabIndex = activeTab, containerColor = Color.Transparent, edgePadding = 0.dp) {
                    tabs.forEachIndexed { idx, (label, icon) ->
                        Tab(
                            selected = activeTab == idx,
                            onClick = { activeTab = idx },
                            text = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AbIcon(icon, null, tint = if (activeTab == idx) AbColors.Cyan else AbColors.TextMuted, size = 16.dp)
                                    Spacer(Modifier.width(6.dp))
                                    Text(label)
                                }
                            },
                        )
                    }
                }
            }

            when (activeTab) {
                // 0: الشارات
                0 -> {
                    item { SectionHeader(stringResource(R.string.levels_achievements)) }
                    items(ACHIEVEMENT_BADGES, key = { "ach_" + it.id }) { badge ->
                        val earned = badge.id in user.badges
                        val color = rarityColor(badge.rarity)
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(AbColors.Charcoal2).padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Box(Modifier.size(44.dp).clip(RoundedCornerShape(14.dp)).background(color.copy(alpha = if (earned) 0.22f else 0.08f)), contentAlignment = Alignment.Center) {
                                AbIcon(achievementIcon(badge.icon), null, tint = if (earned) color else AbColors.TextMuted)
                            }
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(badge.displayName(), style = MaterialTheme.typography.titleSmall, color = if (earned) AbColors.TextPrimary else AbColors.TextMuted)
                                Text(badge.displayDescription(), style = MaterialTheme.typography.bodySmall, color = AbColors.TextSecondary)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(stringResource(rarityLabel(badge.rarity)), style = MaterialTheme.typography.labelSmall, color = color)
                                if (earned) Text(stringResource(R.string.levels_earned), style = MaterialTheme.typography.labelSmall, color = AbColors.Emerald)
                            }
                        }
                    }
                }

                // 1: الألقاب
                1 -> {
                    item { SectionHeader("الألقاب الملكية وألقاب الأوتاكو") }
                    val allTitles = (user.titles + listOf("مبتدئ الأوتاكو", "صياد الأساطير", "حكيم الأنمي", "نجم المجتمع", "فارس الظلام", "شوغون النقابات")).distinct()
                    items(allTitles, key = { "title_$it" }) { t ->
                        val active = (selectedTitle.ifBlank { user.equippedTitle.orEmpty() }) == t
                        GlassCard(
                            borderColor = if (active) AbColors.Cyan else AbColors.GlassBorder,
                            onClick = { selectedTitle = t },
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                AbIcon(AbIcons.MilitaryTech, null, tint = if (active) AbColors.Cyan else AbColors.Gold, size = 24.dp)
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(t, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text("يظهر بجانب اسمك في المنشورات والملف الشخصي", style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                }
                                Pill(if (active) "مُجهّز" else "اختيار", color = if (active) AbColors.Emerald else AbColors.Purple)
                            }
                        }
                    }
                }

                // 2: المستويات
                2 -> {
                    item { SectionHeader(stringResource(R.string.levels_road)) }
                    items(state.catalog.road(), key = { "road_" + it.first }) { (level, badge) ->
                        val unlocked = user.level >= level
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp))
                                .background(if (current?.first == level) AbColors.DeepPurple.copy(alpha = 0.25f) else AbColors.Charcoal2).padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            LevelBadgeImage(badge, size = 44.dp, locked = !unlocked)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(badge.displayName(), style = MaterialTheme.typography.titleSmall, color = if (unlocked) AbColors.TextPrimary else AbColors.TextMuted)
                                Text(stringResource(R.string.more_level, level), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                            }
                            if (unlocked) {
                                Pill(stringResource(R.string.levels_unlocked), color = AbColors.Emerald)
                            } else {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    AbIcon(AbIcons.Lock, null, tint = AbColors.TextMuted, size = 16.dp)
                                    Spacer(Modifier.width(4.dp))
                                    Text(stringResource(R.string.levels_reach, level), style = MaterialTheme.typography.labelSmall, color = AbColors.TextMuted)
                                }
                            }
                        }
                    }
                }

                // 3: جواز الأوتاكو (Otaku Pass)
                else -> {
                    item { SectionHeader("جواز الأوتاكو الموسمي • OTAKU PASS") }
                    val tiers = (1..10).map { tier ->
                        Triple(tier, "المستوى الموسمي $tier", "${tier * 100} عملة ذهبية + صندوق جواهر")
                    }
                    items(tiers, key = { "pass_" + it.first }) { (tier, tierName, reward) ->
                        val unlocked = user.level >= tier
                        GlassCard(borderColor = if (unlocked) AbColors.Gold.copy(alpha = 0.4f) else AbColors.GlassBorder) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                IconTile(icon = AbIcons.CardGiftcard, brush = if (unlocked) AbColors.GoldGradient else AbColors.CyanVioletGradient)
                                Spacer(Modifier.width(12.dp))
                                Column(Modifier.weight(1f)) {
                                    Text(tierName, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                                    Text(reward, style = MaterialTheme.typography.labelSmall, color = AbColors.BrightGold)
                                }
                                Pill(if (unlocked) "متاح" else "Lv.$tier", color = if (unlocked) AbColors.Emerald else AbColors.Charcoal4)
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun rarityLabel(rarity: String): Int = when (rarity.lowercase()) {
    "rare" -> R.string.levels_rarity_rare
    "epic" -> R.string.levels_rarity_epic
    "legendary" -> R.string.levels_rarity_legendary
    else -> R.string.levels_rarity_common
}

private fun achievementIcon(icon: String): Int = when (icon) {
    "compass" -> AbIcons.Explore
    "sparkles" -> AbIcons.AutoAwesome
    "crown" -> AbIcons.WorkspacePremium
    "heart" -> AbIcons.FavoriteFilled
    else -> AbIcons.StarFilled
}

// ============================================================================ Workspace

@Composable
fun WorkspaceScreen(onBack: () -> Unit, viewModel: WorkspaceViewModel = hiltViewModel()) {
    val thoughts by viewModel.thoughts.collectAsStateWithLifecycle()
    val query by viewModel.query.collectAsStateWithLifecycle()
    var editing by remember { mutableStateOf<Thought?>(null) }
    var creating by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf<Thought?>(null) }
    Scaffold(
        topBar = { AbTopBar(title = stringResource(R.string.ws_title), onBack = onBack) },
        floatingActionButton = {
            FloatingActionButton(onClick = { creating = true }, containerColor = AbColors.Purple, contentColor = Color.White) {
                AbIcon(AbIcons.NoteAdd, stringResource(R.string.ws_new))
            }
        },
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {
            SearchField(query = query, onQueryChange = { viewModel.query.value = it }, placeholder = stringResource(R.string.ws_search), modifier = Modifier.fillMaxWidth().padding(16.dp))
            val list = thoughts
            when {
                list == null -> LoadingState()
                list.isEmpty() -> EmptyState(title = stringResource(R.string.ws_empty), icon = AbIcons.StickyNote2)
                else -> LazyColumn(contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 96.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(list, key = { it.id }) { t ->
                        GlassCard(Modifier.fillMaxWidth(), onClick = { editing = t }) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(t.title.ifBlank { t.text.take(40) }, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
                                AbIcon(
                                    if (t.pinned) AbIcons.PushPinFilled else AbIcons.PushPin,
                                    stringResource(R.string.ws_pin),
                                    tint = if (t.pinned) AbColors.Gold else AbColors.TextMuted,
                                    size = 20.dp,
                                    modifier = Modifier.clickable { viewModel.togglePin(t) },
                                )
                                Spacer(Modifier.width(12.dp))
                                AbIcon(AbIcons.Delete, stringResource(R.string.ws_delete), tint = AbColors.TextMuted, size = 20.dp, modifier = Modifier.clickable { deleting = t })
                            }
                            if (t.text.isNotBlank()) Text(t.text, color = AbColors.TextSecondary, maxLines = 4, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 6.dp))
                            if (t.tags.isNotEmpty()) Text(t.tags.joinToString("  ") { "#$it" }, color = AbColors.Cyan, style = MaterialTheme.typography.labelSmall, modifier = Modifier.padding(top = 6.dp))
                            Text(relativeTime(t.updatedAt), color = AbColors.TextMuted, style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
    }
    if (creating || editing != null) {
        val existing = editing
        var title by remember(existing?.id) { mutableStateOf(existing?.title.orEmpty()) }
        var text by remember(existing?.id) { mutableStateOf(existing?.text.orEmpty()) }
        var tags by remember(existing?.id) { mutableStateOf(existing?.tags?.joinToString(", ").orEmpty()) }
        var pinned by remember(existing?.id) { mutableStateOf(existing?.pinned == true) }
        AlertDialog(
            onDismissRequest = {
                creating = false
                editing = null
            },
            containerColor = AbColors.Charcoal2,
            title = { Text(if (existing == null) stringResource(R.string.ws_new) else existing.title.ifBlank { stringResource(R.string.ws_title) }) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    AbTextField(title, { title = it }, label = stringResource(R.string.ws_title_hint))
                    AbTextField(text, { text = it }, label = stringResource(R.string.ws_text_hint), singleLine = false, minLines = 5)
                    AbTextField(tags, { tags = it }, label = stringResource(R.string.ws_tags_hint), leadingIcon = AbIcons.Tag)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.ws_pin), modifier = Modifier.weight(1f))
                        Switch(checked = pinned, onCheckedChange = { pinned = it })
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    if (title.isNotBlank() || text.isNotBlank()) viewModel.save(existing, title, text, tags, pinned)
                    creating = false
                    editing = null
                }) { Text(stringResource(R.string.ws_save)) }
            },
            dismissButton = {
                TextButton(onClick = {
                    creating = false
                    editing = null
                }) { Text(stringResource(com.animeblack.core.ui.R.string.ui_cancel)) }
            },
        )
    }
    deleting?.let { t ->
        ConfirmDialog(
            title = stringResource(R.string.ws_delete),
            message = stringResource(R.string.ws_delete_confirm),
            onConfirm = {
                viewModel.delete(t)
                deleting = null
            },
            onDismiss = { deleting = null },
            destructive = true,
        )
    }
}

// ============================================================================ Saved & user posts

@Composable
private fun postActions(navigate: (Any) -> Unit, openMention: (String) -> Unit, like: (Post) -> Unit, react: (Post, String) -> Unit, save: (Post, Boolean) -> Unit, vote: (Post, String) -> Unit): PostActions {
    val context = LocalContext.current
    return PostActions(
        onOpen = { navigate(PostDetailRoute(it.id)) },
        onAuthor = { navigate(ProfileRoute(it)) },
        onLike = like,
        onReact = react,
        onComment = { navigate(PostDetailRoute(it.id, true)) },
        onSave = save,
        onVote = vote,
        onMedia = { if (canOpenInViewer(it.src)) navigate(MediaViewerRoute(it.src, it.type)) },
        onHashtag = { navigate(SearchRoute("#$it")) },
        onMention = openMention,
        onUrl = { context.openExternalUrl(it) },
    )
}

@Composable
fun SavedPostsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, openMention: (String) -> Unit, viewModel: SavedPostsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val actions = postActions(navigate, openMention, { viewModel.like(it) }, { p, k -> viewModel.react(p, k) }, { p, s -> viewModel.save(p, s) }, { p, o -> viewModel.vote(p, o) })
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.saved_title), onBack = onBack) }) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.posts.isEmpty() -> EmptyState(title = stringResource(R.string.saved_empty), message = stringResource(R.string.saved_empty_hint), icon = AbIcons.Bookmark, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
                items(state.posts, key = { it.id }) { p ->
                    PostCard(post = p, myUid = state.myUid, saved = p.id in state.savedIds, actions = actions, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp))
                }
            }
        }
    }
}

@Composable
fun UserPostsScreen(onBack: () -> Unit, navigate: (Any) -> Unit, openMention: (String) -> Unit, viewModel: UserPostsViewModel = hiltViewModel()) {
    val posts = viewModel.paged.collectAsLazyPagingItems()
    val meta by viewModel.meta.collectAsStateWithLifecycle()
    val actions = postActions(navigate, openMention, { viewModel.like(it) }, { p, k -> viewModel.react(p, k) }, { p, s -> viewModel.save(p, s) }, { p, o -> viewModel.vote(p, o) })
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.userposts_title), onBack = onBack) }) { padding ->
        LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(vertical = 8.dp)) {
            items(count = posts.itemCount, key = posts.itemKey { it.id }) { i ->
                posts[i]?.let { p ->
                    PostCard(post = p, myUid = meta.first, saved = p.id in meta.second, actions = actions, modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp))
                }
            }
        }
    }
}

// ============================================================================ Favourites

@Composable
fun FavoritesScreen(onBack: () -> Unit, navigate: (Any) -> Unit, viewModel: FavoritesViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.fav_title), onBack = onBack) }) { padding ->
        when {
            state.loading -> LoadingState(Modifier.padding(padding))
            state.favorites.isEmpty() && state.history.isEmpty() -> EmptyState(title = stringResource(R.string.fav_empty), icon = AbIcons.FavoriteFilled, modifier = Modifier.padding(padding))
            else -> LazyColumn(Modifier.fillMaxSize().padding(padding), contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (state.history.isNotEmpty()) {
                    item { SectionHeader(stringResource(R.string.fav_history)) }
                    items(state.history, key = { "h_" + it.id }) { h ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).clickable { openAnime(h.id, navigate) }.padding(6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AsyncImage(model = h.cover, contentDescription = h.title, modifier = Modifier.size(width = 46.dp, height = 64.dp).clip(RoundedCornerShape(8.dp)))
                            Spacer(Modifier.width(12.dp))
                            Text(h.title, style = MaterialTheme.typography.titleSmall, modifier = Modifier.weight(1f), maxLines = 2)
                        }
                    }
                }
                if (state.favorites.isNotEmpty()) {
                    item { SectionHeader(stringResource(R.string.fav_anime)) }
                    items(state.favorites, key = { "f_$it" }) { key ->
                        Row(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).clickable { openAnime(key, navigate) }.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            AbIcon(AbIcons.FavoriteFilled, null, tint = AbColors.Rose)
                            Spacer(Modifier.width(12.dp))
                            Text(key.substringAfter(':'), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
                            AbIcon(AbIcons.ChevronRight, null, tint = AbColors.TextMuted)
                        }
                    }
                }
            }
        }
    }
}

private fun openAnime(key: String, navigate: (Any) -> Unit) {
    val id = key.substringAfter(':')
    if (id.isNotBlank()) navigate(AnimeDetailRoute(id))
}

// ============================================================================ Report

@Composable
fun ReportScreen(onBack: () -> Unit, viewModel: ReportViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val snackbar = remember { SnackbarHostState() }
    LaunchedEffect(Unit) { viewModel.messages.collect { snackbar.showSnackbar(context.getString(it)) } }
    LaunchedEffect(Unit) { viewModel.done.collect { onBack() } }
    Scaffold(topBar = { AbTopBar(title = stringResource(R.string.report_title), onBack = onBack) }, snackbarHost = { SnackbarHost(snackbar) }) { padding ->
        Column(Modifier.fillMaxSize().padding(padding).imePadding().verticalScroll(rememberScrollState()).padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(stringResource(R.string.report_reason), style = MaterialTheme.typography.titleMedium)
            REPORT_REASONS.forEach { (key, label) ->
                Row(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).selectable(selected = state.reason == key, onClick = { viewModel.update { it.copy(reason = key) } }).padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    RadioButton(selected = state.reason == key, onClick = null)
                    Spacer(Modifier.width(8.dp))
                    Text(stringResource(label))
                }
            }
            AbTextField(state.details, { v -> viewModel.update { it.copy(details = v.take(1_000)) } }, label = stringResource(R.string.report_details), singleLine = false, minLines = 3)
            GradientButton(stringResource(R.string.report_send), onClick = viewModel::send, loading = state.sending, icon = AbIcons.Flag, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        }
    }
}
