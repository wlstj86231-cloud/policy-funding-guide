import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const trustSlugs = ["about", "editorial-policy", "privacy", "terms", "corrections", "contact"];
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (relative) => fs.readFile(path.join(root, relative), "utf8");

const dataDocument = JSON.parse(await read("data/verified-funds.json"));
const funds = Array.isArray(dataDocument) ? dataDocument : dataDocument.items;
assert(Array.isArray(funds), "검증 데이터는 배열이어야 합니다.");
assert(funds.length >= 10 && funds.length <= 30, `공개 검증 문서는 10~30개여야 합니다(현재 ${funds.length}개).`);

const slugs = new Set();
const ids = new Set();
const sourceUrls = new Set();
const requiredFields = [
  "id", "slug", "cat", "title", "excerpt", "detail", "limit", "rate", "org", "deadline",
  "target_desc", "amount_desc", "rate_desc", "period_desc", "docs", "agency", "agency_name",
  "agency_note", "updated", "reviewedAt", "status", "sourceTitle", "sourceAuthority", "sourceDate",
  "sourceUrl", "editorNote"
];

for (const fund of funds) {
  for (const field of requiredFields) assert(String(fund[field] ?? "").trim(), `${fund.title || fund.id}: ${field} 누락`);
  assert(!slugs.has(fund.slug), `중복 slug: ${fund.slug}`);
  assert(!ids.has(fund.id), `중복 id: ${fund.id}`);
  assert(!sourceUrls.has(fund.sourceUrl), `중복 공식 출처: ${fund.sourceUrl}`);
  slugs.add(fund.slug);
  ids.add(fund.id);
  sourceUrls.add(fund.sourceUrl);
  try {
    const source = new URL(fund.sourceUrl);
    assert(source.protocol === "https:", `${fund.title}: 공식 출처는 HTTPS여야 합니다.`);
    assert(source.pathname !== "/" || source.search, `${fund.title}: 기관 홈페이지가 아닌 직접 상세 출처가 필요합니다.`);
  } catch {
    assert(false, `${fund.title}: 공식 출처 URL이 유효하지 않습니다.`);
  }
  assert(fund.agency === fund.sourceUrl, `${fund.title}: 공식 버튼과 검증 출처 URL이 달라서는 안 됩니다.`);
  assert(/^2026-\d{2}-\d{2}$/.test(fund.reviewedAt), `${fund.title}: 검수일 형식 오류`);
  assert(fund.reviewedAt === fund.updated, `${fund.title}: updated와 reviewedAt 불일치`);
  for (const [field, minimum] of [["eligibility", 2], ["exclusions", 2], ["documents", 2], ["cautions", 2], ["faq", 2], ["steps", 3]]) {
    assert(Array.isArray(fund[field]) && fund[field].length >= minimum, `${fund.title}: ${field} 최소 ${minimum}개 필요`);
  }
  const evidence = [
    fund.detail, fund.target_desc, fund.amount_desc, fund.rate_desc, fund.period_desc,
    ...(fund.eligibility || []), ...(fund.exclusions || []), ...(fund.documents || []), ...(fund.cautions || []),
    ...(fund.faq || []).flatMap((item) => [item.q, item.a]), fund.editorNote
  ].join(" ");
  assert(evidence.length >= 650, `${fund.title}: 고유 설명이 650자 미만입니다.`);
}

const indexHtml = await read("index.html");
assert(indexHtml.includes("/data/verified-funds.json"), "홈이 로컬 검증 데이터를 사용하지 않습니다.");
for (const forbidden of ["policyfund-api.wlstj86231.workers.dev", "bizinfo-proxy.wlstj86231.workers.dev", "emailjs", "EMAILJS_", "pf_consult_sent", "민간 컨설턴트", "정책자금 신청 상담 받기", "D-NaN"]) {
  assert(!indexHtml.includes(forbidden), `홈에 금지된 레거시 문자열이 남았습니다: ${forbidden}`);
}
assert(indexHtml.includes("const PROXY_URL = '/api/bizinfo';"), "최신 공고가 동일 출처 API를 사용하지 않습니다.");
assert(!indexHtml.includes("LIVE_CATES"), "동작하지 않는 최신 공고 카테고리 필터가 남았습니다.");
assert(indexHtml.includes("escapeSoftHtml(err.message)"), "최신 공고 오류 문구가 안전하게 출력되지 않습니다.");
assert(indexHtml.includes("const _FUNDS_PLACEHOLDER = [];"), "홈의 대량 레거시 내장 데이터가 제거되지 않았습니다.");

const publicPages = [
  { relative: "index.html", canonical: `${siteUrl}/` },
  ...trustSlugs.map((slug) => ({ relative: `${slug}/index.html`, canonical: `${siteUrl}/${slug}/` })),
  ...funds.map((fund) => ({ relative: `${fund.slug}/index.html`, canonical: `${siteUrl}/${encodeURIComponent(fund.slug)}/`, fund }))
];

const availablePaths = new Set(["/"]);
for (const page of publicPages.slice(1)) availablePaths.add(new URL(page.canonical).pathname);
for (const file of ["/favicon.svg", "/ads.txt", "/robots.txt", "/sitemap.xml", "/404.html"]) availablePaths.add(file);

for (const page of publicPages) {
  let html;
  try { html = await read(page.relative); }
  catch { assert(false, `공개 페이지 파일 누락: ${page.relative}`); continue; }
  assert(html.includes(`<link rel="canonical" href="${page.canonical}">`), `${page.relative}: canonical 불일치`);
  assert(/<meta name="robots" content="index, follow/.test(html), `${page.relative}: 공개 페이지 robots 오류`);
  assert(/<title>[^<]{8,}<\/title>/.test(html), `${page.relative}: 고유 title 누락`);
  assert(/<meta name="description" content="[^\"]{40,}">/.test(html), `${page.relative}: description이 너무 짧거나 없습니다.`);
  assert(html.includes("ca-pub-7217591196020054"), `${page.relative}: AdSense 게시자 ID 누락`);
  for (const forbidden of ["https://boribay.com", "https://goatool", "emailjs"]) {
    assert(!html.toLowerCase().includes(forbidden), `${page.relative}: 심사 전 제거해야 할 외부 유도·상담 코드가 있습니다: ${forbidden}`);
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch (error) { assert(false, `${page.relative}: JSON-LD 파싱 오류 - ${error.message}`); }
  }

  for (const match of html.matchAll(/href="(\/[^\"#]*)"/g)) {
    const href = match[1];
    const pathname = new URL(href, siteUrl).pathname;
    assert(availablePaths.has(pathname), `${page.relative}: 존재하지 않는 내부 링크 ${href}`);
  }

  if (page.fund) {
    const escapedSourceUrl = page.fund.sourceUrl.replaceAll("&", "&amp;");
    assert(html.includes(`href="${escapedSourceUrl}"`), `${page.relative}: 직접 공식 출처 링크 누락`);
    assert(html.includes(`검수일 ${page.fund.reviewedAt}`), `${page.relative}: 검수일 표시 누락`);
    assert(html.includes('data-generated="policyfundpedia-static-detail"'), `${page.relative}: 생성 페이지 마커 누락`);
    assert(html.length >= 15000, `${page.relative}: 상세 페이지 본문이 비정상적으로 짧습니다.`);
  }
}

const notFound = await read("404.html");
assert(notFound.includes('name="robots" content="noindex, nofollow"'), "404 페이지는 noindex여야 합니다.");
assert(!notFound.includes("adsbygoogle"), "404 페이지에는 광고 로더를 두지 않습니다.");
assert(!notFound.includes('rel="canonical"'), "404 페이지에는 canonical을 두지 않습니다.");

const sitemap = await read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = new Set(publicPages.map((page) => page.canonical));
assert(sitemapUrls.length === expectedUrls.size, `sitemap URL 수 불일치: ${sitemapUrls.length}/${expectedUrls.size}`);
assert(new Set(sitemapUrls).size === sitemapUrls.length, "sitemap에 중복 URL이 있습니다.");
for (const url of sitemapUrls) assert(expectedUrls.has(url), `sitemap의 예상 밖 URL: ${url}`);
for (const url of expectedUrls) assert(sitemapUrls.includes(url), `sitemap 누락 URL: ${url}`);

const ads = (await read("ads.txt")).trim();
assert(ads === "google.com, pub-7217591196020054, DIRECT, f08c47fec0942fa0", "ads.txt 게시자 선언이 변경되었습니다.");
const robots = await read("robots.txt");
assert(robots.includes("Sitemap: https://policyfundpedia.com/sitemap.xml"), "robots.txt sitemap 선언 누락");

const redirects = await read("_redirects");
const redirectSources = new Set();
for (const rawLine of redirects.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const [source, target, code] = line.split(/\s+/);
  assert(source && target && code === "301", `_redirects 형식 또는 상태코드 오류: ${line}`);
  assert(!redirectSources.has(source), `_redirects 중복 source: ${source}`);
  redirectSources.add(source);
  const targetPath = new URL(target, siteUrl).pathname;
  assert(availablePaths.has(targetPath), `_redirects 대상이 존재하지 않습니다: ${target}`);
}

if (errors.length) {
  console.error(`Site validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${funds.length} verified fund pages, ${trustSlugs.length} trust pages, sitemap, redirects, 404, internal links and JSON-LD.`);
}
