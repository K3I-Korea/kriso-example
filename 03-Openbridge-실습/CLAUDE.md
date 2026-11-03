# CLAUDE.md — KASS 디자인 시스템 (OpenBridge × K3I)

이 저장소의 목표: **자연어 요청으로 디자인 시스템을 바꾸고, 그 변경이 Figma 와 프론트엔드에 함께 반영되게 한다.**
Claude Code 는 매 세션 이 파일을 읽는다. 아래 규칙을 지키면 자연어 변경이 안전하게 끝까지 흘러간다.

## 1. 먼저 판단할 것 — "이 요청은 어느 층인가?"

6계층 디자인 시스템 (발표자료 36장). **각 층은 바로 아래 층만 쓴다.**

| 층 | 무엇 | 바꾸는 곳 (자연어 요청 대부분은 여기서 끝남) | 코드 수정 필요? |
|---|---|---|---|
| View | 화면 = 레이아웃 + 슬롯별 패널 + 신호 연결 | `design/views/*.json` | 아니오 |
| Layout | 슬롯 자리 (grid areas) | `design/layouts.json` | 아니오 |
| Block | 패널 종류 / 상태 표현 규칙 | `design/panels.json`, `design/states.json` | 새 패널·새 형태일 때만 |
| Instrument | 계기 (나침반, 타각계, 수치) | OpenBridge 제공 — **수정 금지**, 조합만 | 새 패널 클래스에서 import |
| Primitive | 버튼·토글·배지 | OpenBridge 제공 — **수정 금지** | — |
| Token | 색·간격·글꼴 | `design/tokens.json` (OpenBridge 변수 alias) | 아니오 |
| (데이터) | 신호 카탈로그·임계값·ttl | `design/signals.json` | 아니오 |

요청 예 → 대상 파일
- "야간에 경보색을 더 어둡게" → `tokens.json` 의 `color.alarm.palettes.night`
- "stale 문구를 '갱신 끊김'으로", "manual 을 stale 보다 먼저 보여줘" → `states.json`
- "배기온도 경보를 450도로" → `signals.json` limits
- "개요 화면 오른쪽에 칸 하나 더" → `layouts.json` + `views/overview.json`
- "연료 소모량 패널 추가" → `signals.json` 신호 추가 + `views/*.json` 슬롯 연결
- "추진기 방위 계기 패널 새로 만들기" → 새 Block (아래 4절)

## 2. 변경 절차 (반드시 이 순서)

1. 요청을 위 표로 분류하고, **어떤 파일의 어떤 키를 바꿀지 먼저 한 줄로 말한다**
2. `design/` JSON 수정 (코드보다 선언 우선)
3. `npm run check` — 실패하면 오류 메시지대로 고치고 다시 실행 (통과할 때까지)
4. `npm run tokens` (tokens.json 을 건드렸다면)
5. `npm run typecheck`
6. 화면 확인: `npm run dev` 상태에서 해당 화면 스크린샷 (가능하면 4개 팔레트 중 day·night 둘 다)
7. Figma 동기화 (Figma MCP 연결 시) — 아래 3절
8. 무엇을 바꿨는지 파일·키 단위로 요약

## 3. Figma 동기화 규칙

- Figma 파일 URL 은 `design/figma.json` 에 있다. 비어 있으면 사용자에게 요청한다 (추측 금지).
- 이름은 `design/figma.json` 의 `naming` 을 따른다. 핵심 대응:

| 코드/선언 | Figma |
|---|---|
| `tokens.json` color.X | Variables 컬렉션 `K3I` / `color/X`, Code syntax(WEB) `var(--k3i-color-X)`, 값은 OpenBridge 라이브러리 변수 alias |
| `states.json` 6개 상태 | 각 패널 Component Set 의 variant 속성 `state` = normal·degraded·stale·invalid·alarm·manual |
| `panels.json` 키 | Component Set `k3i-{panel}-panel` |
| `layouts.json` 키 / areas | 프레임 `layout/{layout}`, 그 안의 슬롯 프레임 이름 = area 이름 |
| `views/{id}.json` | 프레임 `view/{id}` — 레이아웃 인스턴스 + 슬롯마다 패널 인스턴스 |

- 방향: **선언(JSON)이 진실 공급원.** Figma 에서 디자이너가 바꾼 경우에는 "Figma → JSON 반영" 요청으로 처리하고, JSON 이 갱신된 뒤 다시 Figma 로 내보낸다.
- OpenBridge 라이브러리 원본 컴포넌트는 수정하지 않는다. 인스턴스를 쓰고, 필요하면 K3I 컴포넌트로 감싼다.

## 4. 코드를 바꿔야 하는 경우 (드묾)

### 새 패널 종류 (Block)
1. `src/ds/k3i-<name>-panel.ts` — `K3iPanel` 상속, `renderBody()` 만 구현, OpenBridge 계기는 `@oicl/openbridge-webcomponents/dist/...` 에서 import
2. `src/ds/index.ts` export, `src/ds/react.ts` 래퍼 추가
3. `design/panels.json` 에 `tag`, `roles` 추가
4. `src/view/registry.tsx` 에 렌더 함수 등록 (roles → props)
5. Figma 에 `k3i-<name>-panel` Component Set (state variant 6개)

### 새 상태 형태 (shape)
`src/ds/base/k3i-panel.ts` CSS 에 `:host([shape="..."])` 추가 → `scripts/validate.mjs` 의 `SHAPES` 에 등록 → `states.json` 에서 사용

## 5. 금지

- 컴포넌트·CSS 에 색 리터럴(#hex, rgb()) 금지. 반드시 `var(--k3i-*)`. OpenBridge 변수를 패널에서 직접 쓰지 말 것(토큰 층을 거칠 것)
- 패널이 상태를 판단하는 코드 금지 — 상태는 `src/domain/signal.ts` 에서만 결정
- `node_modules/@oicl/*` 수정 금지
- `npm run check` 실패 상태로 작업 종료 금지

## 6. 참고

- OpenBridge 변수 조회: `npm run ob:vars -- <접두어>` (예: `-- alert-alarm`)
- OpenBridge 컴포넌트 API: `node_modules/@oicl/openbridge-webcomponents/custom-elements.json`
- OpenBridge 2.x 라이선스: 릴리스 후 6개월 AGPL-3.0, 이후 Apache-2.0 (후원사는 즉시 상용 라이선스). 과제 산출물 배포 전 확인.
