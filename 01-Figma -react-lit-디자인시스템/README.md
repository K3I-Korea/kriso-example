# @k3i/ds — Figma 디자인 시스템 → Lit 웹 컴포넌트

Figma 디자인을 **한 번만 구현**해서 React · Vue · Angular · 순수 HTML 어디서나 똑같이 쓰기 위한 패키지 골격입니다.

```
Figma (Tokens Studio)
   │  export → tokens/tokens.json (W3C DTCG 포맷)
   ▼
Style Dictionary  (scripts/build-tokens.mjs)
   │  → dist/tokens.css   (--ds-* CSS 변수, 라이트/다크)
   ▼
Lit 컴포넌트  (src/components/*.ts)   ← 디자인의 단일 진실 공급원
   │  Shadow DOM 으로 스타일 격리, 토큰만 CSS 변수로 통과
   ▼
├─ 순수 HTML / 서버 템플릿 : <ds-button>
├─ Vue / Angular / Svelte : <ds-button> 그대로
└─ React                  : @k3i/ds/react (자동 생성 래퍼)
```

## 시작하기

```bash
npm install
npm run dev      # 토큰 빌드 + 데모(index.html) 실행 → http://localhost:5173
npm run build    # dist/ 에 라이브러리 + 타입 + tokens.css 생성
```

## 폴더 구조

| 경로 | 역할 |
|---|---|
| `tokens/tokens.json` | Figma에서 내보낸 토큰 (원시 색상·간격·반경·폰트 + 시맨틱 토큰) |
| `tokens/themes/dark.json` | 다크 테마 — 시맨틱 토큰만 덮어씀 |
| `scripts/build-tokens.mjs` | Style Dictionary v4 빌드 스크립트 |
| `src/styles/shared.ts` | 공통 기본 스타일, 포커스 링 |
| `src/components/ds-button.ts` | variant 4종 · size 3종 · loading · 폼 submit/reset |
| `src/components/ds-input.ts` | label/help/error, 폼 연동(ElementInternals), 유효성 검사 |
| `src/components/ds-card.ts` | header/body/footer 슬롯, elevated |
| `src/react/index.ts` | `@lit/react` 기반 React 래퍼 |
| `examples/` | React, Vue에서 사용하는 예제 |
| `index.html` | 데모 + "전역 CSS 공격" 실험 + 폼 연동 테스트 |

## Figma 연동 워크플로

1. Figma에서 **Tokens Studio** 플러그인으로 토큰 관리 → *W3C DTCG* 포맷으로 export (또는 GitHub sync)
2. `tokens/tokens.json` 교체
3. `npm run tokens` → `dist/tokens.css` 갱신 → 모든 프레임워크 앱에 즉시 반영

토큰 이름 규칙: Figma `semantic/primary` → CSS `--ds-semantic-primary`

## 디자인을 지키는 3가지 장치

1. **Shadow DOM 격리** — 앱의 전역 CSS(`button { padding:0 !important }` 등)가 컴포넌트 내부에 닿지 않음. 데모의 "전역 CSS 공격 실험" 카드에서 확인 가능.
2. **CSS 변수만 통과** — 테마/브랜드 교체는 토큰 값만 바꾸면 됨.
   ```css
   :root[data-theme="dark"] { --ds-semantic-primary: ...; }
   ```
3. **공개된 커스터마이즈 지점만 허용** — `::part(base)`, `--ds-button-min-width` 등 컴포넌트가 문서화한 것만.
   ```css
   ds-button::part(base) { letter-spacing: .02em; }
   ```

## 앱에서 쓰기

**순수 HTML**
```html
<link rel="stylesheet" href="node_modules/@k3i/ds/dist/tokens.css" />
<script type="module">import "@k3i/ds";</script>
<ds-button variant="primary">저장</ds-button>
```

**React** — `examples/react/SignupForm.tsx` 참고
```tsx
import "@k3i/ds/tokens.css";
import { Button, Input } from "@k3i/ds/react";
<Input label="이메일" onDsInput={(e) => setEmail(e.detail.value)} />
```

**Vue** — `examples/vue/SignupForm.vue` 참고 (`isCustomElement` 설정 필요)

## 새 컴포넌트 추가 체크리스트

- [ ] Figma 컴포넌트의 variant 속성 → `@property({ reflect: true })` + `:host([attr="..."])` 스타일
- [ ] 색상/간격/폰트 값은 **반드시 `var(--ds-*)`** 로만 (하드코딩 금지)
- [ ] 바깥에서 바꿔도 되는 곳만 `part=` 또는 `--ds-<컴포넌트>-*` 로 공개, JSDoc 에 `@csspart`/`@cssprop` 명시
- [ ] 폼 컨트롤이면 `static formAssociated = true` + `attachInternals()`
- [ ] label ↔ input 처럼 aria ID 참조가 필요한 요소는 같은 Shadow Root 안에 둘 것
- [ ] 이벤트는 `bubbles: true, composed: true` 로 Shadow 경계 밖까지 전달
- [ ] `src/index.ts` export, `src/react/index.ts` 래퍼 추가

## 알아둘 한계

- **SSR**: Next.js 등에서 서버 렌더링이 필요하면 `@lit-labs/ssr` 검토 (아직 labs 단계). 클라이언트 전용이면 문제 없음.
- **React 18 이하**: 커스텀 이벤트/객체 props 전달이 불완전 → `@k3i/ds/react` 래퍼 사용. React 19+는 태그 직접 사용 가능.

## Figma 연동 실습 (Claude Code × Figma MCP)

- `CLAUDE.md` — Claude Code 가 자동으로 읽는 Figma↔코드 이름 매핑 규칙
- `figma/SETUP.md` — Figma MCP 연결 방법과 플랜별 제한
- `figma/LESSONS.md` — L1~L7 단계별 실습 프롬프트
- `figma/plugin/` — tokens.json → Figma Variables/Styles 임포터 (`npm run figma:plugin`)
- `figma/code-connect/` — Code Connect 매핑 예시
