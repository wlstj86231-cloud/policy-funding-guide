import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const API_URL = "https://policyfund-api.wlstj86231.workers.dev/api/funds?limit=1000";

const categoryToEnum = new Map([
  ["소상공인", "SmallBusiness"],
  ["창업", "Startup"],
  ["중소기업", "Sme"],
  ["고용", "Employment"],
  ["비사업자", "Personal"],
  ["서민금융", "LowIncomeFinance"],
]);

const categoryLabels = {
  SmallBusiness: "소상공인",
  Startup: "창업",
  Sme: "중소기업",
  Employment: "고용",
  Personal: "비사업자",
  LowIncomeFinance: "서민금융",
};

const applicantLabels = {
  BusinessOwner: "사업자",
  PreFounder: "예비창업자",
  Employer: "고용주",
  Individual: "개인",
};

function cleanText(value, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function parseArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return fallback;
  if (typeof value !== "string") return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function tagsOf(raw) {
  const cat = cleanText(raw.cat || "정책자금");
  const tags = parseArray(raw.tags, []);
  const normalized = tags.map((tag) => typeof tag === "string" ? tag : cleanText(tag?.t || tag?.text || ""));
  return (normalized.length ? normalized : [cat]).filter(Boolean);
}

function docsOf(raw) {
  return cleanText(raw.docs || "신분증, 사업자등록증 또는 소득 증빙, 공식 공고별 추가 서류")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function applicantsOf(raw) {
  const targets = parseArray(raw.target, []);
  const text = `${targets.join(" ")} ${raw.target_desc || ""} ${raw.cat || ""}`;
  const applicants = new Set();
  if (/사업자|소상공인|중소기업|법인|자영업/.test(text)) applicants.add("BusinessOwner");
  if (/예비|창업/.test(text)) applicants.add("PreFounder");
  if (/고용|채용|사업주|근로자/.test(text)) applicants.add("Employer");
  if (/개인|비사업자|서민|청년|취약|근로자/.test(text)) applicants.add("Individual");
  if (!applicants.size) applicants.add(raw.cat === "비사업자" || raw.cat === "서민금융" ? "Individual" : "BusinessOwner");
  return [...applicants];
}

function ktString(value) {
  return JSON.stringify(cleanText(value));
}

function ktList(values) {
  return `listOf(${values.map(ktString).join(", ")})`;
}

function normalizeFund(raw) {
  const categoryEnum = categoryToEnum.get(cleanText(raw.cat)) || "SmallBusiness";
  const officialUrl = cleanText(raw.agency || raw.officialUrl || "https://policyfundpedia.com/");
  return {
    id: cleanText(raw.id),
    title: cleanText(raw.title),
    categoryEnum,
    applicantEnums: applicantsOf(raw),
    tags: tagsOf(raw),
    agency: cleanText(raw.org || raw.agency_name || "공식 기관"),
    agencyName: cleanText(raw.agency_name || raw.agencyName || raw.org || "공식 기관"),
    agencyNote: cleanText(raw.agency_note || raw.agencyNote || "공식 공고에서 신청 기간과 세부 요건을 확인하세요."),
    amount: cleanText(raw.lim || raw.limit || raw.amount_desc || "공고별 확인"),
    rate: cleanText(raw.rate || raw.rate_desc || "공고별 확인"),
    period: cleanText(raw.period_desc || raw.periodDesc || "공고별 확인"),
    deadline: cleanText(raw.deadline || "상시"),
    updated: cleanText(raw.updated || "2026.04"),
    summary: cleanText(raw.excerpt || raw.detail || raw.title),
    detail: cleanText(raw.detail || raw.excerpt || raw.title),
    target: cleanText(raw.target_desc || "공식 공고의 지원 대상 요건을 확인해야 합니다."),
    steps: parseArray(raw.steps, []).map(cleanText).filter(Boolean),
    documents: docsOf(raw),
    note: cleanText(`${raw.agency_note || raw.agencyNote || ""} ${raw.detail || raw.excerpt || ""}`),
    officialUrl: officialUrl.startsWith("http") ? officialUrl : "https://policyfundpedia.com/",
  };
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content, "utf8");
}

function writeFundModels() {
  const categories = Object.entries(categoryLabels)
    .map(([key, label]) => `    ${key}(${ktString(label)})`)
    .join(",\n");
  const applicants = Object.entries(applicantLabels)
    .map(([key, label]) => `    ${key}(${ktString(label)})`)
    .join(",\n");

  write(path.join(ROOT, "android/app/src/main/java/com/policyfundpedia/app/data/FundModels.kt"), `package com.policyfundpedia.app.data

enum class FundCategory(val label: String) {
${categories}
}

enum class ApplicantType(val label: String) {
${applicants}
}

data class FundProgram(
    val id: String,
    val title: String,
    val category: FundCategory,
    val applicantTypes: List<ApplicantType>,
    val tags: List<String>,
    val agency: String,
    val agencyName: String,
    val agencyNote: String,
    val amount: String,
    val rate: String,
    val period: String,
    val deadline: String,
    val updated: String,
    val summary: String,
    val detail: String,
    val target: String,
    val steps: List<String>,
    val documents: List<String>,
    val note: String,
    val officialUrl: String
)

data class CategorySummary(
    val category: FundCategory,
    val count: Int,
    val headline: String
)
`);
}

function writeFundRepository(funds) {
  const programs = funds.map((fund) => `        FundProgram(
            id = ${ktString(fund.id)},
            title = ${ktString(fund.title)},
            category = FundCategory.${fund.categoryEnum},
            applicantTypes = listOf(${fund.applicantEnums.map((item) => `ApplicantType.${item}`).join(", ")}),
            tags = ${ktList(fund.tags)},
            agency = ${ktString(fund.agency)},
            agencyName = ${ktString(fund.agencyName)},
            agencyNote = ${ktString(fund.agencyNote)},
            amount = ${ktString(fund.amount)},
            rate = ${ktString(fund.rate)},
            period = ${ktString(fund.period)},
            deadline = ${ktString(fund.deadline)},
            updated = ${ktString(fund.updated)},
            summary = ${ktString(fund.summary)},
            detail = ${ktString(fund.detail)},
            target = ${ktString(fund.target)},
            steps = ${ktList(fund.steps.length ? fund.steps : ["공식 공고 확인", "지원 자격 검토", "필요 서류 준비", "온라인 또는 방문 신청"])},
            documents = ${ktList(fund.documents.length ? fund.documents : ["신분증", "소득 또는 매출 증빙", "공식 공고별 추가 서류"])},
            note = ${ktString(fund.note)},
            officialUrl = ${ktString(fund.officialUrl)}
        )`).join(",\n");

  write(path.join(ROOT, "android/app/src/main/java/com/policyfundpedia/app/data/FundRepository.kt"), `package com.policyfundpedia.app.data

object FundRepository {
    val programs = listOf(
${programs}
    )

    fun summaries(): List<CategorySummary> =
        FundCategory.entries.map { category ->
            CategorySummary(
                category = category,
                count = programs.count { it.category == category },
                headline = when (category) {
                    FundCategory.SmallBusiness -> "운영자금·시설자금 중심"
                    FundCategory.Startup -> "예비·초기·성장 단계 지원"
                    FundCategory.Sme -> "운전자금·R&D·수출 지원"
                    FundCategory.Employment -> "채용·고용유지·훈련 지원"
                    FundCategory.Personal -> "비사업자 생활·전환 자금"
                    FundCategory.LowIncomeFinance -> "서민금융·보증·상담 지원"
                }
            )
        }
}
`);
}

function mainActivityTemplate() {
  const d = "$";
  return `package com.policyfundpedia.app

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
    var selected by remember { mutableStateOf<FundProgram?>(null) }
    var query by remember { mutableStateOf("") }
    var category by remember { mutableStateOf<FundCategory?>(null) }
    var applicant by remember { mutableStateOf<ApplicantType?>(null) }

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

    BackHandler(enabled = selected != null) { selected = null }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("정책자금 백과", fontWeight = FontWeight.ExtraBold)
                        Text("정부 지원금·대출 정보", style = MaterialTheme.typography.labelMedium)
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
                    NavigationBarItem(true, {}, { Icon(Icons.Outlined.Home, contentDescription = null) }, label = { Text("홈") })
                    NavigationBarItem(false, {}, { Icon(Icons.Outlined.Search, contentDescription = null) }, label = { Text("검색") })
                    NavigationBarItem(false, {}, { Icon(Icons.Outlined.FavoriteBorder, contentDescription = null) }, label = { Text("저장") })
                    NavigationBarItem(false, {}, { Icon(Icons.Outlined.Menu, contentDescription = null) }, label = { Text("메뉴") })
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
        modifier = Modifier.fillMaxSize().statusBarsPadding()
    ) {
        item { HeroCard(programs.size) }
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
        item { CategoryDashboard() }
        item { SectionTitle("${d}{filtered.size}개 정책자금", "웹과 같은 202개 문서를 앱 안에서도 확인합니다") }
        items(filtered, key = { it.id }) { fund -> FundCard(fund, onOpen) }
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
                "정책자금 백과 웹사이트의 ${d}{total}개 문서를 휴대폰에서도 같은 밀도로 확인할 수 있습니다.",
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
                            Text("${d}{summary.count}개", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.ExtraBold)
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
private fun FundCard(fund: FundProgram, onOpen: (FundProgram) -> Unit) {
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
            }
            Text(fund.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.ExtraBold)
            Text(fund.summary, color = MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 2, overflow = TextOverflow.Ellipsis)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoBadge(fund.amount)
                InfoBadge(fund.rate)
                fund.tags.take(2).forEach { InfoBadge(it) }
            }
            Text("기관: ${d}{fund.agencyName}", style = MaterialTheme.typography.labelMedium)
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
private fun DetailScreen(program: FundProgram) {
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
                onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(program.officialUrl))) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("${d}{program.agencyName}에서 확인")
                Spacer(Modifier.width(6.dp))
                Icon(Icons.Outlined.OpenInNew, contentDescription = null, modifier = Modifier.size(18.dp))
            }
            TextButton(
                onClick = { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://policyfundpedia.com/"))) },
                modifier = Modifier.fillMaxWidth()
            ) { Text("policyfundpedia.com 열기") }
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
                        Text("${d}{index + 1}", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onPrimaryContainer)
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
`;
}

function writeMainActivity() {
  write(path.join(ROOT, "android/app/src/main/java/com/policyfundpedia/app/MainActivity.kt"), mainActivityTemplate());
}

function writeAndroidResources() {
  write(path.join(ROOT, "android/app/src/main/res/values/strings.xml"), `<resources>
    <string name="app_name">정책자금 백과</string>
</resources>
`);
}

function writeReadme() {
  write(path.join(ROOT, "android/README.md"), `# 정책자금 백과 Android

정책자금 백과의 Android 전용 네이티브 앱입니다. WebView가 아니라 Kotlin과 Jetpack Compose로 구성했고, 웹사이트와 같은 정책자금 데이터 202개를 앱 내부 데이터로 동기화합니다.

## 구성

- Kotlin + Jetpack Compose
- 정책자금 검색
- 카테고리 필터
- 신청자 유형 필터
- 정책자금 상세 화면
- 신청 절차, 준비 서류, 확인 메모
- 공식 기관 링크와 웹사이트 링크

## 데이터 동기화

\`\`\`powershell
node scripts/sync-policy-data.mjs
\`\`\`

위 명령은 정책자금 API에서 최신 데이터를 받아 Android 모델, 저장소, 미리보기 문서를 다시 생성합니다.

## 실행

Android Studio에서 \`android/\` 폴더를 열고 Gradle Sync 후 실행합니다. 로컬 CLI 빌드는 Android SDK와 Gradle이 필요합니다.
`);
}

function escapeHtml(value) {
  return cleanText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function writePreview(funds) {
  const counts = Object.entries(categoryLabels).map(([key, label]) => {
    const count = funds.filter((fund) => fund.categoryEnum === key).length;
    return `<div class="mini"><span>${escapeHtml(label)}</span><b>${count}개</b><small>웹과 동일</small></div>`;
  }).join("");
  const cards = funds.slice(0, 8).map((fund) => `<article class="card">
    <div class="meta"><span class="tag">${escapeHtml(categoryLabels[fund.categoryEnum])}</span><span>${escapeHtml(fund.deadline)}</span></div>
    <h2>${escapeHtml(fund.title)}</h2>
    <p>${escapeHtml(fund.summary)}</p>
    <div class="facts"><span>${escapeHtml(fund.amount)}</span><span>${escapeHtml(fund.rate)}</span><span>${escapeHtml(fund.agencyName)}</span></div>
  </article>`).join("");

  write(path.join(ROOT, "android/preview/index.html"), `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>정책자금 백과 Android Preview</title>
  <style>
    :root{--bg:#f8f7f5;--ink:#111827;--muted:#64748b;--line:#e5e7eb;--blue:#1a56db;--blue-bg:#eff5ff;--blue-t:#1e429f;--white:#fff}
    *{box-sizing:border-box}body{margin:0;background:#e7e9ee;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0}.stage{min-height:100vh;display:grid;place-items:center;padding:24px}.phone{width:min(390px,100%);height:820px;background:var(--bg);border-radius:34px;overflow:hidden;box-shadow:0 22px 60px rgba(15,23,42,.22);border:8px solid #111827;position:relative}.status{height:28px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:12px;font-weight:700}.appbar{position:sticky;top:0;background:rgba(248,247,245,.96);backdrop-filter:blur(10px);z-index:2;border-bottom:1px solid var(--line);padding:12px 18px}.brand{display:flex;align-items:center;gap:10px}.mark{width:34px;height:34px;border-radius:12px;background:var(--blue);display:grid;place-items:center;color:#fff;font-weight:800}.logo-main{font-size:18px;font-weight:800}.logo-main span{color:var(--blue)}.logo-sub{font-size:11px;color:var(--muted)}.content{height:calc(100% - 84px);overflow:auto;padding:16px 16px 100px}.search{background:#fff;border:1px solid var(--line);border-radius:16px;padding:13px 14px;color:var(--muted);font-size:14px}.tabs{display:flex;gap:9px;overflow:auto;margin:14px -16px 12px;padding:0 16px 4px}.tab{white-space:nowrap;border:1px solid var(--line);background:#fff;border-radius:999px;padding:9px 13px;font-size:13px;color:var(--muted)}.tab.on{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}.notice{background:#1a56db;color:#fff;border-radius:22px;padding:18px;margin:14px 0}.notice strong{display:block;font-size:16px;margin-bottom:5px}.notice p{margin:0;color:rgba(255,255,255,.8);font-size:13px;line-height:1.55}.summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.mini{background:#fff;border:1px solid var(--line);border-radius:18px;padding:13px}.mini b{display:block;font-size:20px;color:var(--blue);margin:3px 0}.mini span,.mini small{font-size:12px;color:var(--muted)}.section{display:flex;align-items:end;justify-content:space-between;margin:20px 0 10px}.section h2{font-size:16px;margin:0}.section span{font-size:12px;color:var(--muted)}.card{background:#fff;border-radius:18px;padding:17px 18px;margin-bottom:12px;box-shadow:0 1px 0 rgba(15,23,42,.04);border:1px solid #eef2f7}.meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:11px;color:var(--muted)}.tag{background:var(--blue-bg);color:var(--blue-t);border-radius:999px;padding:5px 9px;font-weight:700}.card h2{font-size:16px;line-height:1.42;margin:0 0 6px}.card p{font-size:13px;color:var(--muted);line-height:1.62;margin:0 0 12px}.facts{display:flex;gap:8px;flex-wrap:wrap}.facts span{background:#f3f4f6;border-radius:999px;padding:6px 9px;font-size:12px;color:#374151}.bottom{position:absolute;left:16px;right:16px;bottom:16px;background:#fff;border:1px solid var(--line);border-radius:24px;display:grid;grid-template-columns:repeat(4,1fr);padding:9px 6px;box-shadow:0 10px 30px rgba(15,23,42,.14)}.nav{text-align:center;font-size:11px;color:var(--muted);font-weight:700}.nav.on{color:var(--blue)}.nav i{display:block;font-style:normal;font-size:18px;margin-bottom:3px}@media(max-width:500px){.stage{padding:0}.phone{width:100%;height:100vh;border:0;border-radius:0}.content{height:calc(100vh - 84px)}}
  </style>
</head>
<body>
  <main class="stage"><section class="phone"><div class="status"><span>9:41</span><span>5G 86%</span></div><header class="appbar"><div class="brand"><div class="mark">P</div><div><div class="logo-main">정책자금 <span>백과</span></div><div class="logo-sub">Government Fund Guide</div></div></div></header><div class="content"><div class="search">검색: 창업, 고용, 소상공인, 서민금융</div><div class="tabs"><div class="tab on">전체</div><div class="tab">소상공인</div><div class="tab">창업</div><div class="tab">중소기업</div><div class="tab">고용</div><div class="tab">비사업자</div><div class="tab">서민금융</div></div><div class="notice"><strong>웹과 같은 ${funds.length}개 정책자금 문서</strong><p>정책자금 백과의 웹 데이터와 앱 데이터를 같은 기준으로 동기화했습니다.</p></div><div class="summary">${counts}</div><div class="section"><h2>추천 정책자금</h2><span>동일 데이터 확인</span></div>${cards}</div><nav class="bottom"><div class="nav on"><i>⌂</i>홈</div><div class="nav"><i>⌕</i>검색</div><div class="nav"><i>♡</i>저장</div><div class="nav"><i>☰</i>메뉴</div></nav></section></main>
</body>
</html>
`);
}

async function main() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  const data = await response.json();
  const funds = (data.items || []).map(normalizeFund);
  writeFundModels();
  writeFundRepository(funds);
  writeAndroidResources();
  writeReadme();
  writePreview(funds);
  console.log(`Synced ${funds.length} policy fund records into Android.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
