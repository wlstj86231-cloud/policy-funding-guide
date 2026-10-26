import fs from "node:fs/promises";
import path from "node:path";
import { OPERATOR, ORG_ID, WEBSITE_ID } from "./site-chrome.mjs";

const root = path.resolve(import.meta.dirname, "..");
const siteUrl = "https://policyfundpedia.com";
const trustSlugs = ["about", "contact", "editorial-policy", "corrections", "privacy", "terms"];
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const read = (relative) => fs.readFile(path.join(root, relative), "utf8");

const dataDocument = JSON.parse(await read("data/verified-funds.json"));
const funds = Array.isArray(dataDocument) ? dataDocument : dataDocument.items;
assert(Array.isArray(funds), "검증 데이터는 배열이어야 합니다.");
assert(funds.length >= 3 && funds.length <= 30, `공개 검증 문서는 3~30개여야 합니다(현재 ${funds.length}개).`);

const slugs = new Set();
const ids = new Set();
const requiredFields = [
  "id", "slug", "cat", "title", "excerpt", "detail", "limit", "rate", "org", "deadline",
  "target_desc", "amount_desc", "rate_desc", "period_desc", "docs", "agency", "agency_name",
  "agency_note", "updated", "reviewedAt", "published", "status", "sourceTitle", "sourceAuthority", "sourceDate",
  "sourceUrl", "editorNote", "nextCheck"
];

for (const fund of funds) {
  for (const field of requiredFields) assert(String(fund[field] ?? "").trim(), `${fund.title || fund.id}: ${field} 누락`);
  assert(fund.cat === "농업인", `${fund.title}: 농업 정책자금 외 문서는 공개하지 않습니다(cat=${fund.cat}).`);
  assert(!slugs.has(fund.slug), `중복 slug: ${fund.slug}`);
  assert(!ids.has(fund.id), `중복 id: ${fund.id}`);
  slugs.add(fund.slug);
  ids.add(fund.id);
  try {
    const source = new URL(fund.sourceUrl);
    assert(source.protocol === "https:", `${fund.title}: 공식 출처는 HTTPS여야 합니다.`);
    assert(source.pathname !== "/" || source.search, `${fund.title}: 기관 홈페이지가 아닌 직접 상세 출처가 필요합니다.`);
  } catch {
    assert(false, `${fund.title}: 공식 출처 URL이 유효하지 않습니다.`);
  }
  assert(/^\d{4}-\d{2}-\d{2}$/.test(fund.reviewedAt), `${fund.title}: 검수일 형식 오류`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(fund.published) && fund.published <= fund.reviewedAt, `${fund.title}: 게시일 형식 오류 또는 검수일보다 늦음`);
  assert(fund.reviewedAt === fund.updated, `${fund.title}: updated와 reviewedAt 불일치`);
  assert(/2027/.test(fund.nextCheck), `${fund.title}: 2027년 지침 확인 계획(nextCheck)이 필요합니다.`);
  for (const extra of fund.sourceExtra || []) assert(extra.authority && /^https:\/\//.test(extra.url), `${fund.title}: 추가 출처에 기관(authority)과 HTTPS 주소가 필요합니다.`);
  for (const [field, minimum] of [["eligibility", 2], ["exclusions", 2], ["documents", 2], ["cautions", 2], ["faq", 2], ["steps", 3], ["timeline", 3], ["rejections", 2]]) {
    assert(Array.isArray(fund[field]) && fund[field].length >= minimum, `${fund.title}: ${field} 최소 ${minimum}개 필요`);
  }
  const evidence = [
    fund.detail, fund.target_desc, fund.amount_desc, fund.rate_desc, fund.period_desc,
    ...(fund.eligibility || []), ...(fund.exclusions || []), ...(fund.documents || []), ...(fund.cautions || []),
    ...(fund.faq || []).flatMap((item) => [item.q, item.a]), fund.editorNote
  ].join(" ");
  assert(evidence.length >= 650, `${fund.title}: 고유 설명이 650자 미만입니다.`);
}

const fundPage = (fund) => ({ relative: `${fund.slug}/index.html`, canonical: `${siteUrl}/${encodeURIComponent(fund.slug)}/`, fund, content: true });
const publicPages = [
  { relative: "index.html", canonical: `${siteUrl}/`, content: true },
  { relative: "agri/index.html", canonical: `${siteUrl}/agri/`, content: true },
  { relative: "guides/farmer-machinery-loan-execution-2026/index.html", canonical: `${siteUrl}/guides/farmer-machinery-loan-execution-2026/`, content: true },
  { relative: "guides/used-farm-machinery-loan-limit-2026/index.html", canonical: `${siteUrl}/guides/used-farm-machinery-loan-limit-2026/`, content: true },
  ...trustSlugs.map((slug) => ({ relative: `${slug}/index.html`, canonical: `${siteUrl}/${slug}/` })),
  ...funds.map(fundPage)
];
const utilityPages = ["404.html", "retired/index.html"];

// 보리장터 연결은 운영 관계 고지와 농기계 구입·운송 맥락의 검수된 주소만 허용한다.
const boribayUtm = "utm_source=policyfundpedia.com&amp;utm_medium=referral&amp;utm_campaign=support";
const boribayMachinery = `https://boribay.com/?category=MACHINERY&amp;${boribayUtm}`;
const boribayTractor = `https://boribay.com/guides/used-tractor-buying-checklist?${boribayUtm}`;
const boribayRules = {
  "about/index.html": [`https://boribay.com/?${boribayUtm}`],
  "guides/farmer-machinery-loan-execution-2026/index.html": [`https://boribay.com/guides/farm-machinery-transport-checklist?${boribayUtm}`],
  "guides/used-farm-machinery-loan-limit-2026/index.html": [boribayMachinery, boribayTractor],
  "2026-후계농-농기계-구입자금/index.html": [boribayTractor],
  "2026-농업기계-구입자금-융자/index.html": [boribayMachinery, boribayTractor]
};

const availablePaths = new Set(["/", "/retired/"]);
for (const page of publicPages) availablePaths.add(new URL(page.canonical).pathname);
for (const file of ["/favicon.svg", "/ads.txt", "/robots.txt", "/sitemap.xml", "/404.html"]) availablePaths.add(file);

const footerMarks = [`사업자등록번호 ${OPERATOR.businessNumber}`, `고객센터 <a href="tel:${OPERATOR.phone}">${OPERATOR.phone}</a>`, `운영: ${OPERATOR.name}`, `대표 ${OPERATOR.representative}`, 'href="/privacy/"', 'href="/terms/"', 'href="/editorial-policy/"', 'href="/contact/"', 'href="/about/"'];

function checkCommon(relative, html) {
  assert(html.includes('<header class="sh">'), `${relative}: 공통 머리글 누락`);
  for (const mark of footerMarks) assert(html.includes(mark), `${relative}: 바닥글 운영자 정보·링크 누락 (${mark})`);
  // 수정 기록의 "'정책자금 백과'에서 … 바꿨습니다"처럼 따옴표로 인용한 옛 이름은 허용한다.
  assert(!/(?<!농업 |')정책자금 백과/.test(html.replace(/농업 정책자금 <span>백과<\/span>/g, "")), `${relative}: 옛 이름 '정책자금 백과'가 남았습니다.`);
  assert(!/localStorage\s*[.[]/.test(html), `${relative}: 브라우저 저장소를 쓰지 않는다는 개인정보 안내와 다릅니다.`);
  assert(!html.includes("/api/bizinfo"), `${relative}: 농업과 무관한 기업마당 공고 API를 부르지 않습니다.`);
  for (const match of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const pathname = new URL(match[1], siteUrl).pathname;
    assert(availablePaths.has(pathname), `${relative}: 존재하지 않는 내부 링크 ${match[1]}`);
  }
}

for (const page of publicPages) {
  let html;
  try { html = await read(page.relative); }
  catch { assert(false, `공개 페이지 파일 누락: ${page.relative}`); continue; }
  checkCommon(page.relative, html);
  assert(html.includes(`<link rel="canonical" href="${page.canonical}">`), `${page.relative}: canonical 불일치`);
  assert(/<meta name="robots" content="index, follow/.test(html), `${page.relative}: 공개 페이지 robots 오류`);
  assert(/<title>[^<]{8,}<\/title>/.test(html), `${page.relative}: 고유 title 누락`);
  assert(/<meta name="description" content="[^"]{40,}">/.test(html), `${page.relative}: description이 너무 짧거나 없습니다.`);
  assert(html.includes("ca-pub-5877883031077615"), `${page.relative}: AdSense 게시자 ID 누락`);
  assert(!html.toLowerCase().includes("emailjs"), `${page.relative}: 상담 수집 코드가 있습니다.`);
  if (page.relative !== "about/index.html") assert(!html.includes("https://goatool"), `${page.relative}: 자매 사이트 전체 목록·연결은 소개 페이지에만 둡니다.`);
  const boribayLinks = [...html.matchAll(/href="(https:\/\/boribay\.com[^"]*)"/g)].map((match) => match[1]).sort();
  const expectedBoribay = (boribayRules[page.relative] || []).slice().sort();
  assert(JSON.stringify(boribayLinks) === JSON.stringify(expectedBoribay),
    `${page.relative}: 보리장터 링크는 검수된 주소만 허용합니다(발견 ${boribayLinks.length}개).`);

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert(scripts.length === 1, `${page.relative}: JSON-LD는 하나의 @graph로 둡니다(현재 ${scripts.length}개).`);
  for (const match of scripts) {
    let data;
    try { data = JSON.parse(match[1]); }
    catch (error) { assert(false, `${page.relative}: JSON-LD 파싱 오류 - ${error.message}`); continue; }
    const graph = data["@graph"] || [];
    const org = graph.find((node) => node["@id"] === ORG_ID);
    assert(org && org["@type"] === "Organization" && org.telephone && org.email && org.address && Array.isArray(org.sameAs), `${page.relative}: Organization 노드 누락`);
    assert(graph.some((node) => node["@id"] === WEBSITE_ID && node.publisher?.["@id"] === ORG_ID), `${page.relative}: WebSite 노드 또는 publisher 참조 누락`);
    assert(!graph.some((node) => node["@type"] === "Person"), `${page.relative}: Person 작성자를 만들지 않습니다.`);
    for (const node of graph) {
      if (node.publisher) assert(node.publisher["@id"] === ORG_ID, `${page.relative}: ${node["@type"]} publisher가 운영자 @id를 참조하지 않습니다.`);
      if (node.author) assert(node.author["@id"] === ORG_ID, `${page.relative}: ${node["@type"]} author가 운영자 @id를 참조하지 않습니다.`);
      if (node.datePublished) assert(/^\d{4}-\d{2}-\d{2}$/.test(node.datePublished) && node.datePublished <= node.dateModified, `${page.relative}: 날짜 형식 오류`);
      if (node["@type"] === "FAQPage") {
        for (const item of node.mainEntity) assert(html.includes(item.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")), `${page.relative}: 화면에 없는 FAQ 질문이 JSON-LD에 있습니다.`);
      }
    }
  }

  if (page.content) {
    assert(/<div class="pmeta" role="note">[\s\S]*작성·관리[\s\S]*게시일[\s\S]*최종 확인일[\s\S]*출처/.test(html), `${page.relative}: 작성·관리/게시일/최종 확인일/출처 수 블록 누락`);
    assert(html.includes('id="sources"') && /<ol class="src-list">[\s\S]*?확인일 \d{4}-\d{2}-\d{2}/.test(html), `${page.relative}: 출처 목록(기관·확인일) 누락`);
    assert(html.includes("범위와 한계"), `${page.relative}: 범위와 한계 안내 누락`);
    assert(/2027년 (사업시행)?지침[^<]{0,40}12월/.test(html), `${page.relative}: 2027년 지침이 12월에 나온다는 안내 누락`);
  }

  if (page.fund) {
    const escapedSourceUrl = page.fund.sourceUrl.replaceAll("&", "&amp;");
    assert(html.includes(`href="${escapedSourceUrl}"`), `${page.relative}: 직접 공식 출처 링크 누락`);
    assert(html.includes(`확인일 ${page.fund.reviewedAt}`), `${page.relative}: 확인일 표시 누락`);
    assert(html.includes(`게시일</b> ${page.fund.published}`), `${page.relative}: 게시일 표시 누락`);
    assert(html.includes('data-generated="policyfundpedia-static-detail"'), `${page.relative}: 생성 페이지 마커 누락`);
    assert(html.length >= 15000, `${page.relative}: 상세 페이지 본문이 비정상적으로 짧습니다.`);
  }
}

const indexHtml = await read("index.html");
for (const fund of funds) assert(indexHtml.includes(`href="/${encodeURIComponent(fund.slug)}/"`), `홈에 자금 문서 링크가 없습니다: ${fund.slug}`);
for (const forbidden of ["최신 공고", "기업마당", "pf_saved\"", "PROXY_URL", "emailjs", "민간 컨설턴트"]) {
  assert(!indexHtml.includes(forbidden), `홈에 농업과 무관하거나 제거된 기능이 남았습니다: ${forbidden}`);
}

for (const relative of utilityPages) {
  const html = await read(relative);
  checkCommon(relative, html);
  assert(html.includes('name="robots" content="noindex'), `${relative}: noindex여야 합니다.`);
  assert(!html.includes("adsbygoogle"), `${relative}: 유틸리티 페이지에는 광고 로더를 두지 않습니다.`);
  assert(!html.includes('rel="canonical"'), `${relative}: canonical을 두지 않습니다.`);
  assert(!html.includes("application/ld+json"), `${relative}: 색인 제외 페이지에는 JSON-LD를 두지 않습니다.`);
}

const sitemap = await read("sitemap.xml");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expectedUrls = new Set(publicPages.map((page) => page.canonical));
assert(sitemapUrls.length === expectedUrls.size, `sitemap URL 수 불일치: ${sitemapUrls.length}/${expectedUrls.size}`);
assert(new Set(sitemapUrls).size === sitemapUrls.length, "sitemap에 중복 URL이 있습니다.");
for (const url of sitemapUrls) assert(expectedUrls.has(url), `sitemap의 예상 밖 URL: ${url}`);
for (const url of expectedUrls) assert(sitemapUrls.includes(url), `sitemap 누락 URL: ${url}`);
assert((sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g) || []).length === sitemapUrls.length, "sitemap의 모든 URL에 실제 lastmod가 필요합니다.");

const ads = (await read("ads.txt")).trim();
assert(ads === "google.com, pub-5877883031077615, DIRECT, f08c47fec0942fa0", "ads.txt 게시자 선언이 변경되었습니다.");
const robots = await read("robots.txt");
assert(robots.includes("Sitemap: https://policyfundpedia.com/sitemap.xml"), "robots.txt sitemap 선언 누락");
assert(!/Disallow:\s*\/\s*$/m.test(robots), "robots.txt가 사이트 전체를 막고 있습니다.");

const redirects = await read("_redirects");
const redirectSources = new Set();
let staticRules = 0;
let dynamicRules = 0;
for (const rawLine of redirects.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const parts = line.split(/\s+/);
  const [source, target, code] = parts;
  assert(parts.length === 3 && source && target && code === "301", `_redirects 형식 또는 상태코드 오류: ${line}`);
  assert(!redirectSources.has(source), `_redirects 중복 source: ${source}`);
  redirectSources.add(source);
  if (source.includes("*") || source.includes(":")) dynamicRules += 1; else staticRules += 1;
  const targetPath = new URL(target, siteUrl).pathname;
  assert(availablePaths.has(targetPath), `_redirects 대상이 존재하지 않습니다: ${target}`);
  if (!source.includes("*")) assert(!expectedUrls.has(`${siteUrl}${encodeURI(source)}`) && !expectedUrls.has(`${siteUrl}${encodeURI(source)}/`), `_redirects가 공개 페이지를 가립니다: ${source}`);
}
assert(staticRules <= 2000 && dynamicRules <= 100, `_redirects 규칙 수가 Pages 한도를 넘습니다(정적 ${staticRules}, 동적 ${dynamicRules}).`);
for (const page of publicPages) {
  const pathname = decodeURIComponent(new URL(page.canonical).pathname);
  for (const source of redirectSources) {
    if (!source.endsWith("*")) continue;
    assert(!pathname.startsWith(source.slice(0, -1)) || source.startsWith("/scripts") , `_redirects 와일드카드 ${source}가 공개 페이지 ${pathname}를 가립니다.`);
  }
}
for (const retired of ["햇살론일반", "햇살론특례", "햇살론유스", "불법사금융예방대출", "금융취약계층-생계자금", "청년-미래이음-대출", "신용회복위원회-소액금융-보증", "햇살론카드", "소상공인-특례-햇살론카드", "햇살론119", "2026-청년일자리도약장려금", "2026-소상공인-정책자금"]) {
  assert(redirectSources.has(`/${retired}`) && redirectSources.has(`/${retired}/`), `_redirects에 제공 종료 문서 주소가 없습니다: ${retired}`);
}

if (errors.length) {
  console.error(`Site validation failed (${errors.length})`);
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${funds.length} fund pages, ${publicPages.length} indexable pages, ${utilityPages.length} utility pages, sitemap, ${redirectSources.size} redirects (${staticRules} static / ${dynamicRules} dynamic), internal links and JSON-LD.`);
}
