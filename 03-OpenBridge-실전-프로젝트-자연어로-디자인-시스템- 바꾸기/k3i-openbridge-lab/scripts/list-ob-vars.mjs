// OpenBridge 팔레트 변수를 팔레트별로 뽑아 보는 학습용 스크립트
//   npm run ob:vars                 → 접두어별 개수 요약
//   npm run ob:vars -- element      → "--element" 로 시작하는 변수의 4개 팔레트 값 비교표
import { readFileSync } from "node:fs";

const css = readFileSync("node_modules/@oicl/openbridge-webcomponents/dist/openbridge.css", "utf8");
const filter = process.argv[2];
const palettes = ["bright", "day", "dusk", "night"];
const table = {}; // name → { day: value, ... }

for (const p of palettes) {
  const re = new RegExp(`\\[data-obc-theme="${p}"\\]\\s*\\{([^}]*)\\}`, "g");
  for (const [, body] of css.matchAll(re)) {
    for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      (table[name] ??= {})[p] = value.trim();
    }
  }
}

const names = Object.keys(table).sort();
if (!filter) {
  const byPrefix = {};
  for (const n of names) {
    const k = n.split("-").slice(2, 3).join("");
    byPrefix[k] = (byPrefix[k] ?? 0) + 1;
  }
  console.log(`팔레트별로 값이 달라지는 변수 ${names.length}개`);
  console.table(byPrefix);
  console.log("예) npm run ob:vars -- container");
} else {
  const rows = names
    .filter((n) => n.startsWith(`--${filter}`))
    .map((n) => ({ name: n, ...table[n] }));
  console.table(rows);
}
