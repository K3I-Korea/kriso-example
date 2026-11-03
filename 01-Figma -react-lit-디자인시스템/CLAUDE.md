# CLAUDE.md — @k3i/ds 프로젝트 규칙 (Claude Code가 매 세션 읽음)

이 저장소는 **Figma 디자인 시스템 ↔ 코드(Lit 웹 컴포넌트)** 를 동기화하는 학습/실무용 프로젝트다.
Figma MCP 서버(`figma`)가 연결되어 있다고 가정한다.

## 단일 진실 공급원 (Source of Truth)

| 대상 | 진실 공급원 | 동기화 방향 |
|---|---|---|
| 토큰 값 (색·간격·반경·폰트) | `tokens/tokens.json` | JSON ⇄ Figma Variables (양방향, 변경 시 둘 다 갱신) |
| 컴포넌트 시각 디자인 | Figma | Figma → `src/components/*.ts` |
| 컴포넌트 API (props/slots) | 아래 매핑 표 | 둘 다 이 표를 따른다 |

## 이름 매핑 규칙 (반드시 지킬 것)

### 토큰 ↔ Figma Variables ↔ CSS
| tokens.json 경로 | Figma 컬렉션 / 변수 이름 | CSS 변수 |
|---|---|---|
| `color.brand.600` | `Primitives` / `color/brand/600` | `--ds-color-brand-600` |
| `space.4` | `Primitives` / `space/4` | `--ds-space-4` |
| `radius.md` | `Primitives` / `radius/md` | `--ds-radius-md` |
| `semantic.primary` | `Semantic` / `primary` (모드: Light, Dark) | `--ds-semantic-primary` |

- 시맨틱 변수는 **반드시 Primitives 변수의 alias** 로 만든다 (HEX 직접 입력 금지).
- 모든 Figma 변수에는 **Code syntax (WEB)** 를 `var(--ds-...)` 로 지정한다. → MCP `get_variable_defs` 가 이 이름을 돌려주므로 코드 생성 시 그대로 사용.
- 폰트 합성 토큰(`font.label` 등)은 Figma **Text Style** `ds/label`, `ds/body`, `ds/title` 로 만든다.
- 그림자(`shadow.card`)는 Figma **Effect Style** `ds/shadow-card` 로 만든다.

### 컴포넌트 ↔ Figma Component Properties
Figma 속성 이름·값은 **코드의 attribute 이름·값과 글자 그대로 일치**시킨다 (대소문자 포함).

| Lit 컴포넌트 | Figma Component Set | Variant 속성 | 기타 속성 |
|---|---|---|---|
| `<ds-button>` | `ds-button` | `variant`: primary·secondary·ghost·danger / `size`: sm·md·lg / `state`: default·hover·disabled·loading | Text `label`, Boolean `iconStart` |
| `<ds-input>` | `ds-input` | `state`: default·focus·invalid·disabled | Text `label`, `placeholder`, `helpText`, Boolean `required` |
| `<ds-card>` | `ds-card` | `elevated`: false·true | Slot 영역은 Auto layout 프레임 `header`/`body`/`footer` |

- 모든 레이아웃은 **Auto layout** + 간격/패딩/반경은 **변수 바인딩** (숫자 직접 입력 금지).
- 색상 fill/stroke 는 **Semantic 변수만** 바인딩 (Primitives 직접 바인딩 금지).

## 코드 생성 규칙 (Figma → 코드)

- `get_design_context` 는 기본적으로 React+Tailwind 를 돌려주지만, 이 프로젝트에서는 **Lit + `css` 템플릿**으로 변환한다.
- 하드코딩된 HEX/px 금지. 반드시 `var(--ds-*)` 사용. 매핑을 모르면 `get_variable_defs` 로 확인.
- 새 컴포넌트는 `src/components/ds-<name>.ts`, `src/index.ts` export, `src/react/index.ts` 래퍼 추가.
- 기존 컴포넌트(`ds-button`, `ds-input`, `ds-card`)가 있으면 새로 만들지 말고 재사용.

## 자주 쓰는 명령

```bash
npm run tokens   # tokens.json → src/styles/tokens.css
npm run figma:plugin  # tokens.json → figma/plugin/code.js (Figma 변수 임포터 플러그인)
npm run dev      # 데모 http://localhost:5173
```
