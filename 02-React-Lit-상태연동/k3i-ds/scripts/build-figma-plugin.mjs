// tokens.json + themes/dark.json 을 플러그인 코드에 박아 넣어 figma/plugin/code.js 생성
// 실행: npm run figma:plugin
import { readFileSync, writeFileSync } from "node:fs";

const base = JSON.parse(readFileSync("tokens/tokens.json", "utf8"));
const dark = JSON.parse(readFileSync("tokens/themes/dark.json", "utf8"));
const main = readFileSync("figma/plugin/src/main.js", "utf8");

const out =
  `// 자동 생성 파일 — 직접 수정하지 말고 figma/plugin/src/main.js 를 수정하세요\n` +
  `const TOKENS = ${JSON.stringify({ base, dark }, null, 2)};\n\n` +
  main;

writeFileSync("figma/plugin/code.js", out);
console.log("✔ figma/plugin/code.js 생성 완료");
