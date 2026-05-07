package com.policyfundpedia.app

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
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.policyfundpedia.app.data.ApplicantType
import com.policyfundpedia.app.data.FundCategory
import com.policyfundpedia.app.data.FundProgram
import com.policyfundpedia.app.data.FundRepository
import com.policyfundpedia.app.ui.PolicyFundTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PolicyFundTheme {
                PolicyFundApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PolicyFundApp() {
    var selected by remember { mutableStateOf<FundProgram?>(null) }
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf<FundCategory?>(null) }
    var applicant by remember { mutableStateOf<ApplicantType?>(null) }

    val programs = remember { FundRepository.programs }
    val filtered = programs.filter { fund ->
        val q = query.trim()
        val queryMatch = q.isBlank() ||
            listOf(fund.title, fund.summary, fund.agency, fund.target, fund.note)
                .any { it.contains(q, ignoreCase = true) }
        val categoryMatch = category == null || fund.category == category
        val applicantMatch = applicant == null || applicant in fund.applicantTypes
        queryMatch && categoryMatch && applicantMatch
    }

    BackHandler(enabled = selected != null) { selected = null }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("정책자금 백과", fontWeight = FontWeight.ExtraBold)
                        Text("모바일 정책자금 탐색", style = MaterialTheme.typography.labelMedium)
                    }
                },
                navigationIcon = {
                    if (selected != null) {
                        IconButton(onClick = { selected = null }) {
                            Icon(Icons.Outlined.ArrowBack, contentDescription = "뒤로")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        bottomBar = {
            if (selected == null) {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    NavigationBarItem(
                        selected = true,
                        onClick = {},
                        icon = { Icon(Icons.Outlined.Home, contentDescription = null) },
                        label = { Text("홈") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = {},
                        icon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                        label = { Text("검색") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = {},
                        icon = { Icon(Icons.Outlined.FavoriteBorder, contentDescription = null) },
                        label = { Text("저장") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = {},
                        icon = { Icon(Icons.Outlined.Menu, contentDescription = null) },
                        label = { Text("더보기") }
                    )
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        AnimatedContent(
            targetState = selected,
            label = "screen",
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) { current ->
            if (current == null) {
                HomeScreen(
                    programs = programs,
                    filtered = filtered,
                    query = query,
                    onQueryChange = { query = it },
                    category = category,
                    onCategoryChange = { category = if (category == it) null else it },
                    applicant = applicant,
                    onApplicantChange = { applicant = if (applicant == it) null else it },
                    onOpen = { selected = it }
                )
            } else {
                DetailScreen(program = current)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
private fun HomeScreen(
    programs: List<FundProgram>,
    filtered: List<FundProgram>,
    query: String,
    onQueryChange: (String) -> Unit,
    category: FundCategory?,
    onCategoryChange: (FundCategory) -> Unit,
    applicant: ApplicantType?,
    onApplicantChange: (ApplicantType) -> Unit,
    onOpen: (FundProgram) -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
    ) {
        item {
            HeroCard(programs.size)
        }
        item {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                leadingIcon = { Icon(Icons.Outlined.Search, contentDescription = null) },
                placeholder = { Text("예: 청년, 창업, 고용, 대환, 보증") },
                shape = RoundedCornerShape(18.dp)
            )
        }
        item {
            SectionTitle("내 상황에 맞춰 빠르게 보기", "필터를 누르면 목록이 바로 좁혀집니다.")
        }
        item {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
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
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ApplicantType.entries.forEach {
                    FilterChip(
                        selected = applicant == it,
                        onClick = { onApplicantChange(it) },
                        label = { Text(it.label) }
                    )
                }
            }
        }
        item {
            CategoryDashboard(programs)
        }
        item {
            SectionTitle("${filtered.size}개 정책자금", "금액·대상·준비서류를 카드에서 먼저 확인하세요.")
        }
        items(filtered, key = { it.id }) { fund ->
            FundCard(fund, onOpen)
        }
        if (filtered.isEmpty()) {
            item {
                EmptyState()
            }
        }
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
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = .16f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(Icons.Outlined.Shield, contentDescription = null, tint = Color.White)
                }
                Spacer(Modifier.width(12.dp))
                Column {
                    Text("정부지원금, 폰에서 먼저 정리", color = Color.White, fontWeight = FontWeight.ExtraBold)
                    Text("복잡한 공고를 신청 흐름 중심으로 압축", color = Color.White.copy(alpha = .76f))
                }
            }
            Text(
                "소상공인·창업·중소기업·고용·서민금융까지 ${total}개 핵심 항목을 모바일 전용 카드로 확인합니다.",
                color = Color.White,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                HeroPill("신청단계")
                HeroPill("서류")
                HeroPill("공식기관")
            }
        }
    }
}

@Composable
private fun HeroPill(text: String) {
    Surface(
        color = Color.White.copy(alpha = .14f),
        shape = RoundedCornerShape(999.dp)
    ) {
        Text(text, color = Color.White, modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp))
    }
}

@Composable
private fun CategoryDashboard(programs: List<FundProgram>) {
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

@Composable
private fun FundCard(fund: FundProgram, onOpen: (FundProgram) -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onOpen(fund) },
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
            }
            Text(fund.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
            Text(
                fund.summary,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoBadge(fund.amount)
                InfoBadge(fund.rate)
            }
            Text("기관: ${fund.agency}", style = MaterialTheme.typography.labelMedium)
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

@Composable
private fun DetailScreen(program: FundProgram) {
    val context = LocalContext.current
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .navigationBarsPadding(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, bottom = 28.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                AssistChip(
                    onClick = {},
                    label = { Text(program.category.label) },
                    leadingIcon = { Icon(Icons.Outlined.FilterList, contentDescription = null, modifier = Modifier.size(18.dp)) }
                )
                Text(program.title, style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.ExtraBold)
                Text(program.summary, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
        item {
            KeyValueGrid(program)
        }
        item {
            DetailBlock("지원 대상", program.target, Icons.Outlined.TrendingUp)
        }
        item {
            StepBlock("신청 순서", program.steps)
        }
        item {
            StepBlock("준비 서류", program.documents)
        }
        item {
            DetailBlock("체크 메모", program.note, Icons.Outlined.Description)
        }
        item {
            Button(
                onClick = {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(program.officialUrl)))
                },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("공식 기관에서 확인")
                Spacer(Modifier.width(6.dp))
                Icon(Icons.Outlined.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            }
            TextButton(
                onClick = {
                    context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://policyfundpedia.com/")))
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("policyfundpedia.com 열기")
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
private fun DetailBlock(title: String, body: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
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
                        modifier = Modifier
                            .size(26.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer),
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
            Text("조건에 맞는 항목이 없습니다", fontWeight = FontWeight.Bold)
            Text("검색어를 줄이거나 필터를 해제해보세요.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
