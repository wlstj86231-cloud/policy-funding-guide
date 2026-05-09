import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const lastmod = "2026-05-09";
const searchConsoleVerification = "tSlD6MvlQAUKN3XASMGLU-vJTeaoUxCSFg-tn3JMmvk";

const hubPages = [
  {
    slug: "소상공인-정책자금",
    title: "소상공인 정책자금 종류 총정리 2026",
    h1: "소상공인 정책자금 종류 및 신청 방법",
    desc: "소상공인 정책자금, 일반경영안정자금, 긴급경영안정자금, 성장촉진자금, 신용보증재단 보증을 신청 전 기준과 준비 순서 중심으로 비교합니다.",
    category: "소상공인",
    keywords: ["소상공인 정책자금", "소상공인 대출", "소상공인 지원금", "소상공인시장진흥공단 정책자금"],
    links: ["소상공인-일반경영안정자금", "소상공인-긴급경영안정자금", "소상공인-성장촉진자금", "소상공인-신용보증재단보증", "소상공인-소공인특화자금", "희망리턴패키지"]
  },
  {
    slug: "창업지원금",
    title: "창업지원금 종류와 신청 준비 순서",
    h1: "창업지원금",
    desc: "예비창업패키지, 초기창업패키지, 창업도약패키지, 청년창업사관학교 등 창업지원금의 대상과 준비 서류를 비교합니다.",
    category: "창업",
    keywords: ["창업지원금", "예비창업패키지", "초기창업패키지", "청년창업사관학교", "창업 정책자금"],
    links: ["예비창업패키지", "초기창업패키지", "창업도약패키지", "청년창업사관학교", "창업-예비창업패키지", "창업-초기창업패키지"]
  },
  {
    slug: "중소기업-정책자금",
    title: "중소기업 정책자금 운전자금·시설자금 비교",
    h1: "중소기업 정책자금",
    desc: "중소기업 운전자금, 경영안정자금, 수출기업 자금, R&D 자금, 스마트공장 자금을 신청 목적별로 비교합니다.",
    category: "중소기업",
    keywords: ["중소기업 정책자금", "중소기업 운전자금", "중소기업 경영안정자금", "중소기업 시설자금"],
    links: ["중소기업운전자금", "중소기업-경영안정자금", "중소기업-설비투자자금", "중소기업-수출보증", "중소기업-RD혁신형자금", "스마트제조혁신지원"]
  },
  {
    slug: "고용지원금",
    title: "고용지원금 종류와 사업주 신청 체크리스트",
    h1: "고용지원금",
    desc: "청년일자리도약장려금, 고용유지지원금, 고령자 계속고용장려금, 사업주 훈련지원 등 고용지원금을 비교합니다.",
    category: "고용",
    keywords: ["고용지원금", "청년일자리도약장려금", "고용유지지원금", "사업주 지원금", "고용노동부 지원금"],
    links: ["청년일자리도약장려금", "고용유지지원금", "고령자고용연장지원금", "사업주직업능력개발훈련", "고용-청년일자리도약장려금", "고용-고용유지지원금"]
  },
  {
    slug: "서민금융-대출",
    title: "서민금융 대출과 생활안정자금 비교",
    h1: "서민금융 대출",
    desc: "햇살론, 햇살론뱅크, 소액생계비대출, 근로자햇살론, 미소금융 창업대출을 조건별로 비교합니다.",
    category: "서민금융",
    keywords: ["서민금융 대출", "햇살론", "소액생계비대출", "근로자햇살론", "미소금융 창업대출"],
    links: ["햇살론", "소액생계비대출", "근로자-햇살론", "미소금융창업대출", "서민금융-햇살론뱅크", "서민금융-소액생계비대출"]
  },
  {
    slug: "정부지원금-종류",
    title: "정부지원금 종류를 대상별로 보는 방법",
    h1: "정부지원금 종류",
    desc: "소상공인, 창업자, 중소기업, 사업주, 서민금융 이용자가 먼저 확인할 정부지원금 종류를 대상별로 정리합니다.",
    category: "정책자금",
    keywords: ["정부지원금 종류", "정부 지원금", "정책자금 종류", "정부지원금 신청"],
    links: ["소상공인-정책자금", "창업지원금", "중소기업-정책자금", "고용지원금", "서민금융-대출", "정책자금-신청방법"]
  },
  {
    slug: "정책자금-신청방법",
    title: "정책자금 신청방법과 서류 준비 순서",
    h1: "정책자금 신청방법",
    desc: "정책자금 신청 전 자격 확인, 공식 공고 확인, 필요 서류 준비, 온라인 접수, 보완 요청 대응 순서를 정리합니다.",
    category: "정책자금",
    keywords: ["정책자금 신청방법", "정책자금 서류", "정부지원금 신청방법", "정책자금 준비"],
    links: ["소상공인-정책자금", "창업지원금", "중소기업-정책자금", "고용지원금", "서민금융-대출", "소상공인-일반경영안정자금"]
  }
];

const hubSlugs = new Set(hubPages.map((page) => page.slug));
const categoryHubSlug = {
  "소상공인": "소상공인-정책자금",
  "창업": "창업지원금",
  "중소기업": "중소기업-정책자금",
  "고용": "고용지원금",
  "서민금융": "서민금융-대출",
  "비사업자": "서민금융-대출",
  "정책자금": "정부지원금-종류"
};

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

function stripTags(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value = "") {
  return String(value)
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function match(html, regex, fallback = "") {
  const found = html.match(regex);
  return found ? decodeEntities(found[1]).trim() : fallback;
}

function normalizeIsoDate(value = "") {
  const text = String(value || "").trim();
  const iso = text.match(/20\d{2}-\d{2}-\d{2}/);
  if (iso) return iso[0];
  const month = text.match(/(20\d{2})[.\-/년\s]+(\d{1,2})/);
  if (month) return `${month[1]}-${month[2].padStart(2, "0")}-01`;
  return lastmod;
}

function segmentUrl(slug) {
  return `${siteUrl}/${encodeURIComponent(slug)}/`;
}

function readPageMeta(html, slug) {
  const title = match(html, /<title>([\s\S]*?)<\/title>/i, `${slug} | 정책자금 백과`);
  const description = match(html, /<meta\s+name="description"\s+content="([^"]*)"/i, `${title} 정보를 정리했습니다.`);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i, segmentUrl(slug));
  const h1 = stripTags(match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i, title.replace(/\s*\|\s*정책자금 백과$/, "")));
  const crumb = stripTags(match(html, /<div\s+class="crumb">([\s\S]*?)<\/div>/i, "홈 / 정책자금 / 공식 기관"));
  const crumbParts = crumb.split("/").map((part) => part.trim()).filter(Boolean);
  const category = crumbParts[1] || inferCategory(slug);
  const agency = match(html, /<div class="sum"><b>담당 기관<\/b><span>([\s\S]*?)<\/span><\/div>/i, crumbParts[2] || "공식 기관");
  const official = match(html, /<a\s+class="official"\s+href="([^"]*)"/i, siteUrl);
  const updated = normalizeIsoDate(match(html, /마지막 업데이트 기준:\s*([^<]+)/i, lastmod));
  return { title, description, canonical, h1, category, agency, official, updated };
}

function inferCategory(slug) {
  if (slug.startsWith("소상공인")) return "소상공인";
  if (slug.startsWith("창업") || slug.includes("창업")) return "창업";
  if (slug.startsWith("고용") || slug.includes("일자리")) return "고용";
  if (slug.startsWith("중소기업") || slug.includes("수출")) return "중소기업";
  if (slug.startsWith("서민금융") || slug.includes("햇살론") || slug.includes("생계비")) return "서민금융";
  return "정책자금";
}

function keywordSet(meta) {
  const core = meta.h1.replace(/\s*[—|-].*$/, "").trim();
  return [
    core,
    `${core} 신청방법`,
    `${core} 지원대상`,
    `${core} 필요서류`,
    `${core} 한도`,
    `${core} 금리`,
    `${meta.category} 정책자금`,
    `${meta.agency} 지원금`,
    "정책자금",
    "정부지원금"
  ].filter(Boolean);
}

function buildDetailGraph(meta) {
  const keywords = [...new Set(keywordSet(meta))];
  const hubSlug = categoryHubSlug[meta.category] || "정부지원금-종류";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "정책자금 백과",
        "url": siteUrl,
        "description": "정부 정책자금과 지원사업 공고를 신청 전 점검 관점으로 정리하는 정보 사이트입니다."
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "name": "정책자금 백과",
        "url": siteUrl,
        "inLanguage": "ko-KR",
        "publisher": { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${meta.canonical}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "정책자금 백과", "item": `${siteUrl}/` },
          { "@type": "ListItem", "position": 2, "name": meta.category, "item": segmentUrl(hubSlug) },
          { "@type": "ListItem", "position": 3, "name": meta.h1, "item": meta.canonical }
        ]
      },
      {
        "@type": "WebPage",
        "@id": `${meta.canonical}#webpage`,
        "url": meta.canonical,
        "name": meta.title,
        "description": meta.description,
        "inLanguage": "ko-KR",
        "isPartOf": { "@id": `${siteUrl}/#website` },
        "breadcrumb": { "@id": `${meta.canonical}#breadcrumb` },
        "dateModified": meta.updated,
        "reviewedBy": { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": "Article",
        "@id": `${meta.canonical}#article`,
        "headline": meta.title,
        "description": meta.description,
        "mainEntityOfPage": { "@id": `${meta.canonical}#webpage` },
        "url": meta.canonical,
        "inLanguage": "ko-KR",
        "isAccessibleForFree": true,
        "datePublished": meta.updated,
        "dateModified": meta.updated,
        "author": { "@type": "Organization", "name": "정책자금 백과 편집팀", "url": siteUrl },
        "publisher": { "@id": `${siteUrl}/#organization` },
        "about": keywords.slice(0, 6).map((name) => ({ "@type": "Thing", name })),
        "keywords": keywords.join(", "),
        "citation": meta.official,
        "mentions": [
          { "@type": "Organization", "name": meta.agency },
          { "@type": "Thing", "name": meta.category }
        ]
      },
      {
        "@type": "GovernmentService",
        "@id": `${meta.canonical}#service`,
        "name": meta.h1,
        "serviceType": meta.category,
        "provider": { "@type": "Organization", "name": meta.agency },
        "url": meta.official,
        "areaServed": "KR"
      }
    ]
  };
}

function buildTrustMeta(meta) {
  const keywords = [...new Set(keywordSet(meta))].join(", ");
  return `  <!-- SEO trust metadata -->
  <meta name="author" content="정책자금 백과 편집팀">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:url" content="${escapeHtml(meta.canonical)}">
  <meta property="article:section" content="${escapeHtml(meta.category)}">
  <meta property="article:modified_time" content="${meta.updated}T00:00:00+09:00">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  <!-- /SEO trust metadata -->`;
}

function hardenDetailPage(html, slug) {
  const meta = readPageMeta(html, slug);
  const trustMeta = buildTrustMeta(meta);
  const graph = `<script type="application/ld+json">${JSON.stringify(buildDetailGraph(meta))}</script>`;
  let next = html;

  next = next.replace(/\n?\s*<!-- SEO trust metadata -->[\s\S]*?<!-- \/SEO trust metadata -->/i, "");
  next = next.replace(/(<meta\s+name="description"\s+content="[^"]*"\s*>)/i, `$1\n${trustMeta}`);
  next = next.replace(/\n?\s*<script type="application\/ld\+json"(?: id="[^"]+")?>[\s\S]*?<\/script>/gi, "");
  next = next.replace("</head>", `  ${graph}\n</head>`);

  return next;
}

function hubLinks(page) {
  return page.links
    .filter((slug) => slug && slug !== page.slug)
    .map((slug) => {
      const label = slug.replace(/-/g, " ");
      return `<li><a href="/${encodeURIComponent(slug)}/">${escapeHtml(label)}</a><span>관련 문서</span></li>`;
    })
    .join("");
}

function hubLongTailList(page) {
  return page.keywords
    .slice(0, 5)
    .map((keyword, index) => {
      const intent = [
        "처음 검색한 사람이 가장 먼저 보는 핵심어입니다.",
        "자격 조건과 신청 가능성을 확인할 때 자주 쓰입니다.",
        "공식 공고와 실제 준비 서류를 대조할 때 유용합니다.",
        "비슷한 제도 사이에서 우선순위를 정할 때 필요합니다.",
        "마감 전 빠르게 비교해야 할 때 묶어서 확인하면 좋습니다."
      ][index];
      return `<li><b>${escapeHtml(keyword)}</b><span>${intent}</span></li>`;
    })
    .join("");
}

function hubDepthSections(page) {
  const related = page.links.slice(0, 4).map((slug) => slug.replace(/-/g, " ")).join(", ");
  const topKeywords = page.keywords.slice(0, 3).join(", ");
  return `
    <section class="card">
      <h2>검색어별로 다르게 봐야 하는 이유</h2>
      <p>${escapeHtml(page.h1)}을 찾는 사람은 대부분 같은 단어를 검색해도 실제 상황은 조금씩 다릅니다. 사업자등록을 막 끝낸 사람, 매출이 줄어 긴급 자금이 필요한 사람, 직원을 새로 뽑으려는 사람, 기존 대출을 갈아타려는 사람은 모두 확인해야 할 공고와 서류가 달라집니다.</p>
      <p>그래서 이 페이지는 ${escapeHtml(topKeywords)}처럼 많이 찾는 표현을 하나의 입구로 묶고, 아래 관련 문서에서 실제 제도별 조건을 다시 확인하도록 구성했습니다. 검색에서 바로 들어온 사용자가 첫 화면에서 방향을 잡고, 세부 문서로 넘어가면서 신청 가능성과 준비 순서를 좁혀갈 수 있게 만든 구조입니다.</p>
      <ul class="intent-list">${hubLongTailList(page)}</ul>
    </section>
    <section class="card">
      <h2>편집자가 먼저 확인하는 기준</h2>
      <p>정책자금 공고를 정리하다 보면 이름은 비슷하지만 실제 판단 기준은 다른 경우가 많습니다. 같은 ${escapeHtml(page.category)} 영역이라도 업력, 매출 규모, 고용 인원, 신용 상태, 사업장 소재지, 이전 지원 이력에 따라 신청 가능성이 갈립니다. 제목만 보고 바로 신청하기보다 이 기준을 먼저 나누면 헛걸음을 줄일 수 있습니다.</p>
      <p>특히 공고문에는 지원 대상, 제외 대상, 접수 방식, 예산 소진 여부가 따로 적혀 있는 경우가 많습니다. 정책자금 백과는 이 흐름을 기준으로 문서를 정리해 사용자가 공식 사이트로 이동하기 전에 스스로 맞는 제도를 추릴 수 있도록 돕습니다.</p>
    </section>
    <section class="card">
      <h2>세부 문서로 넘어가기 전 체크</h2>
      <div class="rows">
        <div class="row"><b>대상 확인</b><span>개인, 법인, 예비창업자, 소상공인, 중소기업, 근로자 등 내 위치를 먼저 정합니다.</span></div>
        <div class="row"><b>목적 확인</b><span>운영비, 시설비, 고용, 창업, 생계, 보증, 교육처럼 자금의 쓰임을 나눕니다.</span></div>
        <div class="row"><b>시점 확인</b><span>상시 접수인지, 회차별 접수인지, 예산 소진형인지 확인해야 합니다.</span></div>
        <div class="row"><b>증빙 확인</b><span>사업자등록증, 매출 자료, 납세 증명, 고용보험 자료, 금융거래 자료를 미리 모읍니다.</span></div>
      </div>
      <p>${escapeHtml(related)} 같은 문서는 이 기준을 실제 제도 단위로 다시 풀어둔 페이지입니다. 큰 키워드에서 들어왔다면 여기서 방향을 잡고, 세부 키워드 문서에서 공식 신청처와 조건을 확인하는 흐름이 가장 빠릅니다.</p>
    </section>
    <section class="card">
      <h2>자주 헷갈리는 질문</h2>
      <p><b>${escapeHtml(page.h1)}은 한 번에 여러 개 신청해도 되나요?</b><br>제도마다 중복 수혜 제한과 기존 지원 이력 기준이 다릅니다. 같은 목적의 자금을 동시에 받기 어렵거나, 이미 받은 보증과 대출이 심사에 영향을 주는 경우가 있어 공식 공고의 중복 제한을 꼭 확인해야 합니다.</p>
      <p><b>검색 결과에서 바로 공식 사이트로 가면 안 되나요?</b><br>바로 가도 됩니다. 다만 공식 사이트는 공고 단위로 흩어져 있어 처음 보는 사람은 어느 제도부터 봐야 할지 헷갈릴 수 있습니다. 이 페이지는 공식 신청 전 방향을 잡는 비교 지도 역할을 합니다.</p>
      <p><b>가장 먼저 준비할 서류는 무엇인가요?</b><br>대부분은 본인 또는 사업자 확인 자료, 매출 또는 소득 자료, 납세 관련 증명, 금융 또는 고용 관련 증빙에서 시작합니다. 세부 문서로 이동하면 제도별로 더 가까운 준비 순서를 확인할 수 있습니다.</p>
    </section>`;
}

function hubGraph(page, canonical) {
  const itemListElement = page.links.map((slug, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": slug.replace(/-/g, " "),
    "url": segmentUrl(slug)
  }));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "정책자금 백과",
        "url": siteUrl
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "name": "정책자금 백과",
        "url": siteUrl,
        "inLanguage": "ko-KR",
        "publisher": { "@id": `${siteUrl}/#organization` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "정책자금 백과", "item": `${siteUrl}/` },
          { "@type": "ListItem", "position": 2, "name": page.h1, "item": canonical }
        ]
      },
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        "url": canonical,
        "name": page.title,
        "description": page.desc,
        "inLanguage": "ko-KR",
        "dateModified": lastmod,
        "publisher": { "@id": `${siteUrl}/#organization` },
        "breadcrumb": { "@id": `${canonical}#breadcrumb` },
        "mainEntity": {
          "@type": "ItemList",
          "name": `${page.h1} 주요 문서`,
          itemListElement
        }
      }
    ]
  };
}

function hubHtml(page) {
  const canonical = segmentUrl(page.slug);
  const keywords = [...new Set(page.keywords.concat([page.category, "정책자금", "정부지원금"]))].join(", ");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.title)} | 정책자금 백과</title>
  <meta name="description" content="${escapeHtml(page.desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="google-site-verification" content="${searchConsoleVerification}">
  <meta name="author" content="정책자금 백과 편집팀">
  <meta name="keywords" content="${escapeHtml(keywords)}">
  <link rel="canonical" href="${canonical}">
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
    .card{padding:26px;margin-bottom:16px}.rows{border-top:1px solid var(--line)}.row{display:grid;grid-template-columns:132px 1fr;gap:12px;padding:13px 0;border-bottom:1px solid var(--line)}.row b{color:var(--muted)}
    .related{display:grid;gap:8px;padding:0;margin:0;list-style:none}.related li{display:flex;justify-content:space-between;gap:12px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--soft)}.related a{font-weight:700;color:var(--ink);text-decoration:none}.related span{color:var(--muted);font-size:13px}
    .intent-list{display:grid;gap:8px;padding:0;margin:14px 0 0;list-style:none}.intent-list li{display:grid;gap:3px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--soft)}.intent-list b{color:var(--ink)}.intent-list span{color:var(--muted);font-size:14px}
    .note{border-left:4px solid var(--blue);padding:14px 16px;background:#eff6ff;border-radius:0 10px 10px 0}
    @media(max-width:720px){.row{grid-template-columns:1fr}.related li{display:grid}.hero,.card{padding:20px}.nav{align-items:flex-start;flex-direction:column}}
  </style>
  <script type="application/ld+json">${JSON.stringify(hubGraph(page, canonical))}</script>
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
      <div class="crumb"><a href="/">홈</a> / ${escapeHtml(page.category)} / 키워드 허브</div>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lead">${escapeHtml(page.desc)}</p>
      <div class="tags">${page.keywords.slice(0, 5).map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("")}</div>
    </section>
    <section class="card">
      <h2>먼저 확인할 기준</h2>
      <p>${escapeHtml(page.h1)}은 제목만 보고 고르면 안 됩니다. 신청 가능성은 대상, 업력, 매출 규모, 고용 상태, 기존 채무, 세금 체납 여부, 공식 접수 기간을 함께 보아야 판단할 수 있습니다.</p>
      <p>정책자금 백과는 이 허브 페이지에서 중형 키워드를 먼저 정리하고, 아래 개별 문서에서 지원 대상·한도·금리·필요 서류·공식 신청처를 세부적으로 확인하도록 구성했습니다.</p>
      <div class="note">최종 신청 가능 여부와 접수 마감은 각 기관의 최신 공식 공고가 우선합니다.</div>
    </section>
    <section class="card">
      <h2>신청 전 체크 순서</h2>
      <div class="rows">
        <div class="row"><b>1단계</b><span>내 상황이 ${escapeHtml(page.category)} 영역에 맞는지 먼저 확인합니다.</span></div>
        <div class="row"><b>2단계</b><span>지원 대상, 제외 업종, 신청 지역, 접수 기간을 공식 공고 기준으로 확인합니다.</span></div>
        <div class="row"><b>3단계</b><span>사업자등록증, 매출 증빙, 납세증명, 고용보험 자료 등 반복 제출 서류를 미리 준비합니다.</span></div>
        <div class="row"><b>4단계</b><span>아래 관련 문서에서 한도와 신청 흐름을 비교한 뒤 공식 사이트로 이동합니다.</span></div>
      </div>
    </section>
    ${hubDepthSections(page)}
    <section class="card">
      <h2>같이 봐야 할 세부 문서</h2>
      <ul class="related">${hubLinks(page)}</ul>
    </section>
  </main>
</body>
</html>`;
}

async function writeHubPages() {
  for (const page of hubPages) {
    const dir = path.join(root, page.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), hubHtml(page).replace(/[ \t]+$/gm, ""));
  }
}

async function detailDirs() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const dirs = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name === "scripts" || entry.name === "android") continue;
    const indexPath = path.join(root, entry.name, "index.html");
    try {
      await fs.access(indexPath);
      dirs.push(entry.name);
    } catch {
      // Ignore folders that are not public pages.
    }
  }
  return dirs.sort((a, b) => a.localeCompare(b, "ko"));
}

async function hardenDetails() {
  const dirs = await detailDirs();
  for (const slug of dirs) {
    if (hubSlugs.has(slug)) continue;
    const file = path.join(root, slug, "index.html");
    const html = await fs.readFile(file, "utf8");
    const next = hardenDetailPage(html, slug);
    if (next !== html) await fs.writeFile(file, next);
  }
}

async function hardenHome() {
  const file = path.join(root, "index.html");
  let html = await fs.readFile(file, "utf8");
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/#collection`,
        "url": `${siteUrl}/`,
        "name": "정책자금 백과",
        "description": "소상공인, 창업자, 중소기업, 사업주, 서민금융 이용자를 위한 정책자금 정보 모음입니다.",
        "inLanguage": "ko-KR",
        "dateModified": lastmod,
        "mainEntity": {
          "@type": "ItemList",
          "name": "정책자금 핵심 키워드 허브",
          "itemListElement": hubPages.map((page, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": page.h1,
            "url": segmentUrl(page.slug)
          }))
        }
      }
    ]
  };
  const block = `<script type="application/ld+json" id="policyfundpedia-seo-graph">${JSON.stringify(graph)}</script>`;
  if (html.includes('id="policyfundpedia-seo-graph"')) {
    html = html.replace(/<script type="application\/ld\+json" id="policyfundpedia-seo-graph">[\s\S]*?<\/script>/, block);
  } else {
    html = html.replace("</head>", `${block}\n</head>`);
  }
  await fs.writeFile(file, html);
}

async function writeSitemap() {
  const dirs = await detailDirs();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${siteUrl}/</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`
  ];
  for (const page of hubPages) {
    lines.push(`  <url><loc>${segmentUrl(page.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.92</priority></url>`);
  }
  for (const slug of dirs) {
    if (hubSlugs.has(slug)) continue;
    lines.push(`  <url><loc>${siteUrl}/${escapeXml(encodeURIComponent(slug))}/</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.86</priority></url>`);
  }
  lines.push("</urlset>");
  await fs.writeFile(path.join(root, "sitemap.xml"), `${lines.join("\n")}\n`);
}

async function main() {
  await writeHubPages();
  await hardenDetails();
  await hardenHome();
  await writeSitemap();
}

await main();
