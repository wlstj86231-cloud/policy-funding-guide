import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const apiUrl = "https://policyfund-api.wlstj86231.workers.dev/api/funds?limit=1000";
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
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (Array.isArray(data.items) && data.items.length) return data.items;
  } catch {
    // Fall back to the data embedded in index.html.
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
    if (char === "\"" || char === "'" || char === "`") stringQuote = char;
    else if (char === "[") depth += 1;
    else if (char === "]") {
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
    updated: clean(raw.updated || "2026.05"),
    slug: slugify(raw.slug || raw.title || raw.id || `policy-fund-${index + 1}`)
  };
}

function normalizeFunds(rawFunds) {
  const seen = new Map();
  return rawFunds.map(normalizeFund).filter((fund) => fund.slug && fund.title).map((fund, index) => {
    const count = seen.get(fund.slug) ?? 0;
    seen.set(fund.slug, count + 1);
    return count === 0 ? fund : { ...fund, slug: slugify(`${fund.slug}-${fund.id ?? index + 1}`) };
  });
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: fund.title,
    description: desc,
    inLanguage: "ko-KR",
    dateModified: fund.updated,
    author: { "@type": "Organization", name: "정책자금 백과" },
    publisher: { "@type": "Organization", name: "정책자금 백과", url: siteUrl },
    mainEntityOfPage: canonical
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
  <style>
    :root{--ink:#0f172a;--ink2:#334155;--ink3:#64748b;--ink4:#94a3b8;--sur:#f8f7f5;--white:#fff;--line:rgba(15,23,42,.08);--line2:rgba(15,23,42,.14);--blue:#1a56db;--blue-bg:#eff5ff;--r:8px;--r2:14px;--f:'A2z','Noto Sans KR',-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-4Regular.woff2') format('woff2');font-weight:400;font-display:swap}
    @font-face{font-family:'A2z';src:url('https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0/에이투지체-7Bold.woff2') format('woff2');font-weight:700;font-display:swap}
    *{box-sizing:border-box}body{margin:0;background:var(--sur);color:var(--ink);font-family:var(--f);line-height:1.72;word-break:keep-all}a{color:inherit}header{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(14px);border-bottom:1px solid var(--line)}
    .h-top{height:60px;max-width:1080px;margin:0 auto;padding:0 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}.logo{text-decoration:none;display:flex;flex-direction:column;line-height:1.05}.logo-main{font-size:20px;font-weight:800;letter-spacing:-.5px}.logo-main span{color:var(--blue)}.logo-sub{font-size:10px;color:var(--ink4);letter-spacing:.3px;text-transform:uppercase}.nav-actions{display:flex;align-items:center;gap:8px}.nav-actions a{font-size:13px;text-decoration:none;color:var(--ink3);background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:8px 12px}
    .page{max-width:1080px;margin:0 auto;padding:24px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:22px}.d-card,.side-card{background:var(--white);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden}.d-top{padding:28px 28px 23px;border-bottom:1px solid var(--line)}.breadcrumb{font-size:12px;color:var(--ink4);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:6px}.breadcrumb a{color:var(--blue);text-decoration:none}.d-tags{display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap}.tag{display:inline-flex;align-items:center;font-size:12px;font-weight:600;padding:3px 8px;border-radius:4px;background:var(--blue-bg);color:#1e429f}.d-title{font-size:clamp(24px,4vw,34px);font-weight:800;line-height:1.32;margin:0 0 10px;letter-spacing:-.5px}.d-desc{font-size:15px;color:var(--ink3);max-width:720px;margin:0}.d-summary{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--line)}.d-si{padding:18px 22px;border-right:1px solid var(--line)}.d-si:last-child{border-right:none}.d-sl{font-size:11px;color:var(--ink4);letter-spacing:.4px;text-transform:uppercase;margin-bottom:6px}.d-sv{font-size:18px;font-weight:800;color:var(--blue);line-height:1.25}.d-sv.ink{color:var(--ink);font-size:15px}.d-body{padding:24px 28px}.d-stitle{font-size:12px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin:24px 0 12px;padding-top:22px;border-top:1px solid var(--line)}.d-stitle:first-child{margin-top:0;padding-top:0;border-top:none}.info-rows{display:flex;flex-direction:column}.info-row{display:flex;border-bottom:1px solid var(--line);padding:11px 0}.info-row:last-child{border-bottom:none}.info-k{width:112px;flex-shrink:0;font-size:13px;color:var(--ink3)}.info-v{flex:1;font-size:13px;color:var(--ink);line-height:1.7}.step-list{display:flex;flex-direction:column;gap:10px}.step-item{display:flex;gap:12px;align-items:flex-start}.step-n{width:22px;height:22px;border-radius:50%;background:var(--blue);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}.step-t{font-size:13px;color:var(--ink2);line-height:1.65}.official-btn{display:flex;align-items:center;gap:12px;background:var(--blue-bg);border:1px solid rgba(26,86,219,.16);border-radius:var(--r);padding:14px 18px;margin-top:20px;text-decoration:none;transition:background .15s;width:100%;text-align:left}.official-btn:hover{background:#dce9fd}.official-btn strong{display:block;font-size:13px;color:#1e429f}.official-btn span{display:block;font-size:12px;color:var(--ink3);margin-top:2px}.note{margin-top:20px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;border-radius:var(--r);padding:13px 15px;font-size:13px}
    .side-card{padding:18px}.side-title{font-size:11px;font-weight:800;color:var(--ink4);letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}.related-list{display:flex;flex-direction:column;gap:7px}.related-item{display:grid;gap:3px;text-decoration:none;background:#f8fafc;border:1px solid var(--line);border-radius:var(--r);padding:10px 12px}.related-item:hover{border-color:var(--blue)}.related-item span{font-size:13px;font-weight:700;color:var(--ink)}.related-item small{font-size:11px;color:var(--ink4)}.back-box{margin-top:14px;display:grid;gap:8px}.back-box a{text-decoration:none;text-align:center;border:1px solid var(--line2);background:#fff;border-radius:var(--r);padding:10px 12px;font-size:13px;color:var(--ink2)}
    @media(max-width:840px){.page{grid-template-columns:1fr;padding:18px 16px 60px}.h-top{padding:0 16px}.nav-actions a{font-size:12px;padding:7px 10px}.d-summary{grid-template-columns:1fr}.d-si{border-right:none;border-bottom:1px solid var(--line)}.info-row{display:grid;grid-template-columns:1fr}.d-top,.d-body{padding-left:20px;padding-right:20px}}
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
        <div class="d-stitle">신청 절차</div>
        <div class="step-list">${stepItems}</div>
        <a class="official-btn" href="${escapeHtml(fund.agency)}" target="_blank" rel="noopener">
          <span><strong>${escapeHtml(fund.agencyName)} 공식 사이트에서 확인하기</strong><span>${escapeHtml(fund.agencyNote)}</span></span>
        </a>
        <div class="note">최종 신청 가능 여부, 접수 기간, 한도와 금리는 반드시 각 기관의 최신 공식 공고를 기준으로 다시 확인하세요.</div>
      </section>
    </main>
    <aside>
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

async function removeOldGeneratedDirs() {
  const entries = await fs.readdir(root, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    if (!entry.isDirectory()) return;
    if (entry.name.startsWith(".") || entry.name === "android" || entry.name === "scripts") return;
    const htmlPath = path.join(root, entry.name, "index.html");
    try {
      await fs.access(htmlPath);
      await fs.rm(path.join(root, entry.name), { recursive: true, force: true });
    } catch {
      // Directory has no root index.html.
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
    ...funds.map((fund) => `<url><loc>${siteUrl}/${escapeXml(encodeURIComponent(fund.slug))}/</loc><lastmod>${sitemapLastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
  ];

  await fs.writeFile(
    path.join(root, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  ${urls.join("\n  ")}\n</urlset>\n`,
    "utf8"
  );
  await fs.rm(path.join(root, "ads.txt"), { force: true });
  console.log(`Generated ${funds.length} real policy fund detail pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
