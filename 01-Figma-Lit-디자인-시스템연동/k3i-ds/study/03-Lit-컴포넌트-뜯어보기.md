# 03. Lit 컴포넌트 뜯어보기

이 장에서는 토큰을 실제로 쓰는 컴포넌트 코드를 읽는다. `ds-button`·`ds-input`·`ds-card` 를 차례로 본 뒤, 디자인을 지켜 주는 세 가지 장치를 정리한다. 여기서 코드를 바꾸지는 않는다. 어디에 무엇이 있는지 눈에 익히는 장이다.

## 3-1. 입구 — src/index.ts

`src/index.ts` 를 연다. 이 파일을 불러오는 순간 `<ds-*>` 태그가 브라우저에 등록된다.

```ts
export { DsButton } from "./components/ds-button.js";
export { DsInput } from "./components/ds-input.js";
export { DsCard } from "./components/ds-card.js";
export { DsSwitch } from "./components/ds-switch.js";
```

00장에서 본 `index.html` 은 맨 위에서 `<script type="module" src="/src/index.ts">` 로 이 파일을 불러서 `<ds-button>` 같은 태그를 쓸 수 있었다.

## 3-2. 데코레이터와 `@customElement`

컴포넌트 파일 맨 위에 보이는 `@customElement("ds-button")`·`@property(...)` 처럼 `@이름` 으로 붙는 것이 **데코레이터(decorator)** 다. 코드를 읽기 전에 이것이 무엇인지 먼저 본다.

### 데코레이터란

- 데코레이터는 클래스나 그 멤버(속성·메서드) **바로 위**에 `@이름` 으로 붙여, 그 대상에 기능을 더하는 표식이다. 속은 함수다 — 대상을 받아 감싸거나 등록하는 일을 한다.
- 원래 코드를 고치지 않고 "이 클래스를 등록해라", "이 속성을 반응형으로 만들어라" 같은 동작을 선언하듯 얹는다.
- 자바스크립트 표준 데코레이터는 비교적 최근에 자리 잡은 언어 기능이고, Lit 은 전통적으로 **TypeScript 의 실험적 데코레이터**를 함께 지원한다. 이 프로젝트는 그 실험적 데코레이터를 켜서 쓴다. 그래서 `tsconfig.json` 에 `experimentalDecorators: true` 와 `useDefineForClassFields: false` 가 들어 있다(0-7 의 tsconfig 설명과 이어진다).

### 데코레이터는 어디서 오나

`@customElement`·`@property` 같은 데코레이터는 **Lit 이 제공한다.** `ds-button.ts` 맨 위에서 가져온다.

```ts
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
```

- `@customElement`·`@property`·`@state`·`@query` → **Lit 의 `lit/decorators.js`** 모듈에서 온다.
- `LitElement`·`html`·`css` → Lit 코어(`"lit"`)에서 온다.

다만 세 가지를 나눠 보면 더 분명하다.

| 무엇 | 누가 제공하나 |
|---|---|
| `@` 라는 데코레이터 **문법 자체** | 자바스크립트/TypeScript 언어 (Lit 이 아니다) |
| `customElement`·`property` 같은 데코레이터 **함수** | **Lit** (`lit/decorators.js`) |
| 실제 태그 등록(`customElements.define`) | **브라우저 표준**(Custom Elements) — `@customElement` 가 속으로 이걸 부른다 |

즉 `@customElement("ds-button")` 은 "Lit 이 만든 함수를, 언어의 데코레이터 문법으로 클래스에 붙여, 브라우저 표준 등록을 대신 호출"하는 것이다. 그래서 `package.json` 의 `dependencies` 에 `lit` 이 있어야 이 import 가 된다(0-7 참고).

### `@customElement("ds-button")` 의 역할

- 클래스를 **브라우저에 커스텀 엘리먼트로 등록**한다. 즉 `customElements.define("ds-button", DsButton)` 을 대신 불러 준다.
- 등록되면 그때부터 HTML 에서 `<ds-button>` 태그를 쓸 수 있고, 브라우저는 그 태그를 만나면 `DsButton` 클래스를 그 태그에 연결한다.
- 그래서 `src/index.ts` 가 이 파일을 `import` 하는 것만으로 `<ds-button>` 이 등록된다(3-1). 데코레이터가 import 되는 시점에 실행되기 때문이다.
- 태그 이름에는 반드시 붙임표(`-`)가 들어가야 한다(`ds-button`). 표준이 기본 HTML 태그와 구별하려고 그렇게 요구한다.

### Lit 에서 함께 쓰는 데코레이터

| 데코레이터 | 붙이는 곳 | 역할 |
|---|---|---|
| `@customElement("ds-button")` | 클래스 | 태그 이름으로 등록한다 |
| `@property({ reflect: true })` | 속성 | 바깥에서 바꿀 수 있는 반응형 속성. 값이 바뀌면 다시 그린다. `reflect` 면 HTML 속성으로도 내보낸다 |
| `@state()` | 속성 | 내부 전용 반응형 상태. HTML 속성으로 내보내지 않는다 |
| `@query("input")` | 속성 | Shadow DOM 안에서 `querySelector` 한 결과를 돌려주는 게터 |

"반응형(reactive)" 은 그 값이 바뀌면 Lit 이 화면을 자동으로 다시 그린다는 뜻이다.

### 데코레이터 없이도 된다 (참고)

데코레이터는 편의 문법이다. 안 쓰고도 같은 일을 할 수 있다.

```js
// @customElement 대신
customElements.define("ds-button", DsButton);

// @property 대신 static properties 사용
static properties = { variant: { reflect: true } };
```

TypeScript 와 데코레이터를 쓰지 않는 환경이면 이 방식을 쓴다. 이 프로젝트는 읽기 쉬운 데코레이터 방식을 골랐다.

## 3-3. ds-button — 속성이 곧 디자인 변형

`src/components/ds-button.ts` 를 연다. 핵심만 짚는다.

**① 속성(`@property`).** 겉에서 바꿀 수 있는 값이다. `reflect: true` 는 속성 값을 HTML 속성으로 내보낸다는 뜻이다. 그래야 CSS 가 `:host([variant="primary"])` 로 그 값을 보고 모양을 고를 수 있다.

```ts
@property({ reflect: true }) variant: ButtonVariant = "primary";  // primary|secondary|ghost|danger
@property({ reflect: true }) size: ButtonSize = "md";             // sm|md|lg
@property({ type: Boolean, reflect: true }) disabled = false;
@property({ type: Boolean, reflect: true }) loading = false;
```

**② 스타일은 토큰만 쓴다.** `static styles` 안의 값은 숫자나 색을 직접 적지 않고 전부 `var(--ds-*)` 를 쓴다. 02장에서 만든 토큰이 여기로 들어온다.

```css
button {
  gap: var(--ds-space-2, 8px);
  font: var(--ds-font-label, ...);
  border-radius: var(--ds-radius-md, 8px);
}
:host([variant="primary"]) button { background: var(--ds-semantic-primary); color: var(--ds-semantic-on-primary); }
:host([size="lg"]) button { padding: var(--ds-space-3) var(--ds-space-6); height: 48px; }
:host([disabled]) button { opacity: 0.45; cursor: not-allowed; }
```

`var(--ds-space-2, 8px)` 에서 뒤의 `8px` 은 토큰이 아직 안 실렸을 때 쓰는 대비 값이다.

**③ 폼 연동.** `static formAssociated = true` 와 `attachInternals()` 로 버튼이 바깥 `<form>` 을 알게 한다. Shadow DOM 안의 `<button>` 은 바깥 폼을 모르기 때문에, `type="submit"` 이면 `form.requestSubmit()`, `type="reset"` 이면 `form.reset()` 을 직접 불러 준다.

**④ 공개 지점.** 주석의 `@csspart base` 와 `@cssprop --ds-button-min-width` 는 "바깥에서 이만큼은 손대도 된다"고 문서에 밝힌 것이다. 바깥 앱은 `ds-button::part(base)` 나 `--ds-button-min-width` 로만 미세 조정한다.

## 3-4. ds-input — 폼과 접근성까지

`src/components/ds-input.ts` 를 연다. 버튼보다 하는 일이 많다.

- `label`·`<input>`·도움말을 **모두 같은 Shadow DOM 안에 둔다.** `<label for="input">` 과 `aria-describedby` 같은 연결이 경계를 넘지 않게 하기 위해서다.
- 값이 바뀌면 `ds-input` 이벤트를, 확정되면(blur/enter) `ds-change` 이벤트를 쏜다. 둘 다 `bubbles: true, composed: true` 라서 Shadow 경계 밖까지 전해진다.
- `ElementInternals` 로 폼과 잇는다. `setFormValue(value)` 로 FormData 에 값을 넣고, `checkValidity()` 로 검증한 뒤 틀리면 `invalid` 를 켜서 빨간 테두리와 오류 글을 보여 준다. 00장의 폼 실습에서 본 동작이 이것이다.

## 3-5. ds-card — 슬롯으로 영역을 연다

`src/components/ds-card.ts` 를 연다.

- 슬롯 세 곳을 둔다: `header`·기본(본문)·`footer`. 바깥에서 `<h2 slot="header">제목</h2>` 처럼 넣는다.
- `elevated` 속성을 켜면 테두리 대신 그림자(`--ds-shadow-card`)를 쓴다.
- `slotchange` 로 header·footer 가 비어 있으면 그 영역을 숨겨 쓸데없는 간격이 생기지 않게 한다.

## 3-6. 공통 스타일 — src/styles/shared.ts

`baseStyles` 는 모든 컴포넌트가 함께 쓰는 기본 스타일이고, `focusRing` 은 키보드 초점 테두리다. 둘 다 토큰을 쓰되 대비 값을 함께 둔다.

```css
:host { font: var(--ds-font-body, 400 14px/22px sans-serif); color: var(--ds-semantic-text, #212529); }
:focus-visible { outline: 3px solid var(--ds-semantic-focus-ring, #91a7ff); outline-offset: 2px; }
```

## 3-7. 디자인을 지키는 세 가지 장치

왜 이렇게 만드는지를 세 가지로 정리한다. 00장에서 눈으로 본 것의 이유다.

1. **Shadow DOM 격리** — 앱의 전역 CSS(`button { padding:0 !important }` 같은)가 컴포넌트 안쪽에 닿지 못한다. 00장 "전역 CSS 공격 실험" 에서 일반 요소만 모양이 망가지고 `<ds-*>` 는 그대로였던 까닭이다.
2. **CSS 변수만 통과시킨다** — 테마나 브랜드를 바꿀 때 토큰 값만 바꾸면 된다. 컴포넌트 코드는 손대지 않는다.
   ```css
   :root[data-theme="dark"] { --ds-semantic-primary: ...; }
   ```
3. **공개한 지점만 열어 둔다** — `::part(base)`, `--ds-button-min-width` 처럼 컴포넌트가 문서에 밝힌 곳만 바깥에서 손댈 수 있다.

## 따라 하기

1. `npm run dev` 로 데모를 연다.
2. `ds-button` 위에서 오른쪽 클릭 → 검사(Inspect). `#shadow-root (open)` 을 펼쳐 안쪽 `<button part="base">` 를 찾는다. 3-3 의 코드와 맞대어 본다.
3. 개발자 도구 Styles 에서 `<ds-button>` 에 `variant="ghost"` 를 직접 넣어 본다. 색이 바로 바뀌는지 본다(속성이 곧 변형이다).

## 이 장에서 한 것

- `src/index.ts` 가 태그를 등록하는 입구임을 봤다.
- 데코레이터가 무엇인지, `@customElement` 가 클래스를 `<ds-button>` 태그로 등록한다는 것을 봤다.
- `ds-button`·`ds-input`·`ds-card` 가 토큰만 쓰고, 속성으로 변형을 고르고, 폼·슬롯을 어떻게 다루는지 읽었다.
- 디자인을 지키는 세 장치(격리·변수·공개 지점)를 정리했다.

다음 **04장**에서는 이 컴포넌트와 똑같은 모양·이름으로 Figma 에 Component Set 을 그린다.
