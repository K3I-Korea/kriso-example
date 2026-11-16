# 07. 자연어로 바꾸기와 Figma 동기화

앞 장들을 하나로 묶는다. 자연어 요청이 들어오면 Claude Code 는 "어느 층인가" 를 판단해 해당 선언 파일을 고치고, 검사를 통과시킨 뒤, Figma 까지 맞춘다. 이 장에서는 요청이 실제로 어느 파일로 흘러가는지와 Figma 동기화 규칙을 본다.

## 7-1. 요청 → 바꿀 파일

Claude Code 는 `CLAUDE.md` 의 6계층 표로 요청을 분류한다. 대부분의 요청은 코드 수정 없이 선언 하나로 끝난다.

| 자연어 요청 | 바꾸는 파일 |
|---|---|
| "야간에 경보색을 더 어둡게" | `design/tokens.json` 의 `color.alarm` (팔레트 `night` 덮어쓰기) |
| "stale 문구를 '갱신 끊김'으로", "manual 을 stale 보다 먼저 보여줘" | `design/states.json` |
| "배기온도 경보를 450도로" | `design/signals.json` 의 `limits` |
| "개요 화면 오른쪽에 칸 하나 더" | `design/layouts.json` + `design/views/overview.json` |
| "연료 소모량 패널 추가" | `design/signals.json` 신호 추가 + `design/views/*.json` 슬롯 연결 |
| "추진기 방위 계기 패널 새로 만들기" | 새 Block (04장의 다섯 단계) |

핵심 원리는 하나다: **바뀔 수 있는 것은 전부 선언(JSON)으로 빼고, 코드는 선언을 읽기만 한다.** 그래서 자연어 변경이 JSON 편집이 되고, 검사기(`npm run check`, 06장)가 안전망이 된다.

## 7-2. 좋은 자연어 요청의 네 가지

요청에 아래 넷이 있으면 Claude 가 어느 층인지 바르게 판단하고 확인까지 끝낸다.

1. **목적·이유** — "운용자가 헷갈린다", "야간 암순응". 어느 층인지 판단하는 근거다.
2. **범위** — 어떤 화면·팔레트·신호에만 적용하는지.
3. **제약** — "OpenBridge 원본은 건드리지 말 것", "먼저 제안만".
4. **확인 방법** — `npm run check`·스크린샷·시나리오 조합.

> **📦 "경보 좀 더 눈에 띄게" 처럼 두루뭉술하게 요청하면?**
>
> 목적·범위·제약·확인 방법이 없으면 Claude 는 어느 층(토큰? 상태? 레이아웃?)을 바꿔야 할지 판단하기 어렵고, 엉뚱한 곳을 고치거나 과하게 바꾼다. 같은 뜻이라도 이렇게 적는다: "야간 팔레트에서만, 미확인 alarm 패널 테두리를 지금보다 두껍게. `states.json`·`tokens.json` 으로 해결되는지 먼저 판단하고, 안 되면 코드 변경안을 제안만 해. 야간 스크린샷으로 확인." 범위(야간·미확인 alarm), 제약(먼저 판단·제안만), 확인(스크린샷)이 다 들어 있다.

## 7-3. Figma 동기화 규칙

Figma 파일 주소는 `design/figma.json` 에 있다(비어 있으면 사용자에게 요청하고 추측하지 않는다). 이름은 `figma.json` 의 `naming` 을 따른다.

| 코드/선언 | Figma |
|---|---|
| `tokens.json` 의 `color.X` | Variables 컬렉션 `K3I` / `color/X`, Code syntax(WEB) `var(--k3i-color-X)`, 값은 OpenBridge 변수 alias |
| `states.json` 의 6개 상태 | 각 패널 Component Set 의 variant 속성 `state` = normal·degraded·stale·invalid·alarm·manual |
| `panels.json` 의 키 | Component Set `k3i-{panel}-panel` |
| `layouts.json` 의 키·areas | 프레임 `layout/{layout}`, 그 안의 슬롯 프레임 이름 = area 이름 |
| `views/{id}.json` | 프레임 `view/{id}` — 레이아웃 인스턴스 + 슬롯마다 패널 인스턴스 |

방향이 정해져 있다. **선언(JSON)이 진실 공급원**이다. 디자이너가 Figma 에서 바꿨다면 "Figma → JSON 반영" 요청으로 처리하고, JSON 을 갱신해 검사를 통과시킨 뒤 다시 Figma 로 내보낸다. OpenBridge 라이브러리 원본 컴포넌트는 고치지 않고 인스턴스로 쓰거나 K3I 컴포넌트로 감싼다.

> **📦 Figma 에서 바꾼 것을 코드에 바로 넣으면?**
>
> 선언(JSON)이 진실 공급원이므로 **"Figma → JSON → (검사) → 화면"** 순서를 지킨다. Figma 에서 디자이너가 바꾼 값을 코드 화면에 바로 반영해 버리면, JSON 과 화면이 서로 달라져 어느 쪽이 맞는지 알 수 없게 된다. 그래서 먼저 `tokens.json`·`layouts.json` 같은 선언을 고치고 `npm run check` 를 통과시킨 다음, 그 결과를 다시 Figma 로 맞춘다. 양쪽을 동시에 열어 두면 값이 서로 틀어진다(1강 2장의 "단일 공급원" 과 같은 이야기다).

## 7-4. 지키는 것 / 금지 (CLAUDE.md 5절)

- 색은 토큰(`var(--k3i-*)`)만. 컴포넌트·CSS 에 색 리터럴(`#hex`·`rgb()`) 금지. OpenBridge 변수를 패널에서 바로 쓰지 말고 토큰 층을 거친다.
- 패널이 상태를 판단하는 코드를 넣지 않는다. 상태는 `src/domain/signal.ts` 에서만 정한다(04장).
- `node_modules/@oicl/*` 를 고치지 않는다.
- `npm run check` 가 실패한 상태로 작업을 끝내지 않는다.

> 참고: 이 저장소에는 상위 폴더에 해사 규정(IMO BAM·MASS 등) 기반의 지침(`../CLAUDE.md`)도 있다. 경보 등급·색·깜빡임 같은 규칙은 그 규정을 따른다. 디자인을 바꿀 때 경보와 얽히면 그 지침을 함께 본다.

## 따라 하기

1. 자연어 요청을 하나 정해 7-1 표로 분류한다. 예: "기관 상세 화면의 '배기 온도' 경보 한계를 430도로." → `signals.json` 의 `exhaust.limits`.
2. 그 파일을 고치고 `npm run check` → `npm run typecheck` → `npm run dev` 로 확인한다.
3. 바꾼 파일·키를 한 줄로 요약한다.

## 이 장에서 한 것

- 자연어 요청이 6계층 표를 거쳐 어느 선언 파일로 가는지 봤다.
- 좋은 요청의 네 요소(목적·범위·제약·확인)를 봤다.
- Figma 이름 대응표와 "선언이 진실 공급원" 방향을 봤다.
- 색 리터럴·상태 판단·원본 수정·검사 실패 종료 금지를 정리했다.

여기까지 하면, 자연어 한 문장이 선언 → 검사 → 화면 → Figma 로 끝까지 흐르는 과정을 한 바퀴 돈 것이다. 더 깊은 실습은 `docs/LESSONS.md`(P0~P8)에 있다.
