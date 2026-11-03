// Figma(Tokens Studio, W3C DTCG 포맷) 토큰 JSON → CSS 변수 / JS 상수
// 실행: npm run tokens
import StyleDictionary from "style-dictionary";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const PREFIX = "ds";
const OUT = "src/styles/";

// 1) 라이트(기본) 테마: :root 에 모든 토큰 출력
const light = new StyleDictionary({
  source: ["tokens/tokens.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: PREFIX,
      buildPath: OUT,
      files: [
        {
          destination: "tokens.light.css",
          format: "css/variables",
          options: { selector: ":root", outputReferences: true },
        },
      ],
    },
    js: {
      transformGroup: "js",
      buildPath: OUT,
      files: [{ destination: "tokens.js", format: "javascript/es6" }],
    },
  },
});

// 2) 다크 테마: 시맨틱 토큰만 덮어쓰기
const dark = new StyleDictionary({
  include: ["tokens/tokens.json"],
  source: ["tokens/themes/dark.json"],
  platforms: {
    css: {
      transformGroup: "css",
      prefix: PREFIX,
      buildPath: OUT,
      files: [
        {
          destination: "tokens.dark.css",
          format: "css/variables",
          // 다크 테마 파일에 정의된 토큰만 출력
          filter: (token) => token.filePath.includes("themes/dark"),
          options: {
            selector: ':root[data-theme="dark"], .ds-theme-dark',
            outputReferences: true,
          },
        },
      ],
    },
  },
});

await light.buildAllPlatforms();
await dark.buildAllPlatforms();

// 3) 하나의 tokens.css 로 합치기 (앱에서 이 파일 하나만 import)
mkdirSync("dist", { recursive: true });
const merged =
  readFileSync(OUT + "tokens.light.css", "utf8") +
  "\n" +
  readFileSync(OUT + "tokens.dark.css", "utf8");
writeFileSync(OUT + "tokens.css", merged);
writeFileSync("dist/tokens.css", merged);
console.log("✔ tokens.css 생성 완료");
