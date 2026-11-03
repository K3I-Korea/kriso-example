// design/ 선언 파일 전체 정합성 검사 — 자연어로 디자인을 바꾼 뒤 반드시 실행 (npm run check)
//
// Claude Code 가 JSON 을 고치더라도 이 검사를 통과하지 못하면 화면에 반영되지 않게 하는 안전장치다.
// 오류 메시지는 "무엇을 어떻게 고치면 되는지" 가 드러나게 쓴다 → 에이전트가 스스로 수정할 수 있도록.
import { readFileSync, readdirSync } from "node:fs";
import { compileTokens, loadObVars } from "./build-tokens.mjs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const errors = [];
const warn = [];
const err = (file, msg) => errors.push(`[${file}] ${msg}`);

// ── 1. tokens ──────────────────────────────────────────────
const tokens = read("design/tokens.json");
const { errors: tokErr } = compileTokens(tokens, loadObVars());
tokErr.forEach((m) => err("tokens.json", m));
const colorTokens = new Set(Object.keys(tokens.color ?? {}));

// ── 2. states ──────────────────────────────────────────────
const REQUIRED_STATES = ["normal", "degraded", "stale", "invalid", "alarm", "manual"];
const SHAPES = ["none", "dashed-border", "dim-value", "hide-scale", "strong-border", "left-bar"];
const states = read("design/states.json");
const prio = states.priority ?? [];
if ([...prio].sort().join() !== [...REQUIRED_STATES].sort().join())
  err("states.json", `priority 는 ${REQUIRED_STATES.join(", ")} 6개를 한 번씩 포함해야 합니다 (현재: ${prio.join(", ")})`);
if (prio.at(-1) !== "normal") err("states.json", "priority 의 마지막은 normal 이어야 합니다");
for (const s of REQUIRED_STATES) {
  const d = states.states?.[s];
  if (!d) { err("states.json", `states.${s} 정의가 없습니다`); continue; }
  if (!colorTokens.has(d.token)) err("states.json", `states.${s}.token "${d.token}" 은 tokens.json color 에 없습니다 (가능: ${[...colorTokens].join(", ")})`);
  if (!SHAPES.includes(d.shape)) err("states.json", `states.${s}.shape "${d.shape}" 은 지원하지 않습니다 (가능: ${SHAPES.join(", ")}) — 새 형태가 필요하면 src/ds/base/k3i-panel.ts CSS 를 먼저 추가`);
  if (s !== "normal" && !d.text) warn.push(`[states.json] ${s} 의 text 가 비어 있음 — 색·형태·문자 3중 표기 원칙 위반`);
}

// ── 3. signals ─────────────────────────────────────────────
const signals = read("design/signals.json").signals;
const topics = new Set();
for (const [id, s] of Object.entries(signals)) {
  for (const k of ["topic", "label", "unit", "fractionDigits", "maxDigits", "ttlMs"])
    if (s[k] === undefined) err("signals.json", `${id}.${k} 가 없습니다`);
  if (topics.has(s.topic)) err("signals.json", `${id}: topic ${s.topic} 중복`);
  topics.add(s.topic);
  const asc = (o, name, dir) => {
    if (!o) return;
    const seq = ["caution", "warning", "alarm"].filter((k) => o[k] !== undefined).map((k) => [k, o[k]]);
    for (let i = 1; i < seq.length; i++) {
      const ok = dir > 0 ? seq[i][1] > seq[i - 1][1] : seq[i][1] < seq[i - 1][1];
      if (!ok) err("signals.json", `${id}.${name}: ${seq[i - 1][0]}(${seq[i - 1][1]}) → ${seq[i][0]}(${seq[i][1]}) 순서가 맞지 않습니다`);
    }
  };
  asc(s.limits, "limits", +1);
  asc(s.limitsBelow, "limitsBelow", -1);
}

// ── 4. panels ──────────────────────────────────────────────
const panels = read("design/panels.json").panels;

// ── 5. layouts ─────────────────────────────────────────────
const layouts = read("design/layouts.json").layouts;
const layoutSlots = {};
for (const [name, l] of Object.entries(layouts)) {
  const rows = l.areas.map((r) => r.trim().split(/\s+/));
  const cols = l.columns.trim().split(/\s+/).length;
  rows.forEach((r, i) => {
    if (r.length !== cols) err("layouts.json", `${name}: areas[${i}] 는 ${r.length}칸인데 columns 는 ${cols}칸입니다`);
  });
  if (rows.length !== l.rows.trim().split(/\s+/).length)
    err("layouts.json", `${name}: areas 는 ${rows.length}줄인데 rows 는 ${l.rows.trim().split(/\s+/).length}줄입니다`);
  layoutSlots[name] = new Set(rows.flat().filter((a) => a !== "."));
}

// ── 6. views ───────────────────────────────────────────────
for (const f of readdirSync("design/views").filter((f) => f.endsWith(".json"))) {
  const v = read(`design/views/${f}`);
  const file = `views/${f}`;
  const slots = layoutSlots[v.layout];
  if (!slots) { err(file, `layout "${v.layout}" 이 layouts.json 에 없습니다 (가능: ${Object.keys(layouts).join(", ")})`); continue; }
  for (const [slot, def] of Object.entries(v.slots)) {
    if (!slots.has(slot)) err(file, `슬롯 "${slot}" 은 ${v.layout} 에 없습니다 (가능: ${[...slots].join(", ")})`);
    const p = panels[def.panel];
    if (!p) { err(file, `${slot}: panel "${def.panel}" 은 panels.json 에 없습니다`); continue; }
    for (const role of p.roles) {
      const sid = def.bind?.[role];
      if (!sid) err(file, `${slot}: ${def.panel} 패널은 bind.${role} 가 필요합니다`);
      else if (!signals[sid]) err(file, `${slot}: bind.${role} = "${sid}" 는 signals.json 에 없습니다`);
    }
  }
  for (const s of slots) if (!v.slots[s]) warn.push(`[${file}] 슬롯 "${s}" 이 비어 있습니다`);
}

// ── 결과 ───────────────────────────────────────────────────
warn.forEach((w) => console.warn("⚠ " + w));
if (errors.length) {
  console.error(`✖ 디자인 선언 검사 실패 (${errors.length}건)\n  ` + errors.join("\n  "));
  process.exit(1);
}
console.log(`✔ 디자인 선언 검사 통과 — 신호 ${Object.keys(signals).length} · 패널 ${Object.keys(panels).length} · 레이아웃 ${Object.keys(layouts).length}`);
