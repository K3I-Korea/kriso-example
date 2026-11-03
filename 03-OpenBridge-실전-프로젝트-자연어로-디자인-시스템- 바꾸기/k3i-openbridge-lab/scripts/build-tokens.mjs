// Token 층 빌드: design/tokens.json → src/styles/k3i-tokens.css
//
//  { "ob": "--x" }                      → --k3i-group-name: var(--x)        (OpenBridge alias, 권장)
//  { "value": "4px" }                   → --k3i-group-name: 4px             (OpenBridge 에 없는 값)
//  { ..., "palettes": { "night": {...} } } → [data-obc-theme="night"] 블록에서만 덮어쓰기
//
// 참조하는 OpenBridge 변수가 실제로 존재하는지 검사한다 (오타·버전 변경 방지).
import { readFileSync, writeFileSync } from "node:fs";

const OB_CSS = "node_modules/@oicl/openbridge-webcomponents/dist/openbridge.css";
const PALETTES = ["bright", "day", "dusk", "night"];

export function loadObVars() {
  return new Set(readFileSync(OB_CSS, "utf8").match(/--[a-z0-9-]+(?=\s*:)/g));
}

export function compileTokens(tokens, obVars) {
  const root = [];
  const perPalette = Object.fromEntries(PALETTES.map((p) => [p, []]));
  const errors = [];

  const decl = (cssName, t, where) => {
    if (t.ob) {
      if (!obVars.has(t.ob)) errors.push(`${where}: OpenBridge 에 없는 변수 ${t.ob}`);
      return `  ${cssName}: var(${t.ob});`;
    }
    if (t.value !== undefined) return `  ${cssName}: ${t.value};`;
    errors.push(`${where}: "ob" 또는 "value" 가 필요합니다`);
    return "";
  };

  for (const [group, entries] of Object.entries(tokens)) {
    if (group.startsWith("$")) continue;
    for (const [name, t] of Object.entries(entries)) {
      const cssName = `--k3i-${group}-${name}`;
      root.push(decl(cssName, t, `${group}.${name}`));
      for (const [p, o] of Object.entries(t.palettes ?? {})) {
        if (!PALETTES.includes(p)) errors.push(`${group}.${name}: 알 수 없는 팔레트 ${p}`);
        else perPalette[p].push(decl(cssName, o, `${group}.${name}.palettes.${p}`));
      }
    }
  }

  let css = `/* 자동 생성 — design/tokens.json 을 수정하고 npm run tokens 를 실행하세요 */\n:root {\n${root.join("\n")}\n}\n`;
  for (const p of PALETTES) {
    if (perPalette[p].length)
      css += `\n:root[data-obc-theme="${p}"] {\n${perPalette[p].join("\n")}\n}\n`;
  }
  return { css, errors, count: root.length };
}

// CLI 실행 시
if (import.meta.url === `file://${process.argv[1]}`) {
  const tokens = JSON.parse(readFileSync("design/tokens.json", "utf8"));
  const { css, errors, count } = compileTokens(tokens, loadObVars());
  if (errors.length) {
    console.error("✖ 토큰 오류\n  " + errors.join("\n  "));
    process.exit(1);
  }
  writeFileSync("src/styles/k3i-tokens.css", css);
  console.log(`✔ k3i-tokens.css — 토큰 ${count}개, OpenBridge 참조 검증 완료`);
}
