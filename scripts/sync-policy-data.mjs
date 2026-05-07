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

const applicantToEnum = new Map([
  ["사업자", "BusinessOwner"],
  ["예비창업자", "PreFounder"],
  ["고용주", "Employer"],
  ["비사업자", "Individual"],
  ["개인", "Individual"],
  ["근로자", "Individual"],
  ["청년", "Individual"],
  ["취약계층", "Individual"],
]);

function parseMaybeJson(value, fallback) {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return value.split(",").map((x) => x.trim()).filter(Boolean);
    }
  }
  return fallback;
}

function cleanText(value, fallback = "") {
  return String(value ?? fallback).replace(/\s+/g, " ").trim();
}

function splitDocs(value) {
  return cleanText(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTag(tag, cat) {
  if (typeof tag === "string") return { t: tag, c: "tb" };
  return {
    t: cleanText(tag?.t || tag?.text || cat),
    c: cleanText(tag?.c || "tb"),
  };
}

function normalizeFund(raw) {
  const cat = cleanText(raw.cat || "소상공인");
  const tags = parseMaybeJson(raw.tags, []).map((tag) => normalizeTag(tag, cat));
  const target = parseMaybeJson(raw.target, []);
  const steps = parseMaybeJson(raw.steps, []);
  const limit = cleanText(raw.lim || raw.limit || raw.amount_desc || "확인 필요");
  const agencyName = cleanText(raw.agency_name || raw.agencyName || raw.org || raw.agency || "공식 기관");
  const agencyNote = cleanText(raw.agency_note || raw.agencyNote || "공식 공고와 접수 기간을 함께 확인하세요.");
  return {
    ...raw,
    id: Number(raw.id),
    cat,
    tags: tags.length ? tags : [{ t: cat, c: "tb" }],
    target: target.length ? target.map((x) => cleanText(x)).filter(Boolean) : [cat],
    steps: steps.length ? steps.map((x) => cleanText(x)).filter(Boolean) : ["공식 공고 확인", "대상 조건 점검", "서류 준비", "온라인 또는 방문 신청"],
    docs: cleanText(raw.docs || "신분증, 사업자등록증, 소득 또는 매출 증빙"),
    lim: limit,
    limit,
    rate: cleanText(raw.rate || raw.rate_desc || "공고별 확인"),
    org: cleanText(raw.org || agencyName),
    deadline: cleanText(raw.deadline || "상시"),
    title: cleanText(raw.title),
    excerpt: cleanText(raw.excerpt || raw.detail || raw.title),
    detail: cleanText(raw.detail || raw.excerpt || raw.title),
    target_desc: cleanText(raw.target_desc || raw.targetDesc || "지원 대상은 공고별 세부 요건을 확인해야 합니다."),
    amount_desc: cleanText(raw.amount_desc || raw.amountDesc || limit),
    rate_desc: cleanText(raw.rate_desc || raw.rateDesc || raw.rate || "공고별 확인"),
    period_desc: cleanText(raw.period_desc || raw.periodDesc || "공고별 확인"),
    agency: cleanText(raw.agency || raw.officialUrl || "#"),
    agency_name: agencyName,
    agency_note: agencyNote,
    agencyName,
    agencyNote,
    updated: cleanText(raw.updated || "2026.04"),
    slug: cleanText(raw.slug || `fund-${raw.id}`),
  };
}

function jsString(value) {
  return JSON.stringify(cleanText(value));
}

function ktString(value) {
  return JSON.stringify(cleanText(value));
}

function ktList(values) {
  const list = values.map((value) => ktString(value)).join(", ");
  return `listOf(${list})`;
}

function applicantEnums(targets) {
  const enums = new Set();
  for (const target of targets) {
    const exact = applicantToEnum.get(target);
    if (exact) enums.add(exact);
    if (target.includes("사업자") || target.includes("소상공인") || target.includes("중소기업")) enums.add("BusinessOwner");
    if (target.includes("예비") || target.includes("창업")) enums.add("PreFounder");
    if (target.includes("고용") || target.includes("사업주")) enums.add("Employer");
    if (target.includes("개인") || target.includes("비사업자") || target.includes("서민") || target.includes("청년")) enums.add("Individual");
  }
  if (!enums.size) enums.add("BusinessOwner");
  return `listOf(${[...enums].map((x) => `ApplicantType.${x}`).join(", ")})`;
}

function writeFundModels() {
  const content = `package com.policyfundpedia.app.data

enum class FundCategory(val label: String) {
    SmallBusiness("소상공인"),
    Startup("창업"),
    Sme("중소기업"),
    Employment("고용"),
    Personal("비사업자"),
    LowIncomeFinance("서민금융")
}

enum class ApplicantType(val label: String) {
    BusinessOwner("사업자"),
    PreFounder("예비창업자"),
    Employer("고용주"),
    Individual("개인")
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
`;
  fs.writeFileSync(path.join(ROOT, "android/app/src/main/java/com/policyfundpedia/app/data/FundModels.kt"), content, "utf8");
}

function writeFundRepository(funds) {
  const programs = funds.map((fund) => {
    const categoryEnum = categoryToEnum.get(fund.cat) || "SmallBusiness";
    const docs = splitDocs(fund.docs);
    const note = `${fund.agencyNote} ${fund.detail}`.trim();
    const officialUrl = fund.agency && fund.agency.startsWith("http") ? fund.agency : "https://policyfundpedia.com/";
    return `        FundProgram(
            id = ${ktString(String(fund.id))},
            title = ${ktString(fund.title)},
            category = FundCategory.${categoryEnum},
            applicantTypes = ${applicantEnums(fund.target)},
            tags = ${ktList(fund.tags.map((tag) => tag.t))},
            agency = ${ktString(fund.org)},
            agencyName = ${ktString(fund.agencyName)},
            agencyNote = ${ktString(fund.agencyNote)},
            amount = ${ktString(fund.limit)},
            rate = ${ktString(fund.rate)},
            period = ${ktString(fund.period_desc)},
            deadline = ${ktString(fund.deadline)},
            updated = ${ktString(fund.updated)},
            summary = ${ktString(fund.excerpt)},
            detail = ${ktString(fund.detail)},
            target = ${ktString(fund.target_desc)},
            steps = ${ktList(fund.steps)},
            documents = ${ktList(docs.length ? docs : ["공식 공고 확인", "신분증", "소득 또는 매출 증빙"])},
            note = ${ktString(note)},
            officialUrl = ${ktString(officialUrl)}
        )`;
  }).join(",\n");

  const content = `package com.policyfundpedia.app.data

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
                    FundCategory.Startup -> "창업 초기·성장 단계 지원"
                    FundCategory.Sme -> "운전자금·R&D·수출 지원"
                    FundCategory.Employment -> "채용·고용유지·인건비 지원"
                    FundCategory.Personal -> "비사업자 생활·전환 자금"
                    FundCategory.LowIncomeFinance -> "서민금융·보증·상담 지원"
                }
            )
        }
}
`;
  fs.writeFileSync(path.join(ROOT, "android/app/src/main/java/com/policyfundpedia/app/data/FundRepository.kt"), content, "utf8");
}

function updateWebIndex(funds) {
  const file = path.join(ROOT, "index.html");
  let html = fs.readFileSync(file, "utf8");

  const loadBlock = `function parseFundArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch(e) {
    return fallback;
  }
}

function normalizeFunds(items) {
  return (items || []).map(f => {
    const tags = parseFundArray(f.tags, []).map(t => typeof t === 'string' ? {t, c:'tb'} : t);
    const steps = parseFundArray(f.steps, []);
    const target = parseFundArray(f.target, []);
    const limit = f.lim || f.limit || f.amount_desc || '확인 필요';
    return {
      ...f,
      tags: tags.length ? tags : [{t:f.cat || '정책자금', c:'tb'}],
      steps,
      target,
      lim: limit,
      limit,
      agencyName: f.agency_name || f.agencyName || f.org || '공식 기관',
      agencyNote: f.agency_note || f.agencyNote || '공식 공고와 접수 기간을 함께 확인하세요.'
    };
  });
}

async function loadFunds() {
  try {
    const res  = await fetch(\`\${API_URL}/api/funds?limit=1000\`);
    const data = await res.json();
    FUNDS = normalizeFunds(data.items || []);
    return FUNDS;
  } catch(e) {
    console.error('API 로드 실패:', e);
    FUNDS = normalizeFunds(_FUNDS_PLACEHOLDER);
    return FUNDS;
  }
}`;

  html = html.replace(/async function loadFunds\(\) \{[\s\S]*?\n\}/, loadBlock);

  const fallbackStart = html.indexOf("const _FUNDS_PLACEHOLDER = [");
  const fallbackEndMarker = "]; // _FUNDS_PLACEHOLDER 끝";
  const fallbackEnd = html.indexOf(fallbackEndMarker, fallbackStart);
  if (fallbackStart === -1 || fallbackEnd === -1) throw new Error("Cannot find _FUNDS_PLACEHOLDER block");
  const fallbackJson = `const _FUNDS_PLACEHOLDER = ${JSON.stringify(funds, null, 2)}; // _FUNDS_PLACEHOLDER 끝`;
  html = html.slice(0, fallbackStart) + fallbackJson + html.slice(fallbackEnd + fallbackEndMarker.length);

  html = html.replace(
    "const CATS = ['소상공인','창업','중소기업','고용','비사업자'];",
    "const CATS = ['소상공인','창업','중소기업','고용','비사업자','서민금융'];"
  );
  if (!html.includes('id="tab-서민금융"')) {
    html = html.replace(
      `<span class="ctab" id="tab-비사업자" onclick="location.href='/비사업자-서민금융/'">비사업자 · 서민금융</span>`,
      `<span class="ctab" id="tab-비사업자" onclick="location.href='/비사업자-서민금융/'">비사업자</span>
      <span class="ctab" id="tab-서민금융" onclick="filterCat(null,'서민금융')">서민금융</span>`
    );
  }

  fs.writeFileSync(file, html, "utf8");
}

function writePreview(funds) {
  const counts = [...funds.reduce((map, fund) => map.set(fund.cat, (map.get(fund.cat) || 0) + 1), new Map())];
  const firstCards = funds.slice(0, 5);
  const tabs = ["전체", ...counts.map(([cat]) => cat)].map((cat, idx) => `<div class="tab ${idx === 0 ? "on" : ""}">${cat}</div>`).join("");
  const summary = counts.map(([cat, count]) => `<div class="mini"><span>${cat}</span><b>${count}개</b><span>웹과 동일</span></div>`).join("");
  const cards = firstCards.map((fund) => `<article class="card"><div class="meta"><span class="tag">${fund.cat}</span><span class="deadline">${fund.deadline}</span></div><div class="title">${fund.title}</div><div class="desc">${fund.excerpt}</div><div class="facts"><span class="fact">${fund.limit}</span><span class="fact">${fund.rate}</span><span class="fact">${fund.agencyName}</span></div></article>`).join("");

  const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>정책자금 백과 Android Preview</title>
  <style>
    :root{--bg:#f8f7f5;--ink:#111827;--muted:#64748b;--line:#e5e7eb;--blue:#1a56db;--blue-bg:#eff5ff;--blue-t:#1e429f;--white:#fff;--r:18px}
    *{box-sizing:border-box} body{margin:0;background:#e7e9ee;color:var(--ink);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:0}.stage{min-height:100vh;display:grid;place-items:center;padding:24px}.phone{width:min(390px,100%);height:820px;background:var(--bg);border-radius:34px;overflow:hidden;box-shadow:0 22px 60px rgba(15,23,42,.22);border:8px solid #111827;position:relative}.status{height:28px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:12px;font-weight:700;background:var(--bg)}.appbar{position:sticky;top:0;background:rgba(248,247,245,.96);backdrop-filter:blur(10px);z-index:2;border-bottom:1px solid var(--line);padding:12px 18px}.brand{display:flex;align-items:center;gap:10px}.mark{width:34px;height:34px;border-radius:12px;background:var(--blue);display:grid;place-items:center;color:#fff;font-weight:800}.logo-main{font-size:18px;font-weight:700;line-height:1.15}.logo-main span{color:var(--blue)}.logo-sub{font-size:11px;color:var(--muted);font-weight:400}.content{height:calc(100% - 84px);overflow:auto;padding:16px 16px 100px}.search{background:var(--white);border:1px solid var(--line);border-radius:16px;padding:13px 14px;display:flex;gap:10px;align-items:center;color:var(--muted);font-size:14px}.tabs{display:flex;gap:9px;overflow:auto;margin:14px -16px 12px;padding:0 16px 4px}.tab{white-space:nowrap;border:1px solid var(--line);background:var(--white);border-radius:999px;padding:9px 13px;font-size:13px;color:var(--muted)}.tab.on{background:var(--blue);border-color:var(--blue);color:#fff;font-weight:700}.summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.mini{background:var(--white);border:1px solid var(--line);border-radius:18px;padding:13px}.mini b{display:block;font-size:20px;color:var(--blue);margin:3px 0}.mini span{font-size:12px;color:var(--muted)}.notice{background:#0f172a;color:#fff;border-radius:20px;padding:16px;margin:14px 0}.notice strong{display:block;font-size:15px;margin-bottom:4px}.notice p{margin:0;color:#cbd5e1;font-size:13px;line-height:1.55}.section{display:flex;align-items:end;justify-content:space-between;margin:20px 0 10px}.section h2{font-size:16px;margin:0}.section span{font-size:12px;color:var(--muted)}.card{background:var(--white);border:1px solid transparent;border-radius:var(--r);padding:17px 18px;margin-bottom:12px;box-shadow:0 1px 0 rgba(15,23,42,.04);position:relative}.card:before{content:"";position:absolute;left:0;top:22px;bottom:22px;width:3px;background:var(--blue);border-radius:0 4px 4px 0}.meta{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.tag{background:var(--blue-bg);color:var(--blue-t);border-radius:999px;padding:5px 9px;font-size:11px;font-weight:700}.deadline{font-size:11px;color:var(--muted)}.title{font-size:16px;font-weight:700;line-height:1.42;margin-bottom:6px}.desc{font-size:13px;color:var(--muted);line-height:1.62;margin-bottom:12px}.facts{display:flex;gap:8px;flex-wrap:wrap}.fact{background:#f3f4f6;border-radius:999px;padding:6px 9px;font-size:12px;color:#374151}.bottom{position:absolute;left:16px;right:16px;bottom:16px;background:#fff;border:1px solid var(--line);border-radius:24px;display:grid;grid-template-columns:repeat(4,1fr);padding:9px 6px;box-shadow:0 10px 30px rgba(15,23,42,.14)}.nav{text-align:center;font-size:11px;color:var(--muted);font-weight:700}.nav.on{color:var(--blue)}.nav i{display:block;font-style:normal;font-size:18px;margin-bottom:3px}@media(max-width:500px){.stage{padding:0}.phone{width:100%;height:100vh;border:0;border-radius:0}.content{height:calc(100vh - 84px)}}
  </style>
</head>
<body>
  <main class="stage"><section class="phone"><div class="status"><span>9:41</span><span>5G 86%</span></div><header class="appbar"><div class="brand"><div class="mark">P</div><div><div class="logo-main">정책자금 <span>백과</span></div><div class="logo-sub">Government Fund Guide</div></div></div></header><div class="content"><div class="search">검색: 창업, 고용, 소상공인, 서민금융</div><div class="tabs">${tabs}</div><div class="notice"><strong>웹과 앱 모두 ${funds.length}개 동일 문서</strong><p>Cloudflare API 원본 기준으로 앱 저장소, 웹 fallback, 로컬 미리보기를 함께 동기화했습니다.</p></div><div class="summary">${summary}</div><div class="section"><h2>추천 정책자금</h2><span>동일 데이터 확인</span></div>${cards}</div><nav class="bottom"><div class="nav on"><i>⌂</i>홈</div><div class="nav"><i>⌕</i>검색</div><div class="nav"><i>♡</i>저장</div><div class="nav"><i>☰</i>메뉴</div></nav></section></main>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, "android/preview/index.html"), html, "utf8");
}

const response = await fetch(API_URL);
if (!response.ok) throw new Error(`API failed: ${response.status}`);
const data = await response.json();
const funds = (data.items || []).map(normalizeFund).sort((a, b) => a.id - b.id);

writeFundModels();
writeFundRepository(funds);
updateWebIndex(funds);
writePreview(funds);

const counts = funds.reduce((acc, fund) => {
  acc[fund.cat] = (acc[fund.cat] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ total: funds.length, counts }, null, 2));
