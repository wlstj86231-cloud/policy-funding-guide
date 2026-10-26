// 모든 공개 페이지가 함께 쓰는 운영자 정보·머리글·바닥글·작성 정보 블록.
// 운영자 정보는 boribay.com/about, jnewmedia.com/company 에서 2026-10-26에 확인한 값만 쓴다.
export const SITE_URL = "https://policyfundpedia.com";
export const SITE_NAME = "농업 정책자금 백과";
export const ORG_ID = "https://jnewmedia.com/#organization";
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const OPERATOR = {
  name: "제이 미디어",
  legalName: "제이 미디어(Media)",
  alternateName: ["J MEDIA", "제이미디어", "제이 미디어(Media)"],
  representative: "이정우",
  businessNumber: "456-33-01705",
  address: "전북특별자치도 군산시 의료원로 80-8, 301호(지곡동)",
  phone: "010-2846-2011",
  phoneIntl: "+82-10-2846-2011",
  email: "consultingjinjeong@gmail.com",
  kakaoGeneral: "https://open.kakao.com/o/scuvl1wi",
  kakaoBoribay: "https://open.kakao.com/o/p6HiJ9Pi",
  companyUrl: "https://jnewmedia.com/",
  companyInfoUrl: "https://jnewmedia.com/company/",
  logo: "https://jnewmedia.com/assets/mark.svg",
  sameAs: [
    "https://www.instagram.com/boribaydotcom/",
    "https://blog.naver.com/plannerset",
    "https://jnewmedia.com/",
    "https://boribay.com/"
  ]
};

export const BYLINE_TEXT = "제이 미디어 편집팀 (운영 책임: 대표 이정우)";

export function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: OPERATOR.name,
    legalName: OPERATOR.legalName,
    alternateName: OPERATOR.alternateName,
    url: OPERATOR.companyUrl,
    logo: { "@type": "ImageObject", url: OPERATOR.logo },
    address: {
      "@type": "PostalAddress",
      streetAddress: "의료원로 80-8, 301호(지곡동)",
      addressLocality: "군산시",
      addressRegion: "전북특별자치도",
      addressCountry: "KR"
    },
    telephone: OPERATOR.phoneIntl,
    email: OPERATOR.email,
    identifier: { "@type": "PropertyValue", name: "사업자등록번호", value: OPERATOR.businessNumber },
    sameAs: OPERATOR.sameAs
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    alternateName: "policyfundpedia.com",
    inLanguage: "ko-KR",
    publisher: { "@id": ORG_ID }
  };
}

// 페이지마다 Organization·WebSite를 같은 @graph에 넣어 @id 참조가 한 문서 안에서 풀리게 한다.
// JSON.stringify는 undefined 값을 빼므로 선택 항목을 안전하게 둘 수 있다.
export function jsonLdScript(nodes) {
  const graph = [organizationNode(), websiteNode(), ...nodes];
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")}</script>`;
}

export const CHROME_CSS = `
    header.sh{position:static;background:#fff;border:0;border-bottom:1px solid #dfe6e1;border-radius:0;margin:0;padding:0;backdrop-filter:none;-webkit-backdrop-filter:none}
    .sh-in{max-width:1080px;margin:0 auto;padding:8px 16px;display:flex;flex-wrap:wrap;gap:6px 16px;align-items:center;justify-content:space-between}
    .sh-logo{display:inline-block;padding:9px 0;line-height:26px;font-size:20px;font-weight:800;letter-spacing:-.3px;color:#0f172a;text-decoration:none}.sh-logo span{color:#1a56db}
    .sh-nav{display:flex;flex-wrap:wrap;gap:6px}.sh-nav a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 13px;border:1px solid #d5dfd8;border-radius:9px;background:#fff;color:#1f2d3d;font-size:15px;font-weight:600;text-decoration:none}
    .sh-nav a[aria-current="page"]{border-color:#1f5f45;background:#eaf4ee;color:#174a36}
    footer.sf{display:block;max-width:none;background:#fff;border:0;border-top:1px solid #dfe6e1;border-radius:0;margin:32px 0 0;padding:20px 16px 34px;font-size:14px;color:#475467;text-align:left}
    .sf-in{max-width:1080px;margin:0 auto}.sf-links{display:flex;flex-wrap:wrap;gap:0 18px;margin:0 0 8px}.sf-links a{display:inline-flex;align-items:center;min-height:44px;padding:0;color:#1f2d3d;font-size:15px;font-weight:600;text-decoration:none}
    .sf p{margin:4px 0;font-size:14px;line-height:1.7;color:#475467}.sf p a{color:#1f2d3d}.sf .nw{white-space:nowrap}
    .pmeta{display:flex;flex-wrap:wrap;gap:4px 16px;margin:14px 0 0;padding:10px 13px;border:1px solid #dfe6e1;border-radius:10px;background:#f8faf9;font-size:14px;line-height:1.65;color:#3b4858}.pmeta b{color:#1f2d3d}.pmeta a{color:#1a56db;font-weight:700}
    .src-list{margin:0;padding-left:20px}.src-list li{margin:9px 0;font-size:15px;line-height:1.65;color:#334155}.src-list a{color:#1a56db;font-weight:700;overflow-wrap:break-word}.src-meta{display:block;font-size:14px;color:#475467}
    .scope{margin:14px 0 0;border-left:4px solid #8a99ab;background:#f8fafc;border-radius:0 10px 10px 0;padding:12px 15px;font-size:15px;line-height:1.7;color:#334155}.scope p{margin:0 0 8px}.scope p:last-child{margin:0}
    @media(max-width:640px){.sh-nav{width:100%;display:grid;grid-template-columns:repeat(4,1fr)}.sh-nav a{padding:0 4px;font-size:14px}}
    @media print{header.sh,footer.sf{display:none}}`;

const NAV = [
  { href: "/agri/", label: "자금 비교" },
  { href: "/guides/used-farm-machinery-loan-limit-2026/", label: "한도 계산" },
  { href: "/about/", label: "소개" },
  { href: "/contact/", label: "문의" }
];

export function headerHtml(pathname = "/") {
  const links = NAV.map((item) => `<a href="${item.href}"${item.href === pathname ? ' aria-current="page"' : ""}>${item.label}</a>`).join("");
  return `<header class="sh"><div class="sh-in"><a class="sh-logo" href="/">농업 정책자금 <span>백과</span></a><nav class="sh-nav" aria-label="주요 메뉴">${links}</nav></div></header>`;
}

// Cloudflare 이메일 난독화가 주소를 [email protected]으로 바꾸지 않도록 email_off 주석으로 감싼다.
export function footerHtml() {
  return `<footer class="sf"><div class="sf-in">
    <nav class="sf-links" aria-label="사이트 정보"><a href="/about/">소개</a><a href="/contact/">문의</a><a href="/editorial-policy/">편집 원칙</a><a href="/corrections/">정정·수정 기록</a><a href="/privacy/">개인정보처리방침</a><a href="/terms/">이용약관·면책</a></nav>
    <p><span class="nw">운영: ${OPERATOR.name}</span> · <span class="nw">대표 ${OPERATOR.representative}</span> · <span class="nw">사업자등록번호 ${OPERATOR.businessNumber}</span> · <span class="nw">고객센터 <a href="tel:${OPERATOR.phone}">${OPERATOR.phone}</a></span></p>
    <p>${OPERATOR.address} · <!--email_off--><a href="mailto:${OPERATOR.email}">${OPERATOR.email}</a><!--/email_off--></p>
    <p>농업 정책자금 백과는 정부기관이 아닌 민간 정보 사이트입니다. 지원 대상 선정과 대출 승인은 시군·농협 등 담당 기관이 결정하며, 이 사이트는 신청 대행·대출 중개·승인 보장을 하지 않습니다.</p>
    <p>© 2026 ${OPERATOR.name} · 농업 정책자금 백과</p>
  </div></footer>`;
}

export function metaBlockHtml({ published, checked, sourceCount, sourcesHref = "#sources" }) {
  return `<div class="pmeta" role="note"><span><b>작성·관리</b> <a href="/editorial-policy/">${escapeHtml(BYLINE_TEXT)}</a></span><span><b>게시일</b> ${escapeHtml(published)}</span><span><b>최종 확인일</b> ${escapeHtml(checked)}</span><span><b>출처</b> <a href="${sourcesHref}">${sourceCount}건</a></span></div>`;
}

// 공식 출처 목록. items: [{ title, authority, url, note }]
export function sourceListHtml(items, checked) {
  return `<ol class="src-list">${items.map((item) => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a><span class="src-meta">${escapeHtml(item.authority)} · 확인일 ${escapeHtml(checked)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</span></li>`).join("")}</ol>`;
}

export function replaceBlock(html, name, content) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const from = html.indexOf(start);
  const to = html.indexOf(end);
  if (from === -1 || to === -1 || to < from) throw new Error(`표시 블록 ${name} 을(를) 찾지 못했습니다.`);
  return `${html.slice(0, from + start.length)}${content}${html.slice(to)}`;
}

export function hasBlock(html, name) {
  return html.includes(`<!-- ${name}:start -->`) && html.includes(`<!-- ${name}:end -->`);
}
