import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const verifiedDataPath = path.join(root, "data", "verified-funds.json");
const searchConsoleVerification = "tSlD6MvlQAUKN3XASMGLU-vJTeaoUxCSFg-tn3JMmvk";
const sitemapLastmod = process.env.SITEMAP_LASTMOD || new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());
const generatedMarker = "policyfundpedia-static-detail";

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
  const target = parseArray(raw.target).map((item) => clean(item)).filter(Boolean);
  const limit = clean(raw.lim || raw.limit || raw.amount_desc);
  const rate = clean(raw.rate || raw.rate_desc);
  return {
    id: raw.id ?? index + 1,
    cat: clean(raw.cat, "정책자금"),
    title: clean(raw.title, "정책자금 안내"),
    excerpt: clean(raw.excerpt || raw.detail, "정책자금 핵심 정보를 정리했습니다."),
    detail: clean(raw.detail || raw.excerpt, "공식 공고 기준으로 신청 대상과 절차를 확인해야 합니다."),
    limit,
    rate,
    org: clean(raw.org || raw.agency_name || raw.agencyName || "공식 기관"),
    deadline: clean(raw.deadline || "상시"),
    targetDesc: clean(raw.target_desc || target.join(", "), "공식 공고의 대상 요건 확인"),
    amountDesc: clean(raw.amount_desc || raw.lim || raw.limit),
    rateDesc: clean(raw.rate_desc || raw.rate),
    periodDesc: clean(raw.period_desc || "공식 공고 확인"),
    docs: clean(raw.docs || "사업자등록증, 신분증, 매출 증빙, 공식 공고별 추가 서류"),
    agency: /^https?:\/\//.test(String(raw.agency || "")) ? raw.agency : siteUrl,
    agencyName: clean(raw.agency_name || raw.agencyName || raw.org || "공식 기관"),
    agencyNote: clean(raw.agency_note || raw.agencyNote || "신청 전 공식 사이트에서 최신 공고와 세부 요건을 확인하세요."),
    tags: tags.length ? tags : [clean(raw.cat || "정책자금")],
    steps: steps.length ? steps : ["공식 공고 확인", "지원 대상 검토", "필요 서류 준비", "온라인 또는 방문 신청"],
    target,
    updated: clean(raw.updated || raw.reviewedAt || "", ""),
    reviewedAt: clean(raw.reviewedAt || raw.updated || "", ""),
    status: clean(raw.status || "신청 조건 확인 필요"),
    sourceTitle: clean(raw.sourceTitle || "", ""),
    sourceAuthority: clean(raw.sourceAuthority || raw.agency_name || raw.org || "", ""),
    sourceDate: clean(raw.sourceDate || "", ""),
    sourceUrl: /^https:\/\//.test(String(raw.sourceUrl || raw.agency || "")) ? String(raw.sourceUrl || raw.agency) : "",
    eligibility: parseArray(raw.eligibility).map((item) => clean(item)).filter(Boolean),
    exclusions: parseArray(raw.exclusions).map((item) => clean(item)).filter(Boolean),
    documents: parseArray(raw.documents).map((item) => clean(item)).filter(Boolean),
    cautions: parseArray(raw.cautions).map((item) => clean(item)).filter(Boolean),
    faq: Array.isArray(raw.faq) ? raw.faq.map((item) => ({ q: clean(item?.q, ""), a: clean(item?.a, "") })).filter((item) => item.q && item.a) : [],
    editorNote: clean(raw.editorNote || "", ""),
    slug: slugify(raw.slug || raw.title || raw.id || `policy-fund-${index + 1}`)
  };
}

function assertPublishable(fund) {
  const errors = [];
  if (!fund.sourceUrl || fund.sourceUrl === siteUrl) errors.push("직접 공식 출처 URL");
  try {
    const source = new URL(fund.sourceUrl);
    if (source.pathname === "/" && !source.search) errors.push("기관 홈이 아닌 상세 출처 URL");
  } catch {
    errors.push("유효한 HTTPS 출처 URL");
  }
  if (!fund.sourceTitle) errors.push("공식 공고·상품명");
  if (!fund.sourceAuthority) errors.push("발표 기관");
  if (!/^2026-\d{2}-\d{2}$/.test(fund.reviewedAt)) errors.push("실제 검수일");
  if (fund.eligibility.length < 2) errors.push("세부 대상 요건");
  if (fund.documents.length < 2) errors.push("준비 서류");
  if (fund.cautions.length < 2) errors.push("주의사항");
  if (fund.faq.length < 2) errors.push("FAQ");
  if (fund.editorNote.length < 75) errors.push("독자 관점 편집자 해설");
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

function relatedFor(fund, funds) {
  return funds.filter((item) => item.slug !== fund.slug && item.cat === fund.cat).slice(0, 5);
}

function pageHtml(fund, related) {
  const canonical = `${siteUrl}/${encodeURIComponent(fund.slug)}/`;
  const title = `${fund.title} | 정책자금 백과`;
  const desc = `${fund.title}의 지원 대상, 한도, 금리, 신청 절차와 필요 서류를 공식 공고 확인 흐름에 맞춰 정리했습니다.`;
  const categoryHref = `/?cat=${encodeURIComponent(fund.cat)}`;
  const tagItems = fund.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  const stepItems = fund.steps.map((step, idx) => `<div class="step-item"><span class="step-n">${idx + 1}</span><span class="step-t">${escapeHtml(step)}</span></div>`).join("");
  const relatedItems = related.map((item) => `<a class="related-item" href="/${encodeURIComponent(item.slug)}/" data-prefetch><span>${escapeHtml(item.title)}</span><small>${escapeHtml(item.org)}</small></a>`).join("");
  const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const eligibilityItems = listItems(fund.eligibility);
  const exclusionItems = listItems(fund.exclusions);
  const documentItems = listItems(fund.documents);
  const cautionItems = listItems(fund.cautions);
  const faqItems = fund.faq.map((item) => `<details class="faq-item"><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: fund.title,
        description: desc,
        inLanguage: "ko-KR",
        dateModified: fund.reviewedAt,
        author: { "@type": "Organization", name: "정책자금 백과 편집부", url: `${siteUrl}/editorial-policy/` },
        publisher: { "@type": "Organization", name: "정책자금 백과", url: siteUrl },
        citation: fund.sourceUrl,
        mainEntityOfPage: canonical
      },
      {
        "@type": "FAQPage",
        mainEntity: fund.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "홈", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: fund.cat, item: `${siteUrl}/?cat=${encodeURIComponent(fund.cat)}` },
          { "@type": "ListItem", position: 3, name: fund.title, item: canonical }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(desc)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="google-site-verification" content="${searchConsoleVerification}">
  <meta name="author" content="정책자금 백과">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="google-adsense-account" content="ca-pub-7217591196020054">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7217591196020054" crossorigin="anonymous"></script>
  <style>
    :root{--ink:#0f172a;--ink2:#334155;--ink3:#64748b;--ink4:#94a3b8;--sur:#f8f7f5;--white:#fff;--line:rgba(15,23,42,.08);--line2:rgba(15,23,42,.14);--blue:#1a56db;--blue-bg:#eff5ff;--r:8px;--r2:14px;--f:'A2z','Noto Sans KR',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:var(--sur);color:var(--ink);font-family:var(--f);line-height:1.72;word-break:keep-all}a{color:inherit}header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
    .h-top{height:60px;max-width:1080px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}.logo{text-decoration:none;display:flex;flex-direction:column;line-height:1.05}.logo-main{font-size:20px;font-weight:800;letter-spacing:-.5px}.logo-main span{color:var(--blue)}.logo-sub{font-size:10px;color:var(--ink4);letter-spacing:.3px;text-transform:uppercase}.nav-actions{display:flex;align-items:center;gap:8px}.nav-actions a{font-size:13px;text-decoration:none;color:var(--ink3);background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:8px 12px}.nav-actions a.goatool-link{color:#fff;background:#0f172a;border-color:rgba(20,184,166,.28);font-weight:800}
    .page{max-width:1080px;margin:0 auto;padding:24px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:22px}.d-card,.side-card{background:var(--white);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden}.d-top{padding:28px 28px 23px;border-bottom:1px solid var(--line)}.breadcrumb{font-size:12px;color:var(--ink4);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:6px}.breadcrumb a{color:var(--blue);text-decoration:none}.d-tags{display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap}.tag{display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px;background:var(--blue-bg);color:#1e429f}.d-title{font-size:clamp(24px,4vw,34px);font-weight:800;line-height:1.32;margin:0 0 10px;letter-spacing:-.5px}.d-desc{font-size:15px;color:var(--ink3);max-width:720px;margin:0}.d-summary{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)}.d-si{padding:18px 22px;border-right:1px solid var(--line)}.d-si:last-child{border-right:none}.d-sl{font-size:11px;color:var(--ink4);letter-spacing:.4px;text-transform:uppercase;margin-bottom:6px}.d-sv{font-size:18px;font-weight:800;color:var(--blue);line-height:1.25}.d-sv.ink{color:var(--ink);font-size:15px}.d-body{padding:24px 28px}.d-stitle{font-size:12px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin:24px 0 12px;padding-top:22px;border-top:1px solid var(--line)}.d-stitle:first-child{margin-top:0;padding-top:0;border-top:none}.info-rows{display:flex;flex-direction:column}.info-row{display:flex;border-bottom:1px solid var(--line);padding:11px 0}.info-row:last-child{border-bottom:none}.info-k{width:112px;flex-shrink:0;font-size:13px;color:var(--ink3)}.info-v{flex:1;font-size:13px;color:var(--ink);line-height:1.7}.step-list{display:flex;flex-direction:column;gap:10px}.step-item{display:flex;gap:12px;align-items:flex-start}.step-n{width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.step-t{font-size:13px;color:var(--ink2);line-height:1.65}.official-btn{display:flex;align-items:center;gap:12px;background:var(--blue-bg);border:1px solid rgba(26,86,219,.16);border-radius:var(--r);padding:14px 18px;margin-top:20px;text-decoration:none;transition:background .15s;width:100%;text-align:left}.official-btn:hover{background:#dce9fd}.official-btn strong{display:block;font-size:13px;color:#1e429f}.official-btn span{display:block;font-size:12px;color:var(--ink3);margin-top:2px}.note{margin-top:20px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:var(--r);padding:13px 15px;font-size:13px}
    .review-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:14px}.review-meta span{font-size:11px;color:var(--ink3);background:#f8fafc;border:1px solid var(--line);border-radius:999px;padding:5px 9px}.status{color:#166534!important;background:#f0fdf4!important;border-color:#bbf7d0!important}.plain-list{margin:0;padding-left:20px}.plain-list li{font-size:13px;color:var(--ink2);margin:7px 0}.split-info{display:grid;grid-template-columns:1fr 1fr;gap:12px}.info-panel{border:1px solid var(--line);border-radius:var(--r);padding:15px;background:#f8fafc}.info-panel h3{font-size:14px;margin:0 0 8px}.info-panel.warn{background:#fff7ed;border-color:#fed7aa}.source-box{margin-top:18px;border:1px solid rgba(26,86,219,.18);background:var(--blue-bg);border-radius:var(--r);padding:15px}.source-box b{display:block;font-size:13px;color:#1e429f}.source-box p{font-size:12px;color:var(--ink3);margin:5px 0 10px}.source-box a{font-size:13px;font-weight:800;color:var(--blue)}.faq-item{border-bottom:1px solid var(--line);padding:11px 0}.faq-item summary{font-size:13px;font-weight:700;cursor:pointer}.faq-item p{font-size:13px;color:var(--ink3);margin:8px 0 0}.editor-note{font-size:13px;color:var(--ink2);background:#f8fafc;border-left:3px solid var(--blue);padding:13px 15px}.site-footer{max-width:1080px;margin:0 auto 42px;padding:0 24px}.footer-in{border-top:1px solid var(--line);padding-top:20px}.footer-links{display:flex;flex-wrap:wrap;gap:12px}.footer-links a{font-size:12px;color:var(--ink3);text-decoration:none}.footer-note{font-size:11px;color:var(--ink4);margin-top:10px}.side-card{padding:18px}.side-title{font-size:11px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}.boribay-side{margin-bottom:14px;background:#f3f8ed;border-color:#d5e3c8}.boribay-side .side-title{color:#50783a}.boribay-side strong{display:block;font-size:15px;line-height:1.45;color:#173f25}.boribay-side p{font-size:12px;line-height:1.65;color:#52645a;margin:8px 0 13px}.boribay-side a{display:flex;align-items:center;justify-content:space-between;gap:8px;border-radius:var(--r);padding:10px 12px;font-size:13px;font-weight:800;text-decoration:none}.boribay-side .boribay-primary{background:#3d6842;color:#fff}.boribay-side .boribay-secondary,.boribay-side .agriculture-hub-link{margin-top:8px;background:#fff;color:#31543a;border:1px solid #d5e3c8}.tool-side{margin-bottom:14px;padding:18px;background:linear-gradient(150deg,#0f172a,#163f55);border-color:rgba(20,184,166,.24);color:#fff}.tool-side .side-title{color:#9ee9dd}.tool-side p{font-size:12px;line-height:1.65;color:rgba(248,250,252,.75);margin:0 0 13px}.tool-side a{display:flex;align-items:center;justify-content:space-between;gap:8px;background:#b9f2e8;color:#0f172a;border-radius:var(--r);padding:10px 12px;font-size:13px;font-weight:800;text-decoration:none}.related-list{display:flex;flex-direction:column;gap:7px}.related-item{display:grid;gap:3px;text-decoration:none;background:#f8fafc;border:1px solid var(--line);border-radius:var(--r);padding:10px 12px}.related-item:hover{border-color:var(--blue)}.related-item span{font-size:13px;font-weight:700;color:var(--ink)}.related-item small{font-size:11px;color:var(--ink4)}.back-box{margin-top:14px;display:grid;gap:8px}.back-box a{text-decoration:none;text-align:center;border:1px solid var(--line2);background:#fff;border-radius:var(--r);padding:10px 12px;font-size:13px;color:var(--ink2)}
    @media(max-width:840px){.page{grid-template-columns:1fr;padding:18px 16px 60px}.h-top{padding:0 16px}.nav-actions a{font-size:12px;padding:7px 10px}.d-summary,.split-info{grid-template-columns:1fr}.d-si{border-right:none;border-bottom:1px solid var(--line)}.info-row{display:grid;grid-template-columns:1fr}.d-top,.d-body{padding-left:20px;padding-right:20px}}
  </style>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-generated="${generatedMarker}">
  <header>
    <div class="h-top">
      <a class="logo" href="/">
        <span class="logo-main">정책자금 <span>백과</span></span>
        <span class="logo-sub">Government Fund Guide</span>
      </a>
      <div class="nav-actions">
        <a class="goatool-link" href="/editorial-policy/">검증 원칙</a>
        <a href="${categoryHref}">${escapeHtml(fund.cat)} 모아보기</a>
        <a href="/">전체 보기</a>
      </div>
    </div>
  </header>
  <div class="page">
    <main class="d-card">
      <section class="d-top">
        <div class="breadcrumb"><a href="/">홈</a><span>/</span><a href="${categoryHref}">${escapeHtml(fund.cat)}</a><span>/</span><span>${escapeHtml(fund.title.split("—")[0].trim())}</span></div>
        <div class="d-tags">${tagItems}</div>
        <h1 class="d-title">${escapeHtml(fund.title)}</h1>
        <p class="d-desc">${escapeHtml(fund.detail)}</p>
        <div class="review-meta"><span class="status">${escapeHtml(fund.status)}</span><span>검수일 ${escapeHtml(fund.reviewedAt)}</span><span>출처 ${escapeHtml(fund.sourceAuthority)}</span></div>
      </section>
      <section class="d-summary">
        <div class="d-si"><div class="d-sl">지원 한도</div><div class="d-sv">${escapeHtml(fund.limit)}</div></div>
        <div class="d-si"><div class="d-sl">금리 / 지원</div><div class="d-sv">${escapeHtml(fund.rate)}</div></div>
        <div class="d-si"><div class="d-sl">담당 기관</div><div class="d-sv ink">${escapeHtml(fund.org)}</div></div>
      </section>
      <section class="d-body">
        <div class="d-stitle">지원 내용</div>
        <div class="info-rows">
          <div class="info-row"><span class="info-k">지원 대상</span><span class="info-v">${escapeHtml(fund.targetDesc)}</span></div>
          <div class="info-row"><span class="info-k">지원 금액</span><span class="info-v">${escapeHtml(fund.amountDesc)}</span></div>
          <div class="info-row"><span class="info-k">금리·지원</span><span class="info-v">${escapeHtml(fund.rateDesc)}</span></div>
          <div class="info-row"><span class="info-k">지원 기간</span><span class="info-v">${escapeHtml(fund.periodDesc)}</span></div>
          <div class="info-row"><span class="info-k">필요 서류</span><span class="info-v">${escapeHtml(fund.docs)}</span></div>
        </div>
        <div class="d-stitle">대상 확인</div>
        <div class="split-info">
          <section class="info-panel"><h3>확인할 자격 요건</h3><ul class="plain-list">${eligibilityItems}</ul></section>
          <section class="info-panel warn"><h3>제외·제한 가능성</h3><ul class="plain-list">${exclusionItems || "<li>공식 공고의 제외 요건을 확인하세요.</li>"}</ul></section>
        </div>
        <div class="d-stitle">준비 서류와 주의사항</div>
        <div class="split-info">
          <section class="info-panel"><h3>미리 준비할 자료</h3><ul class="plain-list">${documentItems}</ul></section>
          <section class="info-panel warn"><h3>신청 전 주의</h3><ul class="plain-list">${cautionItems}</ul></section>
        </div>
        <div class="d-stitle">신청 절차</div>
        <div class="step-list">${stepItems}</div>
        <a class="official-btn" href="${escapeHtml(fund.agency)}" target="_blank" rel="noopener">
          <span><strong>${escapeHtml(fund.agencyName)} 공식 사이트에서 확인하기</strong><span>${escapeHtml(fund.agencyNote)}</span></span>
        </a>
        <div class="source-box"><b>검증에 사용한 1차 출처</b><p>${escapeHtml(fund.sourceAuthority)} · ${escapeHtml(fund.sourceTitle)}${fund.sourceDate ? ` · ${escapeHtml(fund.sourceDate)}` : ""}</p><a href="${escapeHtml(fund.sourceUrl)}" target="_blank" rel="noopener">원문 직접 확인하기 ↗</a></div>
        <div class="d-stitle">자주 묻는 질문</div>
        <div>${faqItems}</div>
        <div class="d-stitle">편집자 해설</div>
        <div class="editor-note">${escapeHtml(fund.editorNote)}</div>
        <div class="note">최종 신청 가능 여부, 접수 기간, 한도와 금리는 반드시 각 기관의 최신 공식 공고를 기준으로 다시 확인하세요.</div>
      </section>
    </main>
    <aside>
      <div class="side-card tool-side">
        <div class="side-title">검증 원칙</div>
        <p>직접 공식 출처, 검수일, 변경 이력을 공개하고 종료된 사업은 활성 사업처럼 안내하지 않습니다.</p>
        <a href="/editorial-policy/">편집 원칙 보기 <span>→</span></a>
      </div>
      <div class="side-card">
        <div class="side-title">같은 카테고리 다른 정보</div>
        <div class="related-list">${relatedItems || "<span style=\"font-size:13px;color:var(--ink4)\">관련 문서가 없습니다.</span>"}</div>
        <div class="back-box">
          <a href="${categoryHref}">${escapeHtml(fund.cat)}만 모아보기</a>
          <a href="/">전체 자금 목록</a>
        </div>
      </div>
    </aside>
  </div>
  <footer class="site-footer"><div class="footer-in"><div class="footer-links"><a href="/about/">사이트 소개</a><a href="/editorial-policy/">편집 원칙</a><a href="/corrections/">정정 정책</a><a href="/privacy/">개인정보 처리 안내</a><a href="/terms/">이용 안내</a><a href="/contact/">문의</a></div><div class="footer-note">정책자금 백과는 정부 기관이 아닌 독립 정보 사이트이며 신청 대행, 금융상품 중개 또는 승인을 보장하지 않습니다.</div></div></footer>
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

function agricultureHubHtml(funds) {
  const agricultureFunds = funds.filter(isAgricultureFund);
  const canonical = `${siteUrl}${agricultureHubPath}`;
  const title = "농업인 정책자금 찾기부터 농산물 판매·농기계 거래 준비까지";
  const description = "농업인 정책자금, 농식품 창업 지원, 농기계 지원사업을 찾은 뒤 농산물 직거래 가격·포장과 중고 농기계 거래를 준비하는 순서를 한 번에 정리했습니다.";
  const fundCards = agricultureFunds.map((fund) => `
        <a class="fund-card" href="/${encodeURIComponent(fund.slug)}/">
          <span class="fund-cat">${escapeHtml(fund.cat)}</span>
          <strong>${escapeHtml(fund.title)}</strong>
          <p>${escapeHtml(fund.excerpt)}</p>
          <small>${escapeHtml(fund.org)} · 상세 조건 확인 →</small>
        </a>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "ko-KR",
        dateModified: sitemapLastmod,
        publisher: { "@type": "Organization", name: "정책자금 백과", url: siteUrl },
        mainEntity: {
          "@type": "ItemList",
          name: "농업·농식품·농기계 관련 정책자금",
          itemListElement: agricultureFunds.map((fund, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: fund.title,
            url: `${siteUrl}/${encodeURIComponent(fund.slug)}/`
          }))
        }
      }
    ]
  };

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | 정책자금 백과</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <meta name="google-site-verification" content="${searchConsoleVerification}">
  <meta name="author" content="정책자금 백과">
  <meta name="keywords" content="농업인 정책자금, 농업인 대출, 농식품 창업 지원, 농기계 지원사업, 농산물 직거래, 중고 농기계">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="google-adsense-account" content="ca-pub-7217591196020054">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7217591196020054" crossorigin="anonymous"></script>
  <style>
    :root{--ink:#0f172a;--ink2:#334155;--ink3:#64748b;--line:#e2e8f0;--soft:#f8fafc;--green:#3d6842;--green2:#edf5e8;--blue:#1a56db;--f:'A2z','Noto Sans KR',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:#f8f7f5;color:var(--ink);font-family:var(--f);line-height:1.75;word-break:keep-all}a{color:inherit}header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);border-bottom:1px solid var(--line);backdrop-filter:blur(12px)}.nav{max-width:1040px;height:60px;margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:14px}.logo{text-decoration:none;font-size:18px;font-weight:800}.logo span{color:var(--blue)}.home{font-size:13px;color:var(--ink3);text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:8px 11px;background:#fff}
    main{max-width:1040px;margin:0 auto;padding:30px 20px 72px}.hero,.section{background:#fff;border:1px solid var(--line);border-radius:15px}.hero{padding:32px;margin-bottom:18px;background:linear-gradient(145deg,#fff,#f3f8ed)}.crumb{font-size:12px;color:var(--ink3);margin-bottom:12px}.crumb a{color:var(--blue);text-decoration:none}h1{font-size:clamp(27px,5vw,42px);line-height:1.28;letter-spacing:-.04em;margin:0 0 14px}.lead{font-size:17px;color:var(--ink2);max-width:780px;margin:0}.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}.tag{font-size:12px;font-weight:700;color:#31543a;background:#fff;border:1px solid #d5e3c8;border-radius:999px;padding:5px 10px}
    .section{padding:28px;margin-bottom:16px}h2{font-size:22px;line-height:1.4;margin:0 0 12px}p{color:var(--ink2);margin:0 0 14px}.route{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.route-item{border:1px solid var(--line);border-radius:12px;padding:16px;background:var(--soft)}.route-item b{display:block;font-size:15px;margin-bottom:6px}.route-item span{font-size:13px;color:var(--ink3)}
    .fund-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:16px}.fund-card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;padding:17px;text-decoration:none;background:#fff}.fund-card:hover{border-color:var(--blue)}.fund-cat{font-size:11px;font-weight:700;color:var(--blue);margin-bottom:7px}.fund-card strong{font-size:16px;line-height:1.5}.fund-card p{font-size:13px;color:var(--ink3);margin:7px 0}.fund-card small{font-size:12px;color:var(--ink3);margin-top:auto}.next-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.next-card{border:1px solid #d5e3c8;border-radius:13px;padding:20px;background:var(--green2)}.next-card h3{font-size:18px;margin:0 0 8px}.next-card p{font-size:14px}.next-card a{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--green);color:#fff;border-radius:9px;padding:11px 13px;text-decoration:none;font-size:14px;font-weight:800}.next-card a+a{margin-top:8px;background:#fff;color:var(--green);border:1px solid #d5e3c8}.check{display:grid;gap:8px;margin-top:14px}.check div{display:grid;grid-template-columns:120px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}.check b{color:var(--ink3)}.notice{border-left:4px solid var(--blue);background:#eff6ff;border-radius:0 10px 10px 0;padding:14px 16px;font-size:13px;color:var(--ink2);margin-top:16px}
    @media(max-width:720px){main{padding:18px 14px 54px}.hero,.section{padding:21px}.route,.fund-grid,.next-grid{grid-template-columns:1fr}.check div{grid-template-columns:1fr;gap:3px}.nav{padding:0 14px}}
  </style>
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body data-generated="policyfundpedia-agriculture-hub">
  <header><nav class="nav"><a class="logo" href="/">정책자금 <span>백과</span></a><a class="home" href="/">전체 자금 보기</a></nav></header>
  <main>
    <section class="hero">
      <div class="crumb"><a href="/">홈</a> / 농업인 정책자금·거래 준비</div>
      <h1>농업인 정책자금부터<br>판매·농기계 준비까지</h1>
      <p class="lead">지원사업을 찾는 단계와 실제 지출·판매를 준비하는 단계는 다릅니다. 내 상황에 맞는 정책자금 문서를 먼저 고른 뒤, 농산물 직거래 또는 중고 농기계 거래 점검으로 이어가세요.</p>
      <div class="tags"><span class="tag">농업인 정책자금</span><span class="tag">농업인 대출</span><span class="tag">농식품 창업 지원</span><span class="tag">농기계 지원사업</span></div>
    </section>
    <section class="section">
      <h2>먼저 목적을 세 갈래로 나눕니다</h2>
      <p>검색어보다 실제로 돈을 쓸 목적을 먼저 정하면 맞지 않는 공고를 훨씬 빨리 제외할 수 있습니다.</p>
      <div class="route">
        <div class="route-item"><b>영농 운영비가 필요함</b><span>농업인 경영 안정 자금과 농업인 대출 문서를 먼저 확인합니다.</span></div>
        <div class="route-item"><b>가공·포장·판매를 시작함</b><span>농식품 창업 지원과 사업화 지원 문서를 확인합니다.</span></div>
        <div class="route-item"><b>농기계 도입·사업화가 목적</b><span>농기계 관련 지원사업의 대상 지역·기업 요건부터 확인합니다.</span></div>
      </div>
    </section>
    <section class="section">
      <h2>현재 연결된 농업 관련 정책자금 문서</h2>
      <p>금액이나 마감일은 바뀔 수 있으므로 아래 문서에서 지원 대상과 공식 신청처를 확인한 뒤, 최종 조건은 해당 기관의 최신 공고로 다시 확인하세요.</p>
      <div class="fund-grid">${fundCards || "<p>현재 연결 가능한 농업 관련 문서를 정리 중입니다.</p>"}</div>
    </section>
    <section class="section">
      <h2>자금 검토 다음에는 실제 거래 준비로 넘어갑니다</h2>
      <div class="next-grid">
        <article class="next-card">
          <h3>농산물을 판매하려는 경우</h3>
          <p>시세만 따라 적지 말고 선별 기준, 포장 단위, 택배비, 수수료를 포함한 실제 판매가를 정합니다.</p>
          <a href="https://boribay.com/guides/produce-direct-sale-pricing-packaging?utm_source=policyfundpedia&amp;utm_medium=owned_referral&amp;utm_campaign=policyfund_agri_startup_bridge" target="_blank" rel="noopener"><span>농산물 직거래 가격·포장 준비</span><span>↗</span></a>
        </article>
        <article class="next-card">
          <h3>도매시장 경매로 출하하는 경우</h3>
          <p>경락 단가에서 실제 수수료, 운송비, 선별·포장비를 빼 예상 수취금액을 먼저 비교합니다.</p>
          <a href="https://boribay.com/guides/agricultural-auction-net-calculator?utm_source=policyfundpedia&amp;utm_medium=owned_referral&amp;utm_campaign=policyfund_agri_startup_bridge" target="_blank" rel="noopener"><span>경매 예상 수취금액 계산</span><span>↗</span></a>
        </article>
        <article class="next-card">
          <h3>농기계를 사거나 팔려는 경우</h3>
          <p>기종과 가격보다 먼저 소유 관계, 작동 상태, 정비 기록, 운송 조건을 확인해 거래 실패를 줄입니다.</p>
          <a href="https://boribay.com/guides/used-machinery-selling-checklist?utm_source=policyfundpedia&amp;utm_medium=owned_referral&amp;utm_campaign=policyfund_machinery_bridge" target="_blank" rel="noopener"><span>중고 농기계 거래 점검표</span><span>↗</span></a>
          <a href="https://boribay.com/guides/farm-machinery-transport-checklist?utm_source=policyfundpedia&amp;utm_medium=owned_referral&amp;utm_campaign=policyfund_machinery_bridge" target="_blank" rel="noopener"><span>농기계 운송 준비</span><span>↗</span></a>
        </article>
      </div>
    </section>
    <section class="section">
      <h2>이 순서만 지키면 됩니다</h2>
      <div class="check">
        <div><b>1. 대상 확인</b><span>농업경영체, 사업자, 예비창업자, 지역·업력 조건 중 어디에 해당하는지 확인합니다.</span></div>
        <div><b>2. 공식 공고</b><span>접수 기간, 제외 업종, 자부담, 중복 지원 제한을 공식 기관에서 확인합니다.</span></div>
        <div><b>3. 지출 계획</b><span>지원금을 받는다는 가정이 아니라 실제 필요한 장비·포장·운송 비용을 먼저 계산합니다.</span></div>
        <div><b>4. 거래 준비</b><span>판매 가격과 포장 조건 또는 농기계 상태와 운송 조건을 기록한 뒤 거래를 시작합니다.</span></div>
      </div>
      <div class="notice">정책자금 백과는 지원사업을 찾는 안내 페이지이며 대출 승인이나 지원금 선정을 보장하지 않습니다. 보리장터 연결 페이지는 매물을 요구하지 않고 거래 전에 필요한 준비 기준을 제공합니다.</div>
    </section>
  </main>
</body>
</html>`;
}

async function removeOldGeneratedDirs() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    if (!entry.isDirectory()) return;
    if (entry.name.startsWith(".") || entry.name === "android" || entry.name === "scripts") return;
    const htmlPath = path.join(root, entry.name, "index.html");
    try {
      const html = await fs.readFile(htmlPath, "utf8");
      const isGenerated = html.includes(`data-generated="${generatedMarker}"`)
        || html.includes('data-generated="policyfundpedia-agriculture-hub"');
      if (isGenerated) await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
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

  const urls = [
    `<url><loc>${siteUrl}/</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...["about", "editorial-policy", "privacy", "terms", "corrections", "contact"].map((slug) => `<url><loc>${siteUrl}/${slug}/</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>`),
    ...funds.map((fund) => `<url><loc>${siteUrl}/${escapeXml(encodeURIComponent(fund.slug))}/</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  ];

  await fs.writeFile(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join("\n  ")}\n</urlset>\n`,
    "utf8"
  );
  console.log(`Generated ${funds.length} verified policy fund detail pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
