# 02. 토큰 — 코드와 Figma 를 양방향으로 잇기

이 장에서는 디자인 값(토큰)을 다룬다. 먼저 `tokens.json` 이 어떻게 생겼는지 읽고, `npm run tokens` 가 그걸 CSS 로 바꾸는 과정을 본다. 그다음 같은 토큰을 Figma 에 올리고, 반대로 Figma 에서 바꾼 값을 코드로 되읽는다.

## 2-1. tokens.json — 디자인 값의 단일 공급원

편집기로 `tokens/tokens.json` 을 연다. 크게 네 묶음이다.

**① 원시 색(Primitives).** 실제 색 값을 이름으로 정해 둔다.

```json
"color": {
  "brand": { "600": { "$value": "#3b5bdb" }, ... },
  "gray":  { "0": { "$value": "#ffffff" }, "900": { "$value": "#121417" }, ... },
  "red":   { "500": { "$value": "#e03131" } }
}
```

**② 의미 색(Semantic).** 원시 색을 직접 쓰지 않고, "쓰임"에 이름을 붙여 원시 색을 **가리킨다.** `{color.brand.600}` 처럼 중괄호로 가리키는 것을 별칭(alias)이라고 한다.

```json
"semantic": {
  "primary":    { "$value": "{color.brand.600}" },
  "on-primary": { "$value": "{color.gray.0}" },
  "surface":    { "$value": "{color.gray.0}" },
  "text":       { "$value": "{color.gray.800}" },
  "danger":     { "$value": "{color.red.500}" }, ...
}
```

이렇게 "의미" 이름을 한 단계 거치는 까닭은, 버튼은 `primary` 라는 "쓰임"만 알면 되고 그게 실제로 어떤 색인지는 `primary` 가 가리키는 값만 바꾸면 전부 따라오기 때문이다. 00장에서 `brand.600` 하나를 바꿔 버튼 색이 바뀐 것이 이 구조다.

**③ 치수(space·radius).** 간격과 반경이다.

```json
"space":  { "1": {"$value":"4px"}, "4": {"$value":"16px"}, "6": {"$value":"24px"} },
"radius": { "sm": {"$value":"4px"}, "md": {"$value":"8px"}, "lg": {"$value":"12px"} }
```

**④ 글꼴·그림자.** `font.label`·`font.body`·`font.title` 은 굵기·크기·줄높이·글꼴을 한 줄로 묶은 값이고, `shadow.card` 는 카드 그림자다.

### 다크 테마는 색만 덮어쓴다

`tokens/themes/dark.json` 을 연다. 여기에는 `semantic` 색만 들어 있고, 원시 색 중 어두운 쪽을 가리킨다(예: `primary` 가 `{color.brand.300}`). 다크 테마는 원시 색·치수·글꼴을 다시 적지 않고 **의미 색만 다른 원시 색으로 바꿔 가리킨다.**

## 2-2. npm run tokens — JSON 을 CSS 로

```bash
npm run tokens
```

이 명령은 `scripts/build-tokens.mjs` 를 돌린다(Style Dictionary 사용). 하는 일은 셋이다.

1. `tokens/tokens.json` → `src/styles/tokens.light.css` : 모든 토큰을 `:root { --ds-* }` 로 출력한다.
2. `tokens/themes/dark.json` → `src/styles/tokens.dark.css` : 다크에서 덮어쓸 색만 `:root[data-theme="dark"], .ds-theme-dark { ... }` 로 출력한다.
3. 둘을 합쳐 `src/styles/tokens.css` 와 `dist/tokens.css` 로 쓴다. 앱은 이 합친 파일 하나만 불러 쓰면 된다.

**이름 규칙**: `tokens.json` 의 `semantic.primary` → CSS 변수 `--ds-semantic-primary`. 점(`.`)이 붙임표(`-`)로 바뀌고 앞에 `--ds-` 가 붙는다.

**확인**: `npm run tokens` 를 돌린 뒤 `src/styles/tokens.css` 를 연다. `:root` 묶음에서 `--ds-semantic-primary` 를 찾고, 아래쪽 `:root[data-theme="dark"]` 묶음에서 같은 변수가 다른 값으로 적혀 있는지 본다. 00장에서 "다크 테마 전환" 버튼이 바꾼 것이 바로 이 두 번째 묶음을 켜는 것이었다.

## 2-3. 토큰을 Figma 에 올리기 — 플러그인

이제 같은 토큰을 Figma `ds` 파일의 변수로 만든다. 읽기 도구를 쓰지 않으므로 플랜 제한에 걸리지 않는다.

```bash
npm run figma:plugin
```

이 명령은 `tokens.json` 과 `dark.json` 을 `figma/plugin/src/main.js` 앞에 박아 넣어 `figma/plugin/code.js` 를 만든다(`scripts/build-figma-plugin.mjs`). 이제 Figma 에서 실행한다.

1. **Figma 데스크톱 앱**에서 `ds` 파일을 연다.
2. 메뉴 Plugins → Development → **Import plugin from manifest** 를 고른다.
3. `figma/plugin/manifest.json` 을 선택한다.
4. 다시 Plugins → Development → **ds Token Importer** 를 실행한다.

끝나면 플러그인이 "Primitives n · Semantic n · Text n · Effect n 생성/갱신" 같은 메시지를 띄운다. 이 플러그인은 **다시 실행해도 안전하다.** 같은 이름의 컬렉션·변수·스타일이 있으면 새로 만들지 않고 값만 갱신한다. 그래서 `tokens.json` 을 고치고 다시 돌리면 그대로 동기화된다.

플러그인이 만드는 것:

| 만드는 것 | 내용 |
|---|---|
| `Primitives` 컬렉션 | 원시 색·간격·반경 변수. 각 변수에 Code syntax(WEB) = `var(--ds-...)` 지정 |
| `Semantic` 컬렉션 | Light/Dark 두 모드. 각 변수는 Primitives 변수를 **별칭으로** 가리킴 |
| Text 스타일 `ds/label`·`ds/body`·`ds/title` | 글꼴 토큰에서 생성 |
| Effect 스타일 `ds/shadow-card` | 그림자 토큰에서 생성 |

### 플러그인 대신 Claude Code 로 올리려면

Claude Code 에게 맡길 수도 있다(01장에서 연결한 MCP 쓰기 도구를 쓴다). `<FILE_URL>` 은 01장에서 만든 `ds` 파일 주소다.

```
<FILE_URL> 파일에 tokens/tokens.json 과 tokens/themes/dark.json 을 Figma Variables 로 만들어줘.
CLAUDE.md 의 매핑 규칙(컬렉션 이름, 변수 이름, alias, Code syntax WEB, scopes)을 정확히 따라.
이미 있으면 새로 만들지 말고 값만 갱신해. 끝나면 생성한 변수 수를 컬렉션별로 보고해.
```

플러그인은 정해진 대로 똑같이 만들어 재현하기 좋고, Claude Code 는 상황을 보고 판단해야 하는 일에 맞는다. 둘의 결과를 비교해 보면 차이를 알 수 있다.

**확인**: Figma 오른쪽 패널 Local variables 에서 `Semantic/primary` 를 연다. Light 모드는 `color/brand/600` 을, Dark 모드는 `color/brand/300` 을 가리키는 별칭 화살표가 보여야 한다. 변수 편집 → Code syntax → Web 이 `var(--ds-semantic-primary)` 인지 본다.

## 2-4. 반대 방향 — Figma 에서 바꾼 값을 코드로

디자이너가 Figma 에서 색을 바꿨다고 하자. 그 값을 코드로 되읽는다.

1. Figma 에서 `Primitives / color/brand/600` 을 다른 색(예: `#5f3dc4`)으로 바꾼다.
2. Claude Code 에게:

```
<FILE_URL> 의 Figma Variables 를 읽어서 tokens/tokens.json 과 다른 값을 찾아 diff 로 보여줘.
확인 후 tokens.json 을 갱신하고 npm run tokens 를 실행해.
```

3. `npm run dev` 로 데모를 열어 버튼 색이 바뀌었는지 본다.

여기서 중요한 규칙 하나. **토큰 값의 단일 공급원은 하나로 정한다.** 코드와 Figma 양쪽에서 동시에 고치면 어느 쪽이 맞는지 알 수 없다. 팀에서 "토큰의 진실 공급원은 `tokens.json` 이다" 또는 "Figma 다" 중 하나로 정하고, 반대쪽은 거기서 받아 가기만 하게 한다.

## 이 장에서 한 것

- `tokens.json` 의 네 묶음(원시 색·의미 색·치수·글꼴/그림자)과 별칭 구조를 읽었다.
- `npm run tokens` 가 JSON 을 `tokens.css` 로 바꾸는 과정을 확인했다.
- 플러그인(또는 Claude Code)으로 토큰을 Figma 변수로 올렸다.
- Figma → 코드 되읽기와 "단일 공급원" 규칙을 봤다.

다음 **03장**에서는 그 토큰을 실제로 쓰는 Lit 컴포넌트 코드를 뜯어본다.
