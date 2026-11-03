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

---

## L8. 상태 — Figma variant ↔ Lit 속성 ↔ React state

**개념**: 같은 "상태"가 세 곳에서 다른 이름으로 존재합니다. 이 셋을 1:1로 맞추는 것이 디자인 시스템 연동의 핵심입니다.

| 층 | 표현 | 예 (자율운항 스위치) |
|---|---|---|
| Figma | Component Set 의 **variant** | `checked=true, state=default` |
| Lit | `@property({ reflect: true })` → **HTML 속성** | `<ds-switch checked>` |
| React | **state** → props 로 전달 | `const [autopilot, setAutopilot] = useState(false)` |

상태의 소유자는 하나입니다. 이 실습에서는 **React 가 소유**하고, Lit 은 그리기와 사용자 입력 전달만 합니다.

```
React state ──props──▶ Lit @property ──reflect──▶ HTML 속성 ──(규칙)──▶ Figma variant
     ▲                      │
     └── ds-change 이벤트 ◀──┘  (React 가 preventDefault 하면 Lit 이 되돌림)
```

### 8-1. 코드에서 먼저 관찰하기
```bash
npm run dev   # → http://localhost:5173/demo/react.html
```
- 오른쪽 **②③ 표**: 왼쪽을 조작할 때마다 DOM 속성과 대응되는 Figma variant 가 실시간으로 바뀝니다.
- **원격 잠금**을 켜고 자율운항 스위치를 눌러 보세요. Lit 이 먼저 토글 → `ds-change` 발생 → React 가 `preventDefault()` → Lit 이 원래 값으로 복구. (`ds-switch.ts` 의 `toggle()` 참고)
- 스위치를 누르고 있는 동안 thumb 이 늘어납니다 = `@state pressed`. **②표에는 나타나지 않습니다** → 내부 상태는 DOM 속성으로 노출되지 않기 때문.

### 8-2. Figma 에 ds-switch 만들기
```
<FILE_URL> 의 Components 페이지에 ds-switch Component Set 을 만들어줘.
src/components/ds-switch.ts 의 static styles 를 읽고 그대로 재현해.
- variant: checked(false/true) × state(default/pressed/disabled) = 6개
- Text 속성 label
- pressed 는 thumb 너비 24px, disabled 는 opacity 45%
- 색은 Semantic 변수에만 바인딩 (꺼짐 트랙 = border, 켜짐 트랙 = primary)
CLAUDE.md 매핑 표를 따르고, 다 만들면 6개 variant 이름을 나열해.
```

### 8-3. 상태 화면을 Figma 에 "스냅샷"으로 그리기
```
demo/state-lab.tsx 를 읽고, 자율운항 제어 패널이 가질 수 있는 화면 상태를 정리해줘
(예: 꺼짐 / 켜짐·입력 정상 / 켜짐·입력 오류 / 적용 중 / 잠금으로 거부됨).
그다음 <FILE_URL> 의 Playground 에 상태별 프레임을 나란히 그려줘.
각 프레임은 ds-card, ds-switch, ds-input, ds-button 인스턴스만 쓰고,
toFigma 매핑 함수와 똑같은 variant 를 골라서 설정해. 프레임 이름은 상태 이름으로.
```
→ 디자이너와 개발자가 **"이 상태에선 이렇게 보인다"** 를 같은 그림으로 합의하는 산출물이 됩니다.

### 8-4. 역방향: Figma 에서 상태 추가 → 코드 반영
1. Figma 에서 ds-button 에 `state=success` variant 를 직접 추가 (초록 배경, 체크 아이콘)
2. Claude Code:
```
Figma 의 ds-button Component Set 을 읽어서 코드에 없는 variant 를 찾아줘.
있으면 ds-button.ts 에 해당 @property 와 스타일을 추가하고,
demo/state-lab.tsx 의 toFigma 매핑과 "적용 완료" 후 1초간 success 상태를 보여주는 로직을 추가해.
색은 tokens.json 에 semantic.success 토큰을 먼저 만들고 그걸 써.
```
→ 토큰(L1) · 컴포넌트(L3) · 상태(L8) 가 한 번에 연결되는 것을 확인.

**정리 질문**
- `pressed` 를 React 가 제어하게 하면 무엇이 나빠질까? (힌트: 매 포인터 이벤트마다 React 리렌더)
- Code Connect 에 `pressed` 를 매핑하지 않은 이유는?
- 잠금 거부를 Lit 이 아니라 React 쪽에서만 처리하면(`checked` 를 안 바꾸기만 하면) 어떤 문제가 생길까? → `toggle()` 에서 `dispatchEvent` 반환값 검사를 지우고 실험해 보기
