import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const apiUrl = "https://policyfund-api.wlstj86231.workers.dev/api/funds?limit=1000";
const adsenseClient = "ca-pub-7217591196020054";
const searchConsoleVerification = "tSlD6MvlQAUKN3XASMGLU-vJTeaoUxCSFg-tn3JMmvk";

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXml(value = "") {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function clean(value, fallback = "공식 공고 확인") {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
}

function slugify(value) {
  return clean(value, "policy-fund")
    .replace(/[\\/:*?"<>|#%{}^[\]`]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tagText(tag) {
  if (typeof tag === "string") return clean(tag);
  return clean(tag?.t || tag?.text || "");
}

function categoryGuide(cat) {
  const table = {
    "소상공인": {
      who: "매출 규모가 작고 상시근로자 수 기준을 보는 사업자가 먼저 확인하는 영역입니다.",
      caution: "소상공인 자금은 업종 제한, 세금 체납, 휴폐업 여부, 기존 대출 잔액에 따라 결과가 크게 달라집니다.",
      read: "운전자금인지 시설자금인지 먼저 나누고, 실제 필요 금액보다 상환 가능 금액을 보수적으로 잡는 편이 안전합니다."
    },
    "창업": {
      who: "예비창업자와 업력 초기 기업이 사업화 자금, 멘토링, 공간, 판로를 함께 검토하는 영역입니다.",
      caution: "창업 지원금은 선정 평가와 발표 자료 품질의 영향을 많이 받으므로 단순 신청보다 준비 문서가 중요합니다.",
      read: "아이템의 시장성, 대표자 역량, 실행 일정, 자부담 가능성을 한 장으로 설명할 수 있어야 합니다."
    },
    "중소기업": {
      who: "성장 단계 기업이 운전자금, 시설자금, 기술보증, 수출, R&D를 함께 검토하는 영역입니다.",
      caution: "중소기업 자금은 재무제표, 부채비율, 신용도, 기술성 평가가 동시에 작동합니다.",
      read: "자금 목적을 생산설비, 인건비, 원재료, 연구개발, 수출 준비처럼 분명히 나누는 것이 좋습니다."
    },
    "고용": {
      who: "채용을 늘리거나 고용을 유지하는 사업주가 인건비와 훈련비 부담을 줄일 때 확인하는 영역입니다.",
      caution: "고용 장려금은 채용일, 고용보험 가입일, 근로계약서, 임금 지급 내역이 맞지 않으면 환수 위험이 있습니다.",
      read: "사람을 먼저 채용하기 전, 참여 승인과 근로자 요건을 사전에 확인하는 흐름이 중요합니다."
    },
    "비사업자": {
      who: "사업자등록이 없는 개인, 청년, 근로자, 금융 취약계층이 생활 안정 자금을 볼 때 확인하는 영역입니다.",
      caution: "개인 정책금융은 소득, 신용점수, 기존 채무, 연체 이력, 주거 조건을 함께 봅니다.",
      read: "한도보다 월 상환액과 중도상환 조건을 먼저 확인해야 실제 부담을 줄일 수 있습니다."
    },
    "서민금융": {
      who: "저신용, 저소득, 금융 취약 상황에서 제도권 금융을 다시 이용하려는 사람이 보는 영역입니다.",
      caution: "서민금융 상품은 불법 사금융 대체 목적이 강하므로 중개 수수료 요구나 대리 신청 광고를 조심해야 합니다.",
      read: "서민금융진흥원, 주택도시기금, 근로복지공단 같은 공식 경로에서 본인 조건을 먼저 확인해야 합니다."
    }
  };
  return table[cat] || {
    who: "신청 자격과 자금 목적이 맞는지 먼저 확인해야 하는 정책자금 영역입니다.",
    caution: "공고마다 요건과 제출 서류가 달라지므로 최신 공식 공고 확인이 필요합니다.",
    read: "지원 한도보다 자격, 사용 목적, 상환 구조, 신청 기간을 먼저 읽는 편이 안전합니다."
  };
}

async function fetchFunds() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (Array.isArray(data.items) && data.items.length) return data.items;
  } catch {
    // Fall through to local embedded data.
  }

  const html = await fs.readFile(path.join(root, "index.html"), "utf8");
  const marker = "const _FUNDS_PLACEHOLDER = [";
  const start = html.indexOf(marker);
  if (start === -1) return [];

  let index = html.indexOf("[", start);
  let depth = 0;
  let stringQuote = null;
  let escaped = false;
  let end = -1;
  for (; index < html.length; index += 1) {
    const char = html[index];
    if (stringQuote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === stringQuote) stringQuote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      stringQuote = char;
    } else if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  if (end === -1) return [];
  return vm.runInNewContext(html.slice(html.indexOf("[", start), end));
}

function normalizeFund(raw) {
  const tags = parseArray(raw.tags).map(tagText).filter(Boolean);
  const steps = parseArray(raw.steps).map((item) => clean(item)).filter(Boolean);
  const target = parseArray(raw.target).map((item) => clean(item)).filter(Boolean);
  return {
    id: raw.id,
    cat: clean(raw.cat, "정책자금"),
    title: clean(raw.title, "정책자금 안내"),
    excerpt: clean(raw.excerpt || raw.detail, "정책자금 핵심 정보를 정리했습니다."),
    detail: clean(raw.detail || raw.excerpt, "공식 공고 기준으로 신청 대상과 절차를 확인해야 합니다."),
    limit: clean(raw.lim || raw.limit || raw.amount_desc),
    rate: clean(raw.rate || raw.rate_desc),
    org: clean(raw.org || raw.agency_name || raw.agencyName || "공식 기관"),
    deadline: clean(raw.deadline || "상시"),
    targetDesc: clean(raw.target_desc || target.join(", "), "공식 공고의 대상 요건 확인"),
    amountDesc: clean(raw.amount_desc || raw.lim || raw.limit),
    rateDesc: clean(raw.rate_desc || raw.rate),
    periodDesc: clean(raw.period_desc || "공식 공고 확인"),
    docs: clean(raw.docs || "사업자등록증, 신분증, 매출 증빙, 공식 공고별 추가 서류"),
    agency: clean(raw.agency || raw.officialUrl || siteUrl),
    agencyName: clean(raw.agency_name || raw.agencyName || raw.org || "공식 기관"),
    agencyNote: clean(raw.agency_note || raw.agencyNote || "신청 전 공식 사이트에서 최신 공고와 세부 요건을 확인하세요."),
    tags,
    steps: steps.length ? steps : ["공식 공고 확인", "지원 대상 검토", "필요 서류 준비", "온라인 또는 방문 신청"],
    target,
    updated: clean(raw.updated || "2026.05"),
    slug: slugify(raw.slug || raw.title)
  };
}

function normalizeFunds(rawFunds) {
  const seen = new Map();
  return rawFunds.map(normalizeFund).filter((fund) => fund.slug && fund.title).map((fund, index) => {
    const count = seen.get(fund.slug) ?? 0;
    seen.set(fund.slug, count + 1);
    if (count === 0) return fund;
    return {
      ...fund,
      slug: slugify(`${fund.slug}-${fund.id ?? index + 1}`)
    };
  });
}

function officialUrl(url) {
  return /^https?:\/\//.test(url) ? url : siteUrl;
}

function relatedFor(fund, funds) {
  return funds
    .filter((item) => item.slug !== fund.slug && item.cat === fund.cat)
    .slice(0, 5);
}

function pageHtml(fund, related) {
  const guide = categoryGuide(fund.cat);
  const canonical = `${siteUrl}/${encodeURIComponent(fund.slug)}/`;
  const title = `${fund.title} | 정책자금 백과`;
  const desc = `${fund.title}의 지원 대상, 한도, 금리, 신청 절차, 필요 서류와 신청 전 확인할 점을 정리했습니다.`;
  const tags = fund.tags.length ? fund.tags : [fund.cat, fund.org, "정책자금"];
  const stepItems = fund.steps.map((step, idx) => `<li><strong>${idx + 1}단계</strong><span>${escapeHtml(step)}</span></li>`).join("");
  const relatedItems = related.map((item) => `<li><a href="/${encodeURIComponent(item.slug)}/">${escapeHtml(item.title)}</a><span>${escapeHtml(item.org)}</span></li>`).join("");

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="google-adsense-account" content="${adsenseClient}">
  <meta name="google-site-verification" content="${searchConsoleVerification}">
  <link rel="canonical" href="${canonical}">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}" crossorigin="anonymous"></script>
  <style>
    :root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--soft:#f8fafc;--blue:#1a56db;--green:#166534}
    *{box-sizing:border-box} body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;background:#f8f7f5;color:var(--ink);line-height:1.78;word-break:keep-all}
    header{position:sticky;top:0;background:rgba(255,255,255,.94);border-bottom:1px solid var(--line);backdrop-filter:blur(10px);z-index:2}
    .nav{max-width:980px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px}
    .logo{font-weight:800;text-decoration:none;color:var(--ink)} .logo span{color:var(--blue)}
    .nav a:not(.logo){font-size:14px;color:var(--muted);text-decoration:none}
    main{max-width:980px;margin:0 auto;padding:28px 20px 72px}
    .hero,.card{background:#fff;border:1px solid var(--line);border-radius:14px}
    .hero{padding:30px;margin-bottom:18px}.crumb{font-size:13px;color:var(--muted);margin-bottom:12px}.crumb a{color:var(--blue);text-decoration:none}
    h1{font-size:clamp(25px,5vw,38px);line-height:1.28;margin:0 0 14px;letter-spacing:-.03em} h2{font-size:21px;margin:34px 0 12px;letter-spacing:-.02em}
    p{margin:0 0 15px;color:#334155}.lead{font-size:17px;color:#263447}
    .tags{display:flex;flex-wrap:wrap;gap:7px;margin:18px 0}.tag{padding:5px 10px;background:#eff6ff;color:#1e429f;border-radius:999px;font-size:13px;font-weight:700}
    .summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:20px}.sum{padding:15px;background:var(--soft);border:1px solid var(--line);border-radius:10px}.sum b{display:block;font-size:12px;color:var(--muted);margin-bottom:5px}.sum span{font-weight:800;color:var(--blue)}
    .card{padding:26px;margin-bottom:16px}.rows{border-top:1px solid var(--line)}.row{display:grid;grid-template-columns:132px 1fr;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}.row b{color:var(--muted)}
    .steps{display:grid;gap:10px;padding:0;margin:0;list-style:none}.steps li{display:grid;grid-template-columns:90px 1fr;gap:10px;padding:13px;border:1px solid var(--line);border-radius:10px;background:var(--soft)}.steps strong{color:var(--blue)}
    .note{border-left:4px solid var(--blue);padding:14px 16px;background:#eff6ff;border-radius:0 10px 10px 0}
    .related{display:grid;gap:8px;padding:0;margin:0;list-style:none}.related li{display:flex;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--soft)}.related a{font-weight:700;color:var(--ink);text-decoration:none}.related span{color:var(--muted);font-size:13px}
    .official{display:inline-flex;margin-top:12px;padding:12px 16px;background:var(--blue);color:#fff;text-decoration:none;border-radius:10px;font-weight:800}
    @media(max-width:720px){.summary{grid-template-columns:1fr}.row{grid-template-columns:1fr}.steps li{grid-template-columns:1fr}.related li{display:grid}.hero,.card{padding:20px}.nav{align-items:flex-start;flex-direction:column}}
  </style>
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": desc,
    "inLanguage": "ko-KR",
    "url": canonical,
    "dateModified": fund.updated,
    "publisher": { "@type": "Organization", "name": "정책자금 백과", "url": siteUrl }
  })}</script>
</head>
<body>
  <header>
    <nav class="nav">
      <a class="logo" href="/">정책자금 <span>백과</span></a>
      <a href="/">전체 자금 보기</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="crumb"><a href="/">홈</a> / ${escapeHtml(fund.cat)} / ${escapeHtml(fund.org)}</div>
      <h1>${escapeHtml(fund.title)}</h1>
      <p class="lead">${escapeHtml(fund.excerpt)}</p>
      <div class="tags">${tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="summary">
        <div class="sum"><b>지원 한도</b><span>${escapeHtml(fund.limit)}</span></div>
        <div class="sum"><b>금리/지원</b><span>${escapeHtml(fund.rate)}</span></div>
        <div class="sum"><b>담당 기관</b><span>${escapeHtml(fund.org)}</span></div>
      </div>
    </section>

    <section class="card">
      <h2>이 자금은 어떤 상황에서 먼저 봐야 하나요?</h2>
      <p>${escapeHtml(fund.detail)}</p>
      <p>${escapeHtml(guide.who)} ${escapeHtml(fund.title)}은 이름만 보고 신청 여부를 판단하기보다 실제 자금 목적, 업력, 매출 상태, 고용 상태, 기존 대출 여부를 함께 놓고 봐야 합니다. 같은 정책자금이라도 공고 회차와 예산 상황에 따라 접수 방식, 우대 조건, 제외 업종, 심사 속도가 달라질 수 있습니다.</p>
      <p>정책자금 백과에서는 이 페이지를 단순한 목록이 아니라 신청 전 점검용 문서로 정리합니다. 사용자는 한도와 금리만 보고 움직이기 쉽지만, 실제 결과는 대상 요건과 증빙 가능성에서 갈리는 경우가 많습니다. 따라서 아래 항목을 차례대로 확인한 뒤 공식 공고로 이동하는 흐름을 권장합니다.</p>
    </section>

    <section class="card">
      <h2>핵심 조건 정리</h2>
      <div class="rows">
        <div class="row"><b>지원 대상</b><span>${escapeHtml(fund.targetDesc)}</span></div>
        <div class="row"><b>지원 금액</b><span>${escapeHtml(fund.amountDesc)}</span></div>
        <div class="row"><b>금리·지원</b><span>${escapeHtml(fund.rateDesc)}</span></div>
        <div class="row"><b>지원 기간</b><span>${escapeHtml(fund.periodDesc)}</span></div>
        <div class="row"><b>신청 기한</b><span>${escapeHtml(fund.deadline)}</span></div>
        <div class="row"><b>필요 서류</b><span>${escapeHtml(fund.docs)}</span></div>
      </div>
    </section>

    <section class="card">
      <h2>신청 전에 읽어야 할 해석</h2>
      <p>${escapeHtml(guide.read)} ${escapeHtml(fund.title)}의 한도는 받을 수 있는 최대치일 뿐이며, 실제 승인 금액은 매출, 신용, 담보 또는 보증 가능성, 사업 계획의 구체성, 기존 채무와 연체 이력에 따라 달라질 수 있습니다.</p>
      <p>${escapeHtml(guide.caution)} 특히 정부지원금이라는 말만 보고 무료 지원으로 오해하면 안 됩니다. 융자, 보증, 바우처, 장려금, 보조금은 각각 상환 여부와 사후 관리 방식이 다릅니다. 이 페이지에서 금리 또는 지원 방식이 상환 불필요로 표시되지 않았다면 대출이나 보증 성격인지 먼저 확인해야 합니다.</p>
      <div class="note">${escapeHtml(fund.agencyNote)}</div>
    </section>

    <section class="card">
      <h2>신청 흐름</h2>
      <ol class="steps">${stepItems}</ol>
      <p style="margin-top:16px">신청 과정에서는 접수 완료보다 보완 요청 대응이 더 중요할 때가 많습니다. 서류가 누락되거나 사업 목적이 공고와 맞지 않으면 심사 기간이 길어질 수 있으므로, 신청 전에는 공고문, 신청서, 사업자 정보, 매출 증빙, 납세 상태를 한 번에 맞춰 보는 편이 좋습니다.</p>
      <a class="official" href="${escapeHtml(officialUrl(fund.agency))}" target="_blank" rel="noreferrer">공식 사이트에서 확인하기</a>
    </section>

    <section class="card">
      <h2>운영자 메모</h2>
      <p>${escapeHtml(fund.title)}을 볼 때는 “내가 받을 수 있는가”보다 “내 상황을 증명할 수 있는가”를 먼저 생각하는 편이 안전합니다. 정책자금은 대부분 세금, 고용보험, 사업자등록, 매출 자료, 신용 상태처럼 이미 남아 있는 기록을 기준으로 판단합니다. 말로 설명할 수 있어도 자료로 확인되지 않으면 심사에서 불리해질 수 있습니다.</p>
      <p>또한 접수 기간이 상시라고 표시되어도 예산 소진, 지역별 접수 중단, 기관별 심사 지연이 생길 수 있습니다. 그래서 이 페이지는 마지막 판단 자료가 아니라 공식 공고를 읽기 전 핵심 구조를 잡는 안내문으로 보는 것이 좋습니다. 최종 신청은 반드시 ${escapeHtml(fund.agencyName)}의 최신 공고와 상담 안내를 기준으로 진행해야 합니다.</p>
      <p>마지막 업데이트 기준: ${escapeHtml(fund.updated)}</p>
    </section>

    <section class="card">
      <h2>신청 전 자가점검</h2>
      <p>이 문서는 실제 신청자가 공고문을 열기 전에 먼저 확인해야 할 순서로 정리했습니다. ${escapeHtml(fund.title)}을 볼 때는 “내가 대상자인가”보다 “지금 제출할 수 있는 증빙이 충분한가”를 먼저 보는 편이 좋습니다. 지원사업은 제목이 비슷해도 사업장 소재지, 업력, 매출 규모, 고용보험 가입 상태, 기존 대출 잔액, 세금 체납 여부에 따라 결과가 달라질 수 있습니다.</p>
      <p>특히 ${escapeHtml(fund.cat)} 분야의 사업은 접수 기간이 짧거나 예산이 먼저 소진되는 경우가 많습니다. 그래서 공고를 발견한 뒤에 서류를 찾기 시작하면 늦을 수 있습니다. 사업자등록증, 부가가치세 과세표준증명, 표준재무제표, 고용보험 사업장 자격취득자 명부, 국세·지방세 납세증명서처럼 반복적으로 요구되는 자료는 미리 내려받을 수 있는지 확인해 두는 것이 안전합니다.</p>
      <div class="rows">
        <div class="row"><b>먼저 볼 것</b><span>대상 조건, 제외 업종, 신청 지역, 접수 방식, 예산 소진 여부를 먼저 확인합니다.</span></div>
        <div class="row"><b>주의할 것</b><span>지원 한도는 최대치일 뿐이며 실제 선정 금액은 심사, 보증, 매출, 신용도, 사업계획의 구체성에 따라 줄어들 수 있습니다.</span></div>
        <div class="row"><b>준비 순서</b><span>공고문 저장, 자격 체크, 서류 발급 가능 여부 확인, 신청서 초안 작성, 공식 기관 문의 순서로 진행하는 것이 좋습니다.</span></div>
      </div>
    </section>

    <section class="card">
      <h2>실제 활용 메모</h2>
      <p>현장에서 가장 자주 생기는 실수는 “지원 가능”이라는 문구만 보고 바로 신청 버튼을 누르는 것입니다. 정책자금은 대부분 행정 서류와 사업 목적이 맞아야 하고, 온라인 접수 화면에서 입력하는 숫자와 첨부 서류의 숫자가 어긋나면 보완 요청이 나올 수 있습니다. ${escapeHtml(fund.title)}도 신청 전에는 금액, 금리, 기관명만 확인하지 말고 어떤 비용을 인정하는지, 이미 지출한 비용도 가능한지, 선정 전 지출은 제외되는지까지 같이 봐야 합니다.</p>
      <p>개인적으로 이런 공고를 정리할 때는 “내 상황 설명 한 문장”을 먼저 써두는 방식을 권합니다. 예를 들어 매출 감소로 운전자금이 필요한지, 신규 채용 때문에 인건비 부담이 커졌는지, 장비 교체나 수출 준비처럼 목적이 뚜렷한지 한 문장으로 적어두면 신청서의 방향이 훨씬 선명해집니다. 이 문장이 흐리면 서류는 많아도 심사자가 보기에 왜 필요한 지원인지 약해 보일 수 있습니다.</p>
      <p>최종 제출 전에는 반드시 ${escapeHtml(fund.agencyName)}의 최신 공고와 안내문을 다시 확인해야 합니다. 정책자금백과는 사용자가 빠르게 비교하고 준비 방향을 잡을 수 있도록 돕는 정리 문서이며, 실제 접수 가능 여부와 세부 조건은 공식 기관의 최신 공고가 우선합니다.</p>
    </section>

    ${related.length ? `<section class="card"><h2>같이 확인하면 좋은 ${escapeHtml(fund.cat)} 정보</h2><ul class="related">${relatedItems}</ul></section>` : ""}
  </main>
</body>
</html>`;
}

async function removeExistingGeneratedDirs(funds) {
  await Promise.all(funds.map(async (fund) => {
    await fs.rm(path.join(root, fund.slug), { recursive: true, force: true });
  }));
}

async function main() {
  const funds = normalizeFunds(await fetchFunds());
  await removeExistingGeneratedDirs(funds);
  for (const fund of funds) {
    const dir = path.join(root, fund.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), pageHtml(fund, relatedFor(fund, funds)), "utf8");
  }

  const urls = [
    `<url><loc>${siteUrl}/</loc><lastmod>2026-05-08</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...funds.map((fund) =>
      `<url><loc>${siteUrl}/${escapeXml(encodeURIComponent(fund.slug))}/</loc><lastmod>2026-05-08</lastmod><changefreq>weekly</changefreq><priority>0.86</priority></url>`
    )
  ];
  await fs.writeFile(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join("\n  ")}\n</urlset>\n`,
    "utf8"
  );
  console.log(`Generated ${funds.length} policy fund pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
