package com.policyfundpedia.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ArrowBack
import androidx.compose.material.icons.outlined.BusinessCenter
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Description
import androidx.compose.material.icons.outlined.Favorite
import androidx.compose.material.icons.outlined.FavoriteBorder
import androidx.compose.material.icons.outlined.FilterList
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.OpenInNew
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.policyfundpedia.app.data.ApplicantType
import com.policyfundpedia.app.data.FundCategory
import com.policyfundpedia.app.data.FundProgram
import com.policyfundpedia.app.data.FundRepository
import com.policyfundpedia.app.ui.PolicyFundTheme

private enum class AppTab(val label: String) {
    Home("홈"),
    Search("검색"),
    Saved("저장"),
    Menu("메뉴")
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { PolicyFundTheme { PolicyFundApp() } }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PolicyFundApp() {
    val context = LocalContext.current
    val prefs = remember { context.getSharedPreferences("policy_fund_prefs", Context.MODE_PRIVATE) }
    var selected by remember { mutableStateOf<FundProgram?>(null) }
    var tab by remember { mutableStateOf(AppTab.Home) }
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf<FundCategory?>(null) }
    var applicant by remember { mutableStateOf<ApplicantType?>(null) }
    var savedIds by remember {
        mutableStateOf(prefs.getStringSet("saved_fund_ids", emptySet())?.toSet().orEmpty())
    }

    fun toggleSaved(id: String) {
        val next = if (id in savedIds) savedIds - id else savedIds + id
        savedIds = next
        prefs.edit().putStringSet("saved_fund_ids", next).apply()
    }

    val programs = remember { FundRepository.programs }
    val filtered = programs.filter { fund ->
        val q = query.trim()
        val queryMatch = q.isBlank() || listOf(
            fund.title, fund.summary, fund.detail, fund.agency, fund.agencyName,
            fund.target, fund.note, fund.tags.joinToString(" ")
        ).any { it.contains(q, ignoreCase = true) }
        val categoryMatch = category == null || fund.category == category
        val applicantMatch = applicant == null || applicant in fund.applicantTypes
        queryMatch && categoryMatch && applicantMatch
    }
    val saved = programs.filter { it.id in savedIds }

    BackHandler(enabled = selected != null || tab != AppTab.Home) {
        if (selected != null) selected = null else tab = AppTab.Home
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("정책자금 백과", fontWeight = FontWeight.ExtraBold)
                        Text("${programs.size}개 정부 지원금·대출 정보", style = MaterialTheme.typography.labelMedium)
                    }
                },
                navigationIcon = {
                    if (selected != null) {
                        IconButton(onClick = { selected = null }) {
                            Icon(Icons.Outlined.ArrowBack, contentDescription = "뒤로")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        bottomBar = {
            if (selected == null) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    NavigationBarItem(tab == AppTab.Home, { tab = AppTab.Home }, { Icon(Icons.Outlined.Home, contentDescription = null) }, label = { Text("홈") })
                    NavigationBarItem(tab == AppTab.Search, { tab = AppTab.Search }, { Icon(Icons.Outlined.Search, contentDescription = null) }, label = { Text("검색") })
                    NavigationBarItem(tab == AppTab.Saved, { tab = AppTab.Saved }, { Icon(Icons.Outlined.FavoriteBorder, contentDescription = null) }, label = { Text("저장") })
                    NavigationBarItem(tab == AppTab.Menu, { tab = AppTab.Menu }, { Icon(Icons.Outlined.Menu, contentDescription = null) }, label = { Text("메뉴") })
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        AnimatedContent(
            targetState = selected,
            label = "screen",
            modifier = Modifier.fillMaxSize().padding(padding)
        ) { current ->
            if (current != null) {
                DetailScreen(
                    program = current,
                    isSaved = current.id in savedIds,
                    onToggleSaved = { toggleSaved(current.id) }
                )
            } else {
                when (tab) {
                    AppTab.Home -> FundListScreen(
                        programs = programs,
                        filtered = filtered,
                        query = query,
                        onQueryChange = { query = it },
                        category = category,
                        onCategoryChange = { category = if (category == it) null else it },
                        applicant = applicant,
                        onApplicantChange = { applicant = if (applicant == it) null else it },
                        onOpen = { selected = it },
                        isSaved = { it.id in savedIds },
                        onToggleSaved = { toggleSaved(it.id) },
                        showHero = true,
                        showDashboard = true
                    )
                    AppTab.Search -> FundListScreen(
                        programs = programs,
                        filtered = filtered,
                        query = query,
                        onQueryChange = { query = it },
                        category = category,
                        onCategoryChange = { category = if (category == it) null else it },
                        applicant = applicant,
                        onApplicantChange = { applicant = if (applicant == it) null else it },
                        onOpen = { selected = it },
                        isSaved = { it.id in savedIds },
                        onToggleSaved = { toggleSaved(it.id) },
                        showHero = false,
                        showDashboard = false
                    )
                    AppTab.Saved -> SavedScreen(
                        saved = saved,
                        onOpen = { selected = it },
                        onToggleSaved = { toggleSaved(it.id) }
                    )
                    AppTab.Menu -> MenuScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun FundListScreen(
    programs: List<FundProgram>,
    filtered: List<FundProgram>,
    query: String,
    onQueryChange: (String) -> Unit,
    category: FundCategory?,
    onCategoryChange: (FundCategory) -> Unit,
    applicant: ApplicantType?,
    onApplicantChange: (ApplicantType) -> Unit,
    onOpen: (FundProgram) -> Unit,
    isSaved: (FundProgram) -> Boolean,
    onToggleSaved: (FundProgram) -> Unit,
    showHero: Boolean,
    showDashboard: Boolean
) {
    LazyColumn(
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier.fillMaxSize().statusBarsPadding()
    ) {
        if (showHero) item { HeroCard(programs.size) }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                placeholder = { Text("창업, 고용, 보증, 금리, 기관명 검색") },
                shape = RoundedCornerShape(18.dp)
            )
        }
        item { SectionTitle("내 상황에 맞는 조건 선택", "카테고리와 신청자 유형을 함께 좁혀보세요") }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                FundCategory.entries.forEach {
                    FilterChip(
                        selected = category == it,
                        onClick = { onCategoryChange(it) },
                        label = { Text(it.label) },
                        leadingIcon = if (category == it) {
                            { Icon(Icons.Outlined.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp)) }
                        } else null
                    )
                }
            }
        }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                ApplicantType.entries.forEach {
                    FilterChip(selected = applicant == it, onClick = { onApplicantChange(it) }, label = { Text(it.label) })
                }
            }
        }
        if (showDashboard) item { CategoryDashboard() }
        item { SectionTitle("${filtered.size}개 정책자금", "웹과 같은 202개 문서를 앱 안에서도 확인합니다") }
        items(filtered, key = { it.id }) { fund ->
            FundCard(fund, onOpen, isSaved(fund), { onToggleSaved(fund) })
        }
        if (filtered.isEmpty()) item { EmptyState() }
    }
}

@Composable
private fun HeroCard(total: Int) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
        shape = RoundedCornerShape(28.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(22.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier.size(44.dp).clip(CircleShape).background(Color.White.copy(alpha = .16f)),
                    contentAlignment = Alignment.Center
                ) { Icon(Icons.Outlined.Shield, contentDescription = null, tint = Color.White) }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("사업자부터 개인까지", color = Color.White, fontWeight = FontWeight.ExtraBold)
                    Text("필요한 정책자금을 빠르게 확인", color = Color.White.copy(alpha = .76f))
                }
            }
            Text(
                "정책자금 백과 웹사이트의 ${total}개 문서를 휴대폰에서도 같은 밀도로 확인할 수 있습니다.",
                color = Color.White,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HeroPill("지원 대상")
                HeroPill("한도·금리")
                HeroPill("신청 서류")
            }
        }
    }
}

@Composable
private fun HeroPill(text: String) {
    Surface(color = Color.White.copy(alpha = .14f), shape = RoundedCornerShape(999.dp)) {
        Text(text, color = Color.White, modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp))
    }
}

@Composable
private fun CategoryDashboard() {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        FundRepository.summaries().chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                row.forEach { summary ->
                    Card(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                    ) {
                        Column(Modifier.padding(14.dp)) {
                            Text(summary.category.label, fontWeight = FontWeight.Bold)
                            Text("${summary.count}개", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
                            Text(summary.headline, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                if (row.size == 1) Spacer(Modifier.weight(1f))
            }
        }
    }
}

@Composable
private fun SectionTitle(title: String, caption: String) {
    Column(Modifier.padding(top = 6.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.ExtraBold)
        Text(caption, color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FundCard(
    fund: FundProgram,
    onOpen: (FundProgram) -> Unit,
    isSaved: Boolean,
    onToggleSaved: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onOpen(fund) },
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.BusinessCenter, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(8.dp))
                Text(fund.category.label, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                Text(fund.deadline, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                IconButton(onClick = onToggleSaved) {
                    Icon(
                        if (isSaved) Icons.Outlined.Favorite else Icons.Outlined.FavoriteBorder,
                        contentDescription = if (isSaved) "저장 해제" else "저장"
                    )
                }
            }
            Text(fund.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
            Text(fund.summary, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoBadge(fund.amount)
                InfoBadge(fund.rate)
                fund.tags.take(2).forEach { InfoBadge(it) }
            }
            Text("기관: ${fund.agencyName}", style = MaterialTheme.typography.labelMedium)
        }
    }
}

@Composable
private fun InfoBadge(text: String) {
    Surface(color = MaterialTheme.colorScheme.secondaryContainer, shape = RoundedCornerShape(999.dp)) {
        Text(
            text,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSecondaryContainer,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun DetailScreen(program: FundProgram, isSaved: Boolean, onToggleSaved: () -> Unit) {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier.fillMaxSize().navigationBarsPadding(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    AssistChip(onClick = {}, label = { Text(program.category.label) }, leadingIcon = { Icon(Icons.Outlined.FilterList, contentDescription = null, modifier = Modifier.size(18.dp)) })
                    program.tags.forEach { AssistChip(onClick = {}, label = { Text(it) }) }
                }
                Text(program.title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
                Text(program.summary, color = MaterialTheme.colorScheme.onSurfaceVariant)
                OutlinedButton(onClick = onToggleSaved, modifier = Modifier.fillMaxWidth(), shape = RoundedCornerShape(16.dp)) {
                    Icon(if (isSaved) Icons.Outlined.Favorite else Icons.Outlined.FavoriteBorder, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(if (isSaved) "저장됨" else "이 정책자금 저장")
                }
            }
        }
        item { KeyValueGrid(program) }
        item { DetailBlock("지원 대상", program.target, Icons.Outlined.TrendingUp) }
        item { DetailBlock("상세 설명", program.detail, Icons.Outlined.Description) }
        item { StepBlock("신청 절차", program.steps) }
        item { StepBlock("준비 서류", program.documents) }
        item { DetailBlock("확인 메모", program.note, Icons.Outlined.Description) }
        item {
            Button(
                onClick = { openUrl(context, program.officialUrl) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("${program.agencyName}에서 확인")
                Spacer(Modifier.width(6.dp))
                Icon(Icons.Outlined.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            }
            TextButton(
                onClick = { openUrl(context, "https://policyfundpedia.com/") },
                modifier = Modifier.fillMaxWidth()
            ) { Text("policyfundpedia.com 열기") }
        }
    }
}

@Composable
private fun SavedScreen(saved: List<FundProgram>, onOpen: (FundProgram) -> Unit, onToggleSaved: (FundProgram) -> Unit) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().statusBarsPadding(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { SectionTitle("저장한 정책자금", "관심 있는 공고를 기기 안에 따로 모아둡니다") }
        if (saved.isEmpty()) {
            item {
                Card(shape = RoundedCornerShape(24.dp)) {
                    Column(Modifier.padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(Icons.Outlined.FavoriteBorder, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                        Spacer(Modifier.height(8.dp))
                        Text("저장한 정책자금이 없습니다", fontWeight = FontWeight.Bold)
                        Text("목록이나 상세 화면에서 저장 버튼을 눌러보세요", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        } else {
            items(saved, key = { it.id }) { fund -> FundCard(fund, onOpen, true, { onToggleSaved(fund) }) }
        }
    }
}

@Composable
private fun MenuScreen() {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier.fillMaxSize().statusBarsPadding(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item { SectionTitle("메뉴", "공식 정보와 앱 안내를 확인하세요") }
        item {
            MenuCard(
                title = "정책자금 백과 웹사이트",
                body = "웹에서도 같은 정책자금 문서를 확인할 수 있습니다.",
                button = "웹사이트 열기",
                onClick = { openUrl(context, "https://policyfundpedia.com/") }
            )
        }
        item {
            MenuCard(
                title = "공식 기관 확인",
                body = "지원 조건, 신청 기간, 금액은 기관 공고에 따라 바뀔 수 있습니다.",
                button = "기업마당 열기",
                onClick = { openUrl(context, "https://www.bizinfo.go.kr") }
            )
        }
        item {
            DetailBlock(
                title = "정보 제공 고지",
                body = "정책자금 백과는 정부 정책자금 정보를 정리해 보여주는 정보성 앱입니다. 특정 금융상품 가입이나 대출 실행을 보장하지 않으며, 최종 신청 전에는 반드시 공식 기관 공고를 확인해야 합니다.",
                icon = Icons.Outlined.Description
            )
        }
        item {
            DetailBlock(
                title = "개인정보",
                body = "이 앱은 회원가입을 받지 않고, 저장한 정책자금 목록은 사용자의 기기 내부에만 보관합니다.",
                icon = Icons.Outlined.Shield
            )
        }
    }
}

@Composable
private fun MenuCard(title: String, body: String, button: String, onClick: () -> Unit) {
    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(title, fontWeight = FontWeight.ExtraBold)
            Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant)
            OutlinedButton(onClick = onClick, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
                Text(button)
                Spacer(Modifier.width(6.dp))
                Icon(Icons.Outlined.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun KeyValueGrid(program: FundProgram) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            KeyTile("한도", program.amount, Modifier.weight(1f))
            KeyTile("금리", program.rate, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            KeyTile("기간", program.period, Modifier.weight(1f))
            KeyTile("마감", program.deadline, Modifier.weight(1f))
        }
    }
}

@Composable
private fun KeyTile(label: String, value: String, modifier: Modifier = Modifier) {
    Card(modifier = modifier, shape = RoundedCornerShape(20.dp)) {
        Column(Modifier.padding(14.dp)) {
            Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(value, fontWeight = FontWeight.ExtraBold)
        }
    }
}

@Composable
private fun DetailBlock(title: String, body: String, icon: ImageVector) {
    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(8.dp))
                Text(title, fontWeight = FontWeight.ExtraBold)
            }
            Text(body, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun StepBlock(title: String, items: List<String>) {
    Card(shape = RoundedCornerShape(22.dp), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(title, fontWeight = FontWeight.ExtraBold)
            items.forEachIndexed { index, item ->
                Row(verticalAlignment = Alignment.Top) {
                    Box(
                        modifier = Modifier.size(26.dp).clip(CircleShape).background(MaterialTheme.colorScheme.primaryContainer),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("${index + 1}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onPrimaryContainer)
                    }
                    Spacer(Modifier.width(10.dp))
                    Text(item, modifier = Modifier.weight(1f), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
private fun EmptyState() {
    Card(shape = RoundedCornerShape(24.dp)) {
        Column(Modifier.padding(22.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(Icons.Outlined.Search, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
            Spacer(Modifier.height(8.dp))
            Text("조건에 맞는 문서가 없습니다", fontWeight = FontWeight.Bold)
            Text("검색어 또는 필터를 조금 넓혀보세요", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

private fun openUrl(context: Context, url: String) {
    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
}
