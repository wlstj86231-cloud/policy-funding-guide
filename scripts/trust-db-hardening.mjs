import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const lastmod = "2026-05-09";

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function readFundsFromIndex(html) {
  const marker = "const _FUNDS_PLACEHOLDER = ";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("FUNDS placeholder not found.");
  const arrayStart = html.indexOf("[", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = arrayStart; i < html.length; i += 1) {
    const ch = html[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") quote = ch;
    else if (ch === "[") depth += 1;
    else if (ch === "]") {
      depth -= 1;
      if (depth === 0) return vm.runInNewContext(html.slice(arrayStart, i + 1));
    }
  }
  throw new Error("FUNDS placeholder was not closed.");
}

function trustSection(fund) {
  const agencyName = fund.agencyName || fund.agency_name || fund.org || "공식 기관";
  const updated = fund.updated || lastmod;
  return `    <section class="card trust-source-card">
      <h2>출처·검수 기준</h2>
      <p>정책자금 백과는 ${escapeHtml(fund.title)}을 단순 소개글이 아니라 신청 전 확인용 DB 문서로 다룹니다. 아래 기준은 사용자가 공식 공고로 이동하기 전에 무엇을 먼저 봐야 하는지 빠르게 정리하기 위한 검수 기록입니다.</p>
      <div class="rows">
        <div class="row"><b>우선 출처</b><span>${escapeHtml(agencyName)} 공식 공고·접수 안내</span></div>
        <div class="row"><b>검수 항목</b><span>지원 대상, 한도, 금리·지원 방식, 필요 서류, 신청 절차, 공식 신청 경로</span></div>
        <div class="row"><b>업데이트 기준</b><span>${escapeHtml(updated)} 기준으로 정리했으며, 실제 접수 가능 여부는 공식 공고가 우선합니다.</span></div>
        <div class="row"><b>주의</b><span>이 문서는 정보 정리용이며 특정 대출·금융상품 가입을 권유하지 않습니다.</span></div>
      </div>
    </section>

`;
}

function trustDatasetJsonLd(funds) {
  const officialHosts = [...new Set(funds
    .map((fund) => {
      try { return new URL(fund.agency).origin; } catch { return ""; }
    })
    .filter(Boolean))]
    .slice(0, 20);
  const data = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${siteUrl}/#policy-trust-db`,
    "name": "정책자금 백과 공식 공고 검수 DB",
    "description": "소상공인, 창업, 중소기업, 고용, 서민금융 정책자금의 지원 대상, 한도, 금리, 서류, 신청 경로를 공식 공고 기준으로 정리한 정책자금 정보 데이터베이스입니다.",
    "url": `${siteUrl}/`,
    "inLanguage": "ko-KR",
    "creator": {
      "@type": "Organization",
      "name": "정책자금 백과",
      "url": `${siteUrl}/`
    },
    "dateModified": lastmod,
    "isAccessibleForFree": true,
    "keywords": ["정책자금", "정부지원금", "소상공인 정책자금", "창업지원금", "중소기업 정책자금", "고용지원금", "서민금융"],
    "isBasedOn": officialHosts.map((url) => ({ "@type": "WebSite", "url": url }))
  };
  return `<script type="application/ld+json" id="policyfundpedia-trust-db">${JSON.stringify(data)}</script>`;
}

async function hardenIndex(funds) {
  const indexPath = path.join(root, "index.html");
  let html = await fs.readFile(indexPath, "utf8");
  html = html.replace(/\n<script type="application\/ld\+json" id="policyfundpedia-trust-db">[\s\S]*?<\/script>/, "");
  html = html.replace("</head>", `${trustDatasetJsonLd(funds)}\n</head>`);
  await fs.writeFile(indexPath, html);
}

async function hardenDetailPages(funds) {
  let changed = 0;
  for (const fund of funds) {
    if (!fund.slug) continue;
    const file = path.join(root, fund.slug, "index.html");
    try {
      let html = await fs.readFile(file, "utf8");
      const block = trustSection(fund);
      if (html.includes("trust-source-card")) {
        html = html.replace(/    <section class="card trust-source-card">[\s\S]*?    <\/section>\n\n/, block);
      } else {
        html = html.replace(/    <section class="card"><h2>같이 확인하면 좋은/, `${block}    <section class="card"><h2>같이 확인하면 좋은`);
      }
      await fs.writeFile(file, html);
      changed += 1;
    } catch {
      // Some manually curated hub pages may not correspond to a fund slug.
    }
  }
  return changed;
}

const indexHtml = await fs.readFile(path.join(root, "index.html"), "utf8");
const funds = readFundsFromIndex(indexHtml);
await hardenIndex(funds);
const changed = await hardenDetailPages(funds);
console.log(`Hardened trust DB signals for ${changed} policy detail pages.`);
