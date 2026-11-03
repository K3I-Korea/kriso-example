// =====================================================================
// ds Token Importer — tokens.json 을 Figma Variables / Styles 로 생성
// ---------------------------------------------------------------------
// 이 파일은 "TOKENS" 상수가 앞에 붙어 code.js 로 빌드된다.
//   npm run figma:plugin
// Figma 데스크톱 > Plugins > Development > Import plugin from manifest
//   → figma/plugin/manifest.json 선택 → 실행
//
// 다시 실행해도 안전(idempotent): 같은 이름의 컬렉션/변수/스타일이 있으면
// 새로 만들지 않고 값만 갱신한다.  → tokens.json 수정 후 재실행 = 동기화
// =====================================================================

const PREFIX = "ds";
const FALLBACK_FONT = "Inter"; // Pretendard 가 Figma 에 없을 때 사용

// ---------- 유틸 ----------
function hexToRgba(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a };
}

/** "{color.brand.600}" → "color.brand.600" */
function refPath(value) {
  const m = typeof value === "string" && value.match(/^\{([^}]+)\}$/);
  return m ? m[1] : null;
}

/** DTCG 트리를 평탄화: [{ path:["color","brand","600"], type, value }] ($type 상속) */
function flatten(node, path = [], inheritedType) {
  const type = node.$type || inheritedType;
  if ("$value" in node) return [{ path, type, value: node.$value }];
  return Object.entries(node)
    .filter(([k]) => !k.startsWith("$"))
    .flatMap(([k, child]) => flatten(child, [...path, k], type));
}

function getByPath(obj, dotted) {
  return dotted.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

/** 참조를 끝까지 풀어 실제 값으로 (텍스트 스타일 생성용) */
function resolveValue(value) {
  return value.replace(/\{([^}]+)\}/g, (_, p) => resolveValue(getByPath(TOKENS.base, p).$value));
}

const cssVar = (path) => `var(--${PREFIX}-${path.join("-")})`;

// ---------- 컬렉션 / 변수 헬퍼 ----------
async function getOrCreateCollection(name) {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  return all.find((c) => c.name === name) || figma.variables.createVariableCollection(name);
}

async function getOrCreateVariable(name, collection, type) {
  const all = await figma.variables.getLocalVariablesAsync(type);
  const found = all.find((v) => v.name === name && v.variableCollectionId === collection.id);
  return found || figma.variables.createVariable(name, collection, type);
}

function ensureMode(collection, name, index) {
  const existing = collection.modes.find((m) => m.name === name);
  if (existing) return existing.modeId;
  if (index === 0) {
    collection.renameMode(collection.modes[0].modeId, name);
    return collection.modes[0].modeId;
  }
  return collection.addMode(name);
}

const SCOPES = {
  color: ["ALL_FILLS", "STROKE_COLOR", "EFFECT_COLOR"],
  space: ["GAP", "WIDTH_HEIGHT"],
  radius: ["CORNER_RADIUS"],
};

// ---------- 1) Primitives ----------
async function buildPrimitives() {
  const col = await getOrCreateCollection("Primitives");
  const modeId = ensureMode(col, "Value", 0);
  const byPath = {}; // "color.brand.600" → Variable

  for (const t of flatten(TOKENS.base)) {
    const group = t.path[0];
    if (group === "semantic" || group === "font" || group === "shadow") continue;

    const isColor = t.type === "color";
    const v = await getOrCreateVariable(t.path.join("/"), col, isColor ? "COLOR" : "FLOAT");
    v.setValueForMode(modeId, isColor ? hexToRgba(t.value) : parseFloat(t.value));
    v.setVariableCodeSyntax("WEB", cssVar(t.path));
    if (SCOPES[group]) v.scopes = SCOPES[group];
    byPath[t.path.join(".")] = v;
  }
  return byPath;
}

// ---------- 2) Semantic (Light / Dark, alias) ----------
async function buildSemantic(primitives) {
  const col = await getOrCreateCollection("Semantic");
  const light = ensureMode(col, "Light", 0);
  const dark = ensureMode(col, "Dark", 1);

  const darkMap = Object.fromEntries(
    flatten(TOKENS.dark).map((t) => [t.path.join("."), t.value])
  );
  let count = 0;

  for (const t of flatten(TOKENS.base.semantic, ["semantic"], "color")) {
    const key = t.path.join(".");
    const name = t.path.slice(1).join("/"); // semantic.primary → "primary"
    const v = await getOrCreateVariable(name, col, "COLOR");

    for (const [modeId, raw] of [[light, t.value], [dark, darkMap[key] ?? t.value]]) {
      const target = primitives[refPath(raw)];
      if (!target) throw new Error(`참조를 찾을 수 없음: ${key} → ${raw}`);
      v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
    }
    v.setVariableCodeSyntax("WEB", cssVar(t.path));
    v.scopes = SCOPES.color;
    count++;
  }
  return count;
}

// ---------- 3) Text styles ----------
const WEIGHT_STYLE = { 400: "Regular", 500: "Medium", 600: "Semi Bold", 700: "Bold" };

async function loadFontSafe(families, style) {
  for (const family of families) {
    try {
      await figma.loadFontAsync({ family, style });
      return { family, style };
    } catch (_) {
      /* 다음 후보 */
    }
  }
  throw new Error(`폰트를 불러올 수 없음: ${families.join(", ")} ${style}`);
}

async function buildTextStyles() {
  const existing = await figma.getLocalTextStylesAsync();
  const fontTokens = Object.entries(TOKENS.base.font).filter(([k]) => k !== "family");

  for (const [name, token] of fontTokens) {
    // "600 14px/20px Pretendard, ..." 파싱
    const m = resolveValue(token.$value).match(/^(\d{3})\s+(\d+)px\/(\d+)px\s+(.+)$/);
    if (!m) continue;
    const [, weight, size, lh, families] = m;
    const first = families.split(",")[0].trim().replace(/['"]/g, "");
    const fontName = await loadFontSafe([first, FALLBACK_FONT], WEIGHT_STYLE[weight] || "Regular");

    const styleName = `${PREFIX}/${name}`;
    const s = existing.find((x) => x.name === styleName) || figma.createTextStyle();
    s.name = styleName;
    s.fontName = fontName;
    s.fontSize = Number(size);
    s.lineHeight = { unit: "PIXELS", value: Number(lh) };
    s.description = `CSS: var(--${PREFIX}-font-${name})`;
  }
  return fontTokens.length;
}

// ---------- 4) Effect styles (box-shadow 파싱) ----------
function parseShadows(css) {
  // "0 1px 3px rgba(0,0,0,.08), 0 4px 12px rgba(0,0,0,.06)"
  return css.split(/,(?![^(]*\))/).map((part) => {
    const m = part.trim().match(/^(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(\d+)(?:px)?(?:\s+(-?\d+)(?:px)?)?\s+rgba?\(([^)]+)\)$/);
    if (!m) throw new Error(`그림자 파싱 실패: ${part}`);
    const [r, g, b, a = "1"] = m[5].split(",").map((x) => x.trim());
    return {
      type: "DROP_SHADOW",
      color: { r: r / 255, g: g / 255, b: b / 255, a: parseFloat(a) },
      offset: { x: Number(m[1]), y: Number(m[2]) },
      radius: Number(m[3]),
      spread: Number(m[4] || 0),
      visible: true,
      blendMode: "NORMAL",
    };
  });
}

async function buildEffectStyles() {
  const existing = await figma.getLocalEffectStylesAsync();
  const entries = Object.entries(TOKENS.base.shadow || {}).filter(([k]) => !k.startsWith("$"));
  for (const [name, token] of entries) {
    const styleName = `${PREFIX}/shadow-${name}`;
    const s = existing.find((x) => x.name === styleName) || figma.createEffectStyle();
    s.name = styleName;
    s.effects = parseShadows(token.$value);
    s.description = `CSS: var(--${PREFIX}-shadow-${name})`;
  }
  return entries.length;
}

// ---------- 실행 ----------
(async () => {
  try {
    const prim = await buildPrimitives();
    const sem = await buildSemantic(prim);
    const txt = await buildTextStyles();
    const fx = await buildEffectStyles();
    figma.closePlugin(
      `✅ Primitives ${Object.keys(prim).length} · Semantic ${sem} · Text ${txt} · Effect ${fx} 생성/갱신`
    );
  } catch (e) {
    figma.closePlugin(`❌ ${e.message}`);
  }
})();
