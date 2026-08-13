import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const indexPath = path.join(root, "index.html");
let html = await fs.readFile(indexPath, "utf8");

const dataMarker = "const _FUNDS_PLACEHOLDER = [";
const dataStart = html.indexOf(dataMarker);
if (dataStart !== -1) {
  const arrayStart = html.indexOf("[", dataStart);
  let depth = 0;
  let quote = null;
  let escaped = false;
  let arrayEnd = -1;
  for (let index = arrayStart; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") quote = char;
    else if (char === "[") depth += 1;
    else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = index + 1;
        break;
      }
    }
  }
  if (arrayEnd === -1) throw new Error("내장 레거시 데이터 배열의 끝을 찾지 못했습니다.");
  const statementEnd = html.indexOf("\n", arrayEnd);
  html = `${html.slice(0, dataStart)}const _FUNDS_PLACEHOLDER = []; // 로컬 검증 데이터 로드 실패 시 빈 목록${html.slice(statementEnd)}`;
}

const modalScriptStart = html.indexOf("// 카테고리/상세 페이지 문의하기 버튼 → 자동 모달 오픈");
const modalHtmlMarker = "<!-- ★ 모달";
const modalHtmlStart = html.indexOf(modalHtmlMarker);
if (modalScriptStart !== -1 && modalHtmlStart !== -1) {
  const scriptEnd = html.lastIndexOf("</script>", modalHtmlStart);
  if (scriptEnd < modalScriptStart) throw new Error("레거시 상담 스크립트의 끝을 찾지 못했습니다.");
  html = `${html.slice(0, modalScriptStart)}</script>\n${html.slice(modalHtmlStart)}`;
}

const currentModalStart = html.indexOf(modalHtmlMarker);
if (currentModalStart !== -1) {
  const bodyEnd = html.indexOf("</body>", currentModalStart);
  if (bodyEnd === -1) throw new Error("body 닫힘 태그를 찾지 못했습니다.");
  html = `${html.slice(0, currentModalStart)}</body>${html.slice(bodyEnd + "</body>".length)}`;
}

await fs.writeFile(indexPath, html, "utf8");
console.log("Removed legacy embedded API data and consultation form from index.html.");
