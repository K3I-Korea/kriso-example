# Claude Code × Figma MCP 디자인 시스템 실습

각 레슨은 **① 개념 → ② Claude Code에 붙여넣을 프롬프트 → ③ 확인할 것** 순서입니다.
프롬프트의 `<FILE_URL>` 은 SETUP.md 에서 만든 `ds` 파일 주소로 바꾸세요.
Claude Code는 프로젝트 루트의 `CLAUDE.md` 를 자동으로 읽으므로, 이름 규칙은 매번 설명할 필요가 없습니다.

```
 tokens.json ──(L1)──▶ Figma Variables/Styles ──(L2·L3)──▶ Figma Components
      ▲                                                        │
      └──────(L5 역동기화)─────── get_variable_defs ◀──(L4)─────┘
                                                              │
                         Code Connect (L6) ──▶ <ds-button> 코드
```

---

## L1. 토큰 → Figma Variables (두 가지 방법 비교)

**개념**: Figma Variables = 디자인 토큰. `Primitives`(원시값) 와 `Semantic`(의미, Light/Dark 모드) 두 컬렉션으로 나누고, Semantic 은 Primitives 를 **alias** 로 참조합니다. 각 변수에 **Code syntax** 를 지정하면 Dev Mode와 MCP가 `var(--ds-...)` 이름을 알려줍니다.

### 방법 A — 플러그인 (결정적, 재현 가능)
```bash
npm run figma:plugin
```
Figma 데스크톱 → `ds` 파일 → Plugins → Development → **Import plugin from manifest** → `figma/plugin/manifest.json` → 실행.
`figma/plugin/src/main.js` 를 읽어 보세요. MCP 쓰기 도구도 내부적으로 같은 **Figma Plugin API** 를 호출합니다.

### 방법 B — Claude Code + MCP 쓰기
```
<FILE_URL> 파일에 tokens/tokens.json 과 tokens/themes/dark.json 을 Figma Variables 로 만들어줘.
CLAUDE.md 의 매핑 규칙(컬렉션 이름, 변수 이름, alias, Code syntax WEB, scopes)을 정확히 따라.
이미 있으면 새로 만들지 말고 값만 갱신해. 끝나면 생성한 변수 수를 컬렉션별로 보고해.
```

**확인**
- 우측 패널 Local variables → `Semantic/primary` 의 Light = `color/brand/600`, Dark = `color/brand/300` (alias 화살표 표시)
- 변수 편집 → Code syntax → Web = `var(--ds-semantic-primary)`
- 💡 실험: 방법 A 와 B 결과를 비교. 어느 쪽이 더 정확했나? (→ 대량·반복 작업은 스크립트, 판단이 필요한 작업은 에이전트)

---

## L2. Foundations 페이지 — 토큰을 눈으로 보는 문서

```
<FILE_URL> 의 Foundations 페이지에 디자인 토큰 문서를 그려줘.
- Color: Semantic 변수마다 스와치(48x48) + 변수 이름 + Code syntax 텍스트. Light/Dark 두 프레임 나란히, 각 프레임에 해당 변수 모드 적용
- Spacing: space/* 변수 값만큼의 가로 막대
- Radius: radius/* 를 적용한 사각형
- Typography: ds/title, ds/label, ds/body 텍스트 스타일 샘플
모든 fill, 간격, 반경은 숫자 대신 변수에 바인딩하고 Auto layout 을 써.
```

**확인**: Dark 프레임 선택 → 우측 패널 Layer 의 모드가 `Semantic: Dark` 인지. Primitives 값 하나를 바꾸면 스와치가 같이 바뀌는지.

---

## L3. 컴포넌트 만들기 — 코드 API와 같은 모양으로

**개념**: Figma Component Set 의 Variant 속성 = Lit 의 `reflect: true` 속성. 이름을 글자 그대로 맞춰야 MCP·Code Connect 가 자동으로 대응시킬 수 있습니다.

```
<FILE_URL> 의 Components 페이지에 ds-button Component Set 을 만들어줘.
src/components/ds-button.ts 의 static styles 를 읽고 시각적으로 똑같이 재현해.
- Variant 속성: variant(primary/secondary/ghost/danger) × size(sm/md/lg) × state(default/hover/disabled/loading)
- Text 속성 label, Boolean 속성 iconStart
- 높이: sm 32 / md 40 / lg 48, 패딩·반경·gap 은 Primitives 변수에 바인딩
- 색은 Semantic 변수에만 바인딩, 텍스트는 ds/label 스타일
- disabled 는 opacity 45%
CLAUDE.md 의 컴포넌트 매핑 표를 지켜.
```
이어서 `ds-input`, `ds-card` 도 같은 방식으로 (프롬프트에서 컴포넌트 이름과 파일만 바꾸기).

**확인**
- Playground 페이지에 인스턴스를 놓고 variant/size 를 바꿔 보기
- 코드 데모(`npm run dev`)와 나란히 놓고 픽셀 비교 — 다른 곳을 찾아 Claude 에게 고치게 하기

---

## L4. Figma → 코드 읽기 (MCP 읽기 도구 이해)

> 읽기 도구는 플랜에 따라 월 호출 제한이 있으니 이 레슨은 아껴서.

Figma 에서 Playground 의 ds-button 인스턴스를 선택한 상태로:
```
지금 Figma 에서 선택한 노드에 대해 get_variable_defs 와 get_design_context 를 호출해서
1) 반환된 원본 결과를 그대로 보여주고
2) 그 결과가 src/components/ds-button.ts 와 어떻게 대응되는지 표로 설명해줘.
코드는 수정하지 마.
```

**확인할 개념**
- `get_variable_defs` 가 변수 이름 대신 **Code syntax(`var(--ds-...)`)** 를 돌려주는가 → L1 의 Code syntax 설정 효과
- `get_design_context` 는 기본으로 React+Tailwind 를 생성 → CLAUDE.md 규칙 덕분에 Lit 로 변환되는가

---

## L5. 역동기화 — Figma 에서 바꾼 값을 코드로

1. Figma 에서 `Primitives/color/brand/600` 을 `#5f3dc4` 로 변경
2. Claude Code:
```
<FILE_URL> 의 Figma Variables 를 읽어서 tokens/tokens.json 과 다른 값을 찾아 diff 로 보여줘.
확인 후 tokens.json 을 갱신하고 npm run tokens 를 실행해.
```
3. `npm run dev` → 데모 버튼 색이 바뀌었는지 확인

반대 방향(코드 → Figma)은 `tokens.json` 수정 → `npm run figma:plugin` → 플러그인 재실행 (또는 L1 방법 B 프롬프트 재사용).

💡 생각해 볼 것: 양쪽에서 동시에 수정하면? → 팀 규칙으로 "토큰 값의 진실 공급원은 하나" 를 정해야 하는 이유.

---

## L6. Code Connect — Figma 컴포넌트에 "진짜 코드" 연결

**개념**: Code Connect 가 없으면 MCP 는 디자인을 보고 코드를 *추측*합니다. 연결하면 `<ds-button variant="primary">` 처럼 **이미 있는 컴포넌트 사용 코드**를 돌려줍니다.

```
figma/code-connect/ds-button.figma.ts 의 URL 을 <FILE_URL> 의 ds-button Component Set 노드 링크로 바꾸고,
Figma 속성 이름과 enum 값이 실제 컴포넌트와 일치하는지 MCP 로 확인해서 고쳐줘.
같은 형식으로 ds-input, ds-card 용 파일도 만들어줘.
```
```bash
npm i -D @figma/code-connect
npx figma connect publish --token <FIGMA_ACCESS_TOKEN>   # Organization/Enterprise 필요
```

**확인**: Dev Mode 에서 ds-button 선택 → Code 패널에 `<ds-button ...>` 표시. L4 프롬프트를 다시 실행해 결과 비교.

---

## L7. 응용 — 화면 하나를 두 방향으로

**(a) Figma → 코드**
```
<FILE_URL> 의 Playground 에 회원가입 카드 화면을 ds-card, ds-input, ds-button 인스턴스만으로 디자인해줘.
그다음 그 화면을 읽어서 demo/signup.html 로 구현해. 새 CSS 는 레이아웃용만 허용.
```

**(b) 코드 → Figma**
```
index.html 데모 페이지를 Figma Playground 에 편집 가능한 레이어로 옮겨줘.
가능하면 일반 레이어가 아니라 ds-* 컴포넌트 인스턴스로 대체해.
```

**정리 질문**
- 어느 방향이 디자인을 더 잘 보존했나? 이유는?
- 하드코딩 값이 생긴 곳은 어디였고, CLAUDE.md 에 어떤 규칙을 추가하면 막을 수 있나? → 직접 CLAUDE.md 를 개선해 보기
