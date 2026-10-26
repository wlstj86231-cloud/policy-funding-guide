import fs from "node:fs/promises";
import path from "node:path";
import {
  SITE_URL as siteUrl, ORG_ID, WEBSITE_ID, CHROME_CSS, escapeHtml, headerHtml, footerHtml,
  metaBlockHtml, sourceListHtml, jsonLdScript, replaceBlock, hasBlock
} from "./site-chrome.mjs";

const root = path.resolve(import.meta.dirname, "..");
const verifiedDataPath = path.join(root, "data", "verified-funds.json");
const searchConsoleVerification = "tSlD6MvlQAUKN3XASMGLU-vJTeaoUxCSFg-tn3JMmvk";
// 손으로 쓴 페이지의 공식 원문을 실제로 다시 대조한 날. 자동으로 오늘 날짜를 넣지 않는다.
const CHECKED_AT = "2026-10-26";
const generatedMarker = "policyfundpedia-static-detail";
// 보리장터 연결은 HTML 속성 안에 쓰므로 &를 미리 이스케이프한다.
const boribayUtm = "utm_source=policyfundpedia.com&amp;utm_medium=referral&amp;utm_campaign=support";
const HUB_NAME = "농업 정책자금 한눈에";

// 손으로 관리하는 페이지. 머리글·바닥글·작성 정보·JSON-LD·사이트맵은 여기서 일괄 적용한다.
// published = 그 페이지를 처음 공개한 커밋 날짜(git log --diff-filter=A).
// checked = 원문을 마지막으로 대조한 날(없으면 CHECKED_AT). modified = 페이지를 마지막으로 고친 날.
const STATIC_PAGES = [
  { file: "index.html", path: "/", type: "WebPage", published: "2026-09-04", modified: CHECKED_AT, meta: true, faq: true, changefreq: "weekly", priority: "1.0" },
  { file: "agri/index.html", path: "/agri/", type: "CollectionPage", published: "2026-09-27", modified: CHECKED_AT, meta: true, itemList: true, crumbs: [[HUB_NAME, "/agri/"]], changefreq: "monthly", priority: "0.9" },
  { file: "guides/used-farm-machinery-loan-limit-2026/index.html", path: "/guides/used-farm-machinery-loan-limit-2026/", type: "Article", published: "2026-10-26", modified: CHECKED_AT, meta: true, crumbs: [[HUB_NAME, "/agri/"], ["중고 농기계 융자 한도 계산", "/guides/used-farm-machinery-loan-limit-2026/"]], changefreq: "monthly", priority: "0.8" },
  { file: "guides/farmer-machinery-loan-execution-2026/index.html", path: "/guides/farmer-machinery-loan-execution-2026/", type: "Article", published: "2026-09-24", modified: CHECKED_AT, checked: "2026-10-15", meta: true, crumbs: [[HUB_NAME, "/agri/"], ["후계농 농기계 구입 전 확인", `/${encodeURIComponent("2026-후계농-농기계-구입자금")}/`], ["자금 실행 순서와 서류", "/guides/farmer-machinery-loan-execution-2026/"]], changefreq: "monthly", priority: "0.6" },
  { file: "about/index.html", path: "/about/", type: "AboutPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["소개", "/about/"]], changefreq: "monthly", priority: "0.5" },
  { file: "contact/index.html", path: "/contact/", type: "ContactPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["문의", "/contact/"]], changefreq: "monthly", priority: "0.5" },
  { file: "editorial-policy/index.html", path: "/editorial-policy/", type: "WebPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["편집 원칙", "/editorial-policy/"]], changefreq: "monthly", priority: "0.5" },
  { file: "corrections/index.html", path: "/corrections/", type: "WebPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["정정·수정 기록", "/corrections/"]], changefreq: "monthly", priority: "0.5" },
  { file: "privacy/index.html", path: "/privacy/", type: "WebPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["개인정보처리방침", "/privacy/"]], changefreq: "yearly", priority: "0.3" },
  { file: "terms/index.html", path: "/terms/", type: "WebPage", published: "2026-09-04", modified: CHECKED_AT, crumbs: [["이용약관·면책", "/terms/"]], changefreq: "yearly", priority: "0.3" },
  { file: "retired/index.html", path: "/retired/", noindex: true },
  { file: "404.html", path: null, noindex: true }
];

function escapeXml(value = "") {
  return escapeHtml(value).replace(/'/g, "&apos;");
}

function clean(value, fallback = "공식 공고 확인") {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  return text || fallback;
}

function parseArray(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "string") return [];
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
    .replace(/^-|-$/g, "") || "policy-fund";
}

function tagText(tag) {
  if (typeof tag === "string") return clean(tag);
  return clean(tag?.t || tag?.text || "");
}

async function fetchFunds() {
  const data = JSON.parse(await fs.readFile(verifiedDataPath, "utf8"));
  const items = Array.isArray(data) ? data : data.items;
  if (!Array.isArray(items) || !items.length) {
    throw new Error("data/verified-funds.json에 공개 가능한 검증 데이터가 없습니다.");
  }
  return items;
}

function normalizeFund(raw, index) {
  const tags = parseArray(raw.tags).map(tagText).filter(Boolean);
  const steps = parseArray(raw.steps).map((item) => clean(item)).filter(Boolean);
  const limit = clean(raw.lim || raw.limit || raw.amount_desc);
  const rate = clean(raw.rate || raw.rate_desc);
  return {
    id: raw.id ?? index + 1,
    cat: clean(raw.cat, "농업인"),
    title: clean(raw.title, "농업 정책자금 안내"),
    excerpt: clean(raw.excerpt || raw.detail, "농업 정책자금 핵심 정보를 정리했습니다."),
    detail: clean(raw.detail || raw.excerpt, "공식 지침 기준으로 신청 대상과 절차를 확인해야 합니다."),
    limit,
    rate,
    org: clean(raw.org || raw.agency_name || "공식 기관"),
    deadline: clean(raw.deadline || "공식 공고 확인"),
    targetDesc: clean(raw.target_desc, "공식 공고의 대상 요건 확인"),
    amountDesc: clean(raw.amount_desc || raw.lim || raw.limit),
    rateDesc: clean(raw.rate_desc || raw.rate),
    periodDesc: clean(raw.period_desc || "공식 공고 확인"),
    docs: clean(raw.docs || "공식 지침의 제출서류 목록 확인"),
    agency: /^https?:\/\//.test(String(raw.agency || "")) ? raw.agency : siteUrl,
    agencyName: clean(raw.agency_name || raw.org || "공식 기관"),
    agencyNote: clean(raw.agency_note || "신청 전 공식 사이트에서 최신 공고와 세부 요건을 확인하세요."),
    tags: tags.length ? tags : [clean(raw.cat || "농업인")],
    steps: steps.length ? steps : ["공식 공고 확인", "지원 대상 검토", "필요 서류 준비", "신청"],
    updated: clean(raw.updated || raw.reviewedAt || "", ""),
    reviewedAt: clean(raw.reviewedAt || raw.updated || "", ""),
    published: clean(raw.published || "", ""),
    status: clean(raw.status || "신청 조건 확인 필요"),
    sourceTitle: clean(raw.sourceTitle || "", ""),
    sourceAuthority: clean(raw.sourceAuthority || raw.agency_name || raw.org || "", ""),
    sourceDate: clean(raw.sourceDate || "", ""),
    sourceUrl: /^https:\/\//.test(String(raw.sourceUrl || "")) ? String(raw.sourceUrl) : "",
    eligibility: parseArray(raw.eligibility).map((item) => clean(item)).filter(Boolean),
    exclusions: parseArray(raw.exclusions).map((item) => clean(item)).filter(Boolean),
    documents: parseArray(raw.documents).map((item) => clean(item)).filter(Boolean),
    cautions: parseArray(raw.cautions).map((item) => clean(item)).filter(Boolean),
    faq: Array.isArray(raw.faq) ? raw.faq.map((item) => ({ q: clean(item?.q, ""), a: clean(item?.a, "") })).filter((item) => item.q && item.a) : [],
    editorNote: clean(raw.editorNote || "", ""),
    nextCheck: clean(raw.nextCheck || "", ""),
    timeline: Array.isArray(raw.timeline) ? raw.timeline.map((item) => ({ when: clean(item?.when, ""), what: clean(item?.what, "") })).filter((item) => item.when && item.what) : [],
    rejections: parseArray(raw.rejections).map((item) => clean(item, "")).filter(Boolean),
    sourceExtra: Array.isArray(raw.sourceExtra) ? raw.sourceExtra.filter((item) => /^https:\/\//.test(String(item?.url || ""))).map((item) => ({ title: clean(item.title, ""), authority: clean(item.authority, ""), url: String(item.url), note: clean(item.note, "") })).filter((item) => item.title && item.authority) : [],
    slug: slugify(raw.slug || raw.title || raw.id || `policy-fund-${index + 1}`)
  };
}

function assertPublishable(fund) {
  const errors = [];
  if (!fund.sourceUrl) errors.push("직접 공식 출처 URL");
  try {
    const source = new URL(fund.sourceUrl);
    if (source.pathname === "/" && !source.search) errors.push("기관 홈이 아닌 상세 출처 URL");
  } catch {
    errors.push("유효한 HTTPS 출처 URL");
  }
  if (!fund.sourceTitle) errors.push("공식 공고·지침명");
  if (!fund.sourceAuthority) errors.push("발표 기관");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fund.reviewedAt)) errors.push("실제 검수일");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fund.published) || fund.published > fund.reviewedAt) errors.push("게시일(검수일 이전)");
  if (fund.eligibility.length < 2) errors.push("세부 대상 요건");
  if (fund.documents.length < 2) errors.push("준비 서류");
  if (fund.cautions.length < 2) errors.push("주의사항");
  if (fund.faq.length < 2) errors.push("FAQ");
  if (fund.editorNote.length < 75) errors.push("확인 방법 기록");
  if (fund.nextCheck.length < 40) errors.push("다음 확인 일정");
  const evidenceLength = [fund.detail, fund.targetDesc, fund.amountDesc, fund.rateDesc, fund.periodDesc, ...fund.eligibility, ...fund.exclusions, ...fund.documents, ...fund.cautions, ...fund.faq.flatMap((item) => [item.q, item.a]), fund.editorNote].join(" ").length;
  if (evidenceLength < 650) errors.push("고유 설명 650자");
  if (errors.length) throw new Error(`${fund.title}: 품질 게이트 누락 - ${errors.join(", ")}`);
}

function normalizeFunds(rawFunds) {
  const seen = new Map();
  const funds = rawFunds.map(normalizeFund).filter((fund) => fund.slug && fund.title).map((fund) => {
    if (seen.has(fund.slug)) throw new Error(`중복 문서 slug: ${fund.slug}`);
    seen.set(fund.slug, true);
    return fund;
  });
  funds.forEach(assertPublishable);
  return funds;
}

function fundPath(fund) {
  return `/${encodeURIComponent(fund.slug)}/`;
}

function fundSources(fund) {
  return [
    { title: fund.sourceTitle, authority: fund.sourceAuthority, url: fund.sourceUrl, note: fund.sourceDate },
    ...fund.sourceExtra.map((item) => ({ title: item.title, authority: item.authority, url: item.url, note: item.note }))
  ];
}

function breadcrumbNode(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [["홈", "/"], ...items].map(([name, href], index) => ({ "@type": "ListItem", position: index + 1, name, item: `${siteUrl}${href}` }))
  };
}

function relatedFor(fund, funds) {
  return funds.filter((item) => item.slug !== fund.slug && item.cat === fund.cat).slice(0, 5);
}

function pageHtml(fund, related) {
  const pathname = fundPath(fund);
  const canonical = `${siteUrl}${pathname}`;
  const title = `${fund.title} | 농업 정책자금 백과`;
  const desc = clean(fund.excerpt).slice(0, 155);
  const shortTitle = fund.title.split("—")[0].trim();
  const sources = fundSources(fund);
  const timelineItems = fund.timeline.map((item) => `<li><b>${escapeHtml(item.when)}</b><span>${escapeHtml(item.what)}</span></li>`).join("");
  const timelineSection = timelineItems ? `
        <h2 class="d-stitle">일정</h2>
        <ol class="timeline">${timelineItems}</ol>
        <p class="small-note">지난 날짜는 기록용입니다. 다음 해 일정은 새 지침·공고가 나온 뒤 다시 확인하세요.</p>` : "";
  const rejectionSection = fund.rejections.length ? `
        <h2 class="d-stitle">선정·대출에서 막히는 사유</h2>
        <section class="info-panel warn"><h3>지침 원문에 적힌 제외·거절 사유</h3><ul class="plain-list">${fund.rejections.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>` : "";
  const tagItems = fund.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const stepItems = fund.steps.map((step, idx) => `<div class="step-item"><span class="step-n">${idx + 1}</span><span class="step-t">${escapeHtml(step)}</span></div>`).join("");
  const relatedItems = related.map((item) => `<a class="related-item" href="${fundPath(item)}" data-prefetch><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.org)}</small></a>`).join("");
  const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const faqItems = fund.faq.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("");
  const machineryChecklist = fund.slug === "2026-후계농-농기계-구입자금" ? `
        <h2 class="d-stitle">자금 실행 서류를 준비한다면</h2>
        <div class="info-panel"><h3>선정 이후에도 배정과 대출 심사가 남습니다</h3>
          <p>계약 전에 자금 배정, 취급기관 상담, 사업추진확인서의 순서를 확인하세요. <a href="/guides/farmer-machinery-loan-execution-2026/">후계농 농기계 자금 실행 순서·서류 확인표</a>는 사전·사후 대출에 필요한 증빙을 나누어 정리합니다.</p>
        </div>
        <h2 class="d-stitle">중고 트랙터를 검토한다면</h2>
        <div class="info-panel"><h3>자금 대상 확인과 기계 점검은 각각 필요합니다</h3>
          <p>이 지침은 중고 농기계의 허용 범위를 따로 적지 않으므로 구매 전에 관할 시군구와 대출취급기관에 확인하세요. 중고 구입을 지침에 명시한 별도 사업은 <a href="/2026-%EB%86%8D%EC%97%85%EA%B8%B0%EA%B3%84-%EA%B5%AC%EC%9E%85%EC%9E%90%EA%B8%88-%EC%9C%B5%EC%9E%90/">농업기계 구입자금 융자</a>이며, <a href="/guides/used-farm-machinery-loan-limit-2026/">중고 농기계 융자 한도 계산</a>으로 그 사업의 한도 공식을 미리 적용해 볼 수 있습니다.</p>
          <p>자금 적합성을 확인한 뒤에는 명판, 사용시간, 누유와 PTO를 현장에서 따로 점검하세요. 같은 운영사(제이 미디어)의 보리장터 <a href="https://boribay.com/guides/used-tractor-buying-checklist?${boribayUtm}" rel="noopener">중고 트랙터 구매 점검 항목</a>은 거래 판단을 돕는 참고자료이며 자금 승인이나 융자 대상 확인을 대신하지 않습니다.</p>
        </div>` : fund.slug === "2026-농업기계-구입자금-융자" ? `
        <h2 class="d-stitle">중고 기계 한도를 미리 계산하려면</h2>
        <div class="info-panel"><h3>지침 [별표 3] 공식을 그대로 적용합니다</h3>
          <p><a href="/guides/used-farm-machinery-loan-limit-2026/">중고 농기계 융자 한도 계산</a>에 기종, 최초 구입 연도, 매매가격을 넣으면 '매매가격×80%'와 '새 기계 한도×융자기준율' 중 낮은 금액과 상환기간 기준을 보여 줍니다. 결과는 검토 기준일 뿐 대출 결정이 아닙니다.</p>
        </div>
        <h2 class="d-stitle">매물을 살펴본다면</h2>
        <div class="info-panel"><h3>융자 확인과 기계 점검을 나눠서 하세요</h3>
          <p>농협 상담 전에 후보 기계의 형식표지판·제조번호·최초 구입 시기를 매도인에게 받아 두면 상담이 빨라집니다. 같은 운영사(제이 미디어)가 운영하는 <a href="https://boribay.com/?category=MACHINERY&amp;${boribayUtm}" rel="noopener">보리장터 중고 농기계 매물</a>과 <a href="https://boribay.com/guides/used-tractor-buying-checklist?${boribayUtm}" rel="noopener">중고 트랙터 구매 점검 항목</a>을 참고할 수 있습니다. 보리장터 매물이라고 융자 대상이 되는 것은 아닙니다.</p>
        </div>` : "";
  const schema = jsonLdScript([
    {
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: fund.title,
      description: desc,
      inLanguage: "ko-KR",
      datePublished: fund.published,
      dateModified: fund.reviewedAt,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
      mainEntityOfPage: canonical,
      citation: sources.map((item) => item.url)
    },
    {
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
      mainEntity: fund.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
    },
    breadcrumbNode([[HUB_NAME, "/agri/"], [shortTitle, pathname]])
  ]);

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="google-site-verification" content="${searchConsoleVerification}">
  <meta name="author" content="제이 미디어 편집팀">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="google-adsense-account" content="ca-pub-5877883031077615">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5877883031077615" crossorigin="anonymous"></script>
  <style>
    :root{--ink:#0f172a;--ink2:#334155;--ink3:#5b6676;--ink4:#566173;--sur:#f8f7f5;--white:#fff;--line:rgba(15,23,42,.08);--line2:rgba(15,23,42,.14);--blue:#1a56db;--blue-bg:#eff5ff;--r:8px;--r2:14px;--f:'A2z','Noto Sans KR',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:var(--sur);color:var(--ink);font-family:var(--f);line-height:1.72;word-break:keep-all}a{color:inherit}
    .page{max-width:1080px;margin:0 auto;padding:24px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:22px}.d-card,.side-card{background:var(--white);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden}.d-top{padding:28px 28px 23px;border-bottom:1px solid var(--line)}.breadcrumb{font-size:12px;color:var(--ink4);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:6px}.breadcrumb a{color:var(--blue);text-decoration:none}.d-tags{display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap}.tag{display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px;background:var(--blue-bg);color:#1e429f}.d-title{font-size:clamp(24px,4vw,34px);font-weight:800;line-height:1.32;margin:0 0 10px;letter-spacing:-.5px}.d-desc{font-size:15px;color:var(--ink3);max-width:720px;margin:0}.d-summary{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)}.d-si{padding:18px 22px;border-right:1px solid var(--line)}.d-si:last-child{border-right:none}.d-sl{font-size:11px;color:var(--ink4);letter-spacing:.4px;text-transform:uppercase;margin-bottom:6px}.d-sv{font-size:18px;font-weight:800;color:var(--blue);line-height:1.25}.d-sv.ink{color:var(--ink);font-size:15px}.d-body{padding:24px 28px}.d-stitle{font-size:12px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin:24px 0 12px;padding-top:22px;border-top:1px solid var(--line)}.d-stitle:first-child{margin-top:0;padding-top:0;border-top:none}.info-rows{display:flex;flex-direction:column}.info-row{display:flex;border-bottom:1px solid var(--line);padding:11px 0}.info-row:last-child{border-bottom:none}.info-k{width:112px;flex-shrink:0;font-size:13px;color:var(--ink3)}.info-v{flex:1;font-size:13px;color:var(--ink);line-height:1.7}.step-list{display:flex;flex-direction:column;gap:10px}.step-item{display:flex;gap:12px;align-items:flex-start}.step-n{width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.step-t{font-size:13px;color:var(--ink2);line-height:1.65}.official-btn{display:flex;align-items:center;gap:12px;background:var(--blue-bg);border:1px solid rgba(26,86,219,.16);border-radius:var(--r);padding:14px 18px;margin-top:20px;text-decoration:none;transition:background .15s;width:100%;text-align:left}.official-btn:hover{background:#dce9fd}.official-btn strong{display:block;font-size:13px;color:#1e429f}.official-btn span{display:block;font-size:12px;color:var(--ink3);margin-top:2px}.note{margin-top:20px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:var(--r);padding:13px 15px;font-size:13px}
    .review-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.review-meta span{font-size:11px;color:var(--ink3);background:#f8fafc;border:1px solid var(--line);border-radius:999px;padding:5px 9px}.status{color:#166534!important;background:#f0fdf4!important;border-color:#bbf7d0!important}.plain-list{margin:0;padding-left:20px}.plain-list li{font-size:13px;color:var(--ink2);margin:7px 0}.split-info{display:grid;grid-template-columns:1fr 1fr;gap:12px}.info-panel{border:1px solid var(--line);border-radius:var(--r);padding:15px;background:#f8fafc}.info-panel h3{font-size:14px;margin:0 0 8px}.info-panel.warn{background:#fff7ed;border-color:#fed7aa}.faq-item{border-bottom:1px solid var(--line);padding:11px 0}.faq-item summary{font-size:13px;font-weight:700;cursor:pointer}.faq-item p{font-size:13px;color:var(--ink3);margin:8px 0 0}.editor-note{font-size:13px;color:var(--ink2);background:#f8fafc;border-left:3px solid var(--blue);padding:13px 15px}.side-card{padding:18px}.side-title{font-size:11px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}.tool-side{margin-bottom:14px;padding:18px;background:linear-gradient(150deg,#0f172a,#163f55);border-color:rgba(20,184,166,.24);color:#fff}.tool-side .side-title{color:#9ee9dd}.tool-side p{font-size:12px;line-height:1.65;color:rgba(248,250,252,.82);margin:0 0 13px}.tool-side a{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#b9f2e8;color:#0f172a;border-radius:var(--r);padding:10px 12px;font-size:13px;font-weight:800;text-decoration:none}.related-list{display:flex;flex-direction:column;gap:7px}.related-item{display:grid;gap:3px;text-decoration:none;background:#f8fafc;border:1px solid var(--line);border-radius:var(--r);padding:10px 12px}.related-item:hover{border-color:var(--blue)}.related-item span{font-size:13px;font-weight:700;color:var(--ink)}.related-item small{font-size:11px;color:var(--ink4)}.back-box{margin-top:14px;display:grid;gap:8px}.back-box a{text-decoration:none;text-align:center;border:1px solid var(--line2);background:#fff;border-radius:var(--r);padding:10px 12px;font-size:13px;color:var(--ink2)}
    @media(max-width:840px){.page{grid-template-columns:1fr;padding:18px 16px 60px}.d-summary,.split-info{grid-template-columns:1fr}.d-si{border-right:none;border-bottom:1px solid var(--line)}.info-row{display:grid;grid-template-columns:1fr}.d-top,.d-body{padding-left:20px;padding-right:20px}}
    .d-desc{font-size:17px;color:var(--ink2)}.info-k{font-size:15px}.info-v,.step-t,.plain-list li,.faq-item summary,.faq-item p,.editor-note,.info-panel p{font-size:16px}.info-panel h3{font-size:16px}.d-stitle{font-size:14px}.d-sl{font-size:13px}.review-meta span{font-size:13px}.tag{font-size:13px}.breadcrumb{font-size:14px}.step-n{width:26px;height:26px;font-size:13px}.official-btn strong{font-size:16px}.official-btn span{font-size:14px}.note{font-size:15px}.related-item span{font-size:15px}.related-item small{font-size:13px}.side-title{font-size:13px}.tool-side p{font-size:14px}.back-box a,.tool-side a{min-height:44px;display:flex;align-items:center;justify-content:center;font-size:15px}.info-panel a{color:var(--blue);font-weight:700}
    .timeline{list-style:none;margin:0;padding:0;border-left:3px solid #c7d7f5}.timeline li{position:relative;margin:0 0 12px;padding:0 0 0 16px;font-size:16px;color:var(--ink2)}.timeline li:before{content:"";position:absolute;left:-8px;top:8px;width:13px;height:13px;border-radius:50%;background:#fff;border:3px solid var(--blue)}.timeline b{display:block;font-size:15px;color:var(--ink)}.small-note{font-size:14px;color:var(--ink3);margin:6px 0 0}
    @media(max-width:600px){.d-si{padding:14px 20px}}${CHROME_CSS}
  </style>
  ${schema}
</head>
<body data-generated="${generatedMarker}">
  ${headerHtml(pathname)}
  <div class="page">
    <main class="d-card">
      <section class="d-top">
        <nav class="breadcrumb" aria-label="위치"><a href="/">홈</a><span>/</span><a href="/agri/">${HUB_NAME}</a><span>/</span><span>${escapeHtml(shortTitle)}</span></nav>
        <div class="d-tags">${tagItems}</div>
        <h1 class="d-title">${escapeHtml(fund.title)}</h1>
        <p class="d-desc">${escapeHtml(fund.detail)}</p>
        <div class="review-meta"><span class="status"${/마감|종료/.test(fund.status) ? ' style="color:#92400e!important;background:#fffbeb!important;border-color:#fde68a!important"' : ""}>${escapeHtml(fund.status)}</span></div>
        ${metaBlockHtml({ published: fund.published, checked: fund.reviewedAt, sourceCount: sources.length })}
      </section>
      <section class="d-summary">
        <div class="d-si"><div class="d-sl">지원 한도</div><div class="d-sv">${escapeHtml(fund.limit)}</div></div>
        <div class="d-si"><div class="d-sl">금리 / 지원</div><div class="d-sv">${escapeHtml(fund.rate)}</div></div>
        <div class="d-si"><div class="d-sl">담당 기관</div><div class="d-sv ink">${escapeHtml(fund.org)}</div></div>
      </section>
      <section class="d-body">
        <h2 class="d-stitle">지원 내용</h2>
        <div class="info-rows">
          <div class="info-row"><span class="info-k">지원 대상</span><span class="info-v">${escapeHtml(fund.targetDesc)}</span></div>
          <div class="info-row"><span class="info-k">지원 금액</span><span class="info-v">${escapeHtml(fund.amountDesc)}</span></div>
          <div class="info-row"><span class="info-k">금리·지원</span><span class="info-v">${escapeHtml(fund.rateDesc)}</span></div>
          <div class="info-row"><span class="info-k">지원 기간</span><span class="info-v">${escapeHtml(fund.periodDesc)}</span></div>
          <div class="info-row"><span class="info-k">필요 서류</span><span class="info-v">${escapeHtml(fund.docs)}</span></div>
        </div>
        <h2 class="d-stitle">대상 확인</h2>
        <div class="split-info">
          <section class="info-panel"><h3>확인할 자격 요건</h3><ul class="plain-list">${listItems(fund.eligibility)}</ul></section>
          <section class="info-panel warn"><h3>제외·제한 가능성</h3><ul class="plain-list">${listItems(fund.exclusions) || "<li>공식 공고의 제외 요건을 확인하세요.</li>"}</ul></section>
        </div>
        <h2 class="d-stitle">준비 서류와 주의사항</h2>
        <div class="split-info">
          <section class="info-panel"><h3>미리 준비할 자료</h3><ul class="plain-list">${listItems(fund.documents)}</ul></section>
          <section class="info-panel warn"><h3>신청 전 주의</h3><ul class="plain-list">${listItems(fund.cautions)}</ul></section>
        </div>
${timelineSection}
        <h2 class="d-stitle">신청 절차</h2>
        <div class="step-list">${stepItems}</div>
        <a class="official-btn" href="${escapeHtml(fund.agency)}" target="_blank" rel="noopener">
          <span><strong>${escapeHtml(fund.agencyName)} 공식 사이트에서 확인하기</strong><span>${escapeHtml(fund.agencyNote)}</span></span>
        </a>${rejectionSection}
        <h2 class="d-stitle">자주 묻는 질문</h2>
        <div>${faqItems}</div>
        <h2 class="d-stitle">이 문서를 확인한 방법</h2>
        <div class="editor-note">${escapeHtml(fund.editorNote)}</div>${machineryChecklist}
        <h2 class="d-stitle">다른 농업 정책자금과 비교하기</h2>
        <div class="info-panel"><h3>나이·경력·목적별로 맞는 자금이 다릅니다</h3>
          <p><a href="/agri/">농업 정책자금 한눈에 보기</a>에서 대상·금리·상환기간·신청처를 한 표로 비교하고, 공고 원문과 기관 답변을 적는 기록표를 쓰세요.</p>
        </div>
        <h2 class="d-stitle" id="sources">출처</h2>
        ${sourceListHtml(sources, fund.reviewedAt)}
        <p class="small-note">쪽수는 각 지침 PDF 기준입니다. 이 문서와 원문이 다르면 원문과 담당 기관의 안내가 우선합니다.</p>
        <h2 class="d-stitle">범위와 한계</h2>
        <div class="scope">
          <p>이 문서는 농림축산식품부 지침과 농업e지 사업 안내에 적힌 대상·한도·금리·절차를 요약합니다. 개인별 자격 판정, 선정 가능성, 실제 대출 가능액과 적용 금리는 다루지 않으며 시군 평가와 농협·농신보 심사로 정해집니다. 시군 자체 추가 지원, 세금·법률 문제는 포함하지 않았습니다. 판단이 필요하면 신청할 시군 농정부서(농업기술센터)와 거래할 농협에 문의하세요.</p>
          <p><b>다음 확인:</b> ${escapeHtml(fund.nextCheck)}</p>
        </div>
        <div class="note">선정과 대출 승인은 담당 기관이 결정합니다. 최종 신청 가능 여부, 접수 기간, 한도와 금리는 반드시 각 기관의 최신 공식 공고로 다시 확인하세요.</div>
      </section>
    </main>
    <aside>
      <div class="side-card tool-side">
        <div class="side-title">이 문서를 만드는 방법</div>
        <p>지침 쪽수와 확인일, 수정 기록을 공개합니다. 초안 작성과 자료 대조에 AI 도구를 쓰며, 게시 내용의 책임은 운영자(제이 미디어)에게 있습니다.</p>
        <a href="/editorial-policy/">편집 원칙 보기 <span>→</span></a>
      </div>
      <div class="side-card">
        <div class="side-title">다른 농업 정책자금</div>
        <div class="related-list">${relatedItems || "<span style=\"font-size:15px;color:var(--ink3)\">관련 문서가 없습니다.</span>"}</div>
        <div class="back-box">
          <a href="/agri/">${HUB_NAME}</a>
          <a href="/guides/used-farm-machinery-loan-limit-2026/">중고 농기계 융자 한도 계산</a>
        </div>
      </div>
    </aside>
  </div>
  ${footerHtml()}
  <script>
    const seen = new Set();
    function prefetch(href) {
      if (!href || seen.has(href)) return;
      seen.add(href);
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    }
    document.querySelectorAll('[data-prefetch]').forEach((link) => {
      link.addEventListener('mouseenter', () => prefetch(link.href), { passive: true });
      link.addEventListener('touchstart', () => prefetch(link.href), { passive: true });
    });
  </script>
</body>
</html>
`;
}

function homeFundCards(funds) {
  return funds.map((fund) => `
        <a class="fund-card" href="${fundPath(fund)}">
          <span class="fc-status${/마감|종료/.test(fund.status) ? " closed" : ""}">${escapeHtml(fund.status)}</span>
          <strong>${escapeHtml(fund.title)}</strong>
          <span class="fc-ex">${escapeHtml(fund.excerpt)}</span>
          <span class="fc-keys">한도 ${escapeHtml(fund.limit)} · ${escapeHtml(fund.rate)}</span>
          <span class="fc-date">확인일 ${escapeHtml(fund.reviewedAt)} · ${escapeHtml(fund.org)}</span>
        </a>`).join("") + "\n      ";
}

function pageTitle(html) {
  const match = html.match(/<title>([^<]+)<\/title>/);
  return match ? match[1].replace(/\s*\|\s*농업 정책자금 백과\s*$/, "").trim() : "";
}

function pageDescription(html) {
  const match = html.match(/<meta name="description" content="([^"]+)">/);
  return match ? match[1].replace(/&quot;/g, "\"").replace(/&amp;/g, "&") : "";
}

function decodeEntities(text) {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
}

function stripTags(text) {
  return decodeEntities(text.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
}

function blockContent(html, name) {
  const start = `<!-- ${name}:start -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(`<!-- ${name}:end -->`);
  return from === -1 || to === -1 ? "" : html.slice(from + start.length, to);
}

function sourceUrlsIn(html) {
  return [...blockContent(html, "sources").matchAll(/href="(https:\/\/[^"]+)"/g)].map((match) => decodeEntities(match[1]));
}

function visibleFaq(html) {
  return [...blockContent(html, "faq").matchAll(/<details[^>]*><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)]
    .map((match) => ({ q: stripTags(match[1]), a: stripTags(match[2]) }));
}

function staticJsonLd(page, html, funds) {
  const canonical = `${siteUrl}${page.path}`;
  const name = pageTitle(html);
  const description = pageDescription(html);
  const nodes = [];
  if (page.type === "Article") {
    nodes.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: name,
      description,
      inLanguage: "ko-KR",
      datePublished: page.published,
      dateModified: page.modified,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      isPartOf: { "@id": WEBSITE_ID },
      mainEntityOfPage: canonical,
      citation: sourceUrlsIn(html)
    });
  } else {
    const webPage = {
      "@type": page.type,
      "@id": `${canonical}#webpage`,
      url: canonical,
      name,
      description,
      inLanguage: "ko-KR",
      datePublished: page.published,
      dateModified: page.modified,
      isPartOf: { "@id": WEBSITE_ID },
      publisher: { "@id": ORG_ID }
    };
    if (page.type === "AboutPage" || page.type === "ContactPage") webPage.about = { "@id": ORG_ID };
    if (page.meta) webPage.author = { "@id": ORG_ID };
    if (page.itemList) {
      webPage.mainEntity = {
        "@type": "ItemList",
        name: "2026 농업 정책자금 해설",
        itemListElement: funds.map((fund, index) => ({ "@type": "ListItem", position: index + 1, name: fund.title, url: `${siteUrl}${fundPath(fund)}` }))
      };
    }
    nodes.push(webPage);
  }
  if (page.faq) {
    const faq = visibleFaq(html);
    if (faq.length < 2) throw new Error(`${page.file}: 화면에 보이는 FAQ 블록을 찾지 못했습니다.`);
    nodes.push({ "@type": "FAQPage", "@id": `${canonical}#faq`, mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) });
  }
  if (page.crumbs) nodes.push(breadcrumbNode(page.crumbs));
  return jsonLdScript(nodes);
}

async function applyStaticPage(page, funds) {
  const filePath = path.join(root, page.file);
  let html = await fs.readFile(filePath, "utf8");
  html = replaceBlock(html, "site-chrome-css", `<style>${CHROME_CSS}\n  </style>`);
  html = replaceBlock(html, "site-header", headerHtml(page.path || ""));
  html = replaceBlock(html, "site-footer", footerHtml());
  if (page.meta) {
    const sourceCount = sourceUrlsIn(html).length;
    if (!sourceCount) throw new Error(`${page.file}: 출처 블록이 비어 있습니다.`);
    html = replaceBlock(html, "page-meta", metaBlockHtml({ published: page.published, checked: page.checked || CHECKED_AT, sourceCount }));
  }
  if (page.file === "index.html") html = replaceBlock(html, "fund-cards", homeFundCards(funds));
  if (!page.noindex) html = replaceBlock(html, "jsonld", staticJsonLd(page, html, funds));
  else if (hasBlock(html, "jsonld")) throw new Error(`${page.file}: 색인 제외 페이지에는 JSON-LD를 두지 않습니다.`);
  await fs.writeFile(filePath, html, "utf8");
}

async function removeOldGeneratedDirs() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    if (!entry.isDirectory()) return;
    if (entry.name.startsWith(".") || entry.name === "android" || entry.name === "scripts") return;
    const htmlPath = path.join(root, entry.name, "index.html");
    try {
      const html = await fs.readFile(htmlPath, "utf8");
      if (html.includes(`data-generated="${generatedMarker}"`)) await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
    } catch {
      // Directory has no readable root index.html.
    }
  }));
}

async function main() {
  const funds = normalizeFunds(await fetchFunds());
  await removeOldGeneratedDirs();

  for (const fund of funds) {
    const dir = path.join(root, fund.slug);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, "index.html"), pageHtml(fund, relatedFor(fund, funds)), "utf8");
  }
  for (const page of STATIC_PAGES) await applyStaticPage(page, funds);

  const urls = [
    ...STATIC_PAGES.filter((page) => !page.noindex).map((page) => `<url><loc>${siteUrl}${page.path}</loc><lastmod>${page.modified}</lastmod><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`),
    ...funds.map((fund) => `<url><loc>${siteUrl}/${escapeXml(encodeURIComponent(fund.slug))}/</loc><lastmod>${fund.reviewedAt}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`)
  ];

  await fs.writeFile(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join("\n  ")}\n</urlset>\n`,
    "utf8"
  );
  console.log(`Generated ${funds.length} fund pages and applied shared chrome to ${STATIC_PAGES.length} static pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
