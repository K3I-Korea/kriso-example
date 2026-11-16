# CLAUDE.md — OpenBridge × K3I 디자인 작업 지침

이 파일은 03강 전체(OpenBridge 실전 프로젝트)에서 **Claude 가 디자인 작업을 할 때 따르는 상위 지침**이다.
핵심은 하나다: **디자인하기 전에 `openbridge-guide/` 폴더를 먼저 읽고, 그 지침에 맞춰 작업한다.**

## 0. 가장 먼저 — `openbridge-guide/` 를 읽는다 (필수)

- 어떤 디자인 작업이든(색·토큰 변경, 패널·화면 수정, 새 컴포넌트, Figma 반영) **시작 전에 `openbridge-guide/` 폴더의 모든 파일을 읽는다.** 이 폴더가 OpenBridge 디자인의 **1차 기준**이다.
- **폴더가 비어 있으면** 거기 맞춰 디자인 결정을 **임의로 내리지 않는다.** 사용자에게 "`openbridge-guide/` 에 작성지침 파일을 넣어 달라" 고 요청하고, 채워지기 전에는 추측으로 진행하지 않는다.
- `openbridge-guide/` 의 내용이 아래 프로젝트 규칙과 **충돌하면**, 어느 쪽을 따를지 사용자에게 묻는다. 말없이 한쪽을 고르지 않는다.
- guide 에 적힌 색·수치·컴포넌트 이름·규칙은 **그대로** 쓴다. 비슷한 것으로 바꾸거나 "그럴듯한" 값을 채우지 않는다.

## 1. 이 지침과 프로젝트 규칙의 관계

구현 세부 규칙(6계층 구조, 변경 절차, Figma 동기화, 금지 사항)은 **`k3i-openbridge-lab/CLAUDE.md`** 에 있다. 디자인 작업은 그 규칙을 그대로 따른다. 이 파일은 그 위에 "디자인 결정의 기준은 `openbridge-guide/` 다" 를 얹은 상위 지침이다.

기준의 우선순위:

1. **`openbridge-guide/`** — 디자인 규칙 (무엇을, 어떻게 보이게 할지)
2. **`k3i-openbridge-lab/CLAUDE.md`** — 그 규칙을 코드·선언으로 옮기는 방법과 절차
3. **OpenBridge 라이브러리**(`@oicl/openbridge-webcomponents`) — 실제 컴포넌트·변수의 원본

## 2. `openbridge-guide/` 를 읽은 뒤 할 일

파일이 들어오면 디자인 결정마다 guide 를 근거로 삼는다.

- **색·팔레트**: guide 가 정한 색·대비·주야(day·dusk·night·bright) 규칙을 따른다. 코드에는 색 리터럴(`#hex`, `rgb()`) 대신 토큰(`var(--k3i-*)`)만 쓰고, 토큰 층(`design/tokens.json`)을 거친다.
- **컴포넌트 선택**: guide 가 지정한 OpenBridge 계기·프리미티브를 쓴다. 원본 라이브러리는 고치지 않고 인스턴스로 쓰거나 K3I 컴포넌트로 감싼다.
- **레이아웃·간격·상태 표현**: guide 의 규칙에 맞춰 `design/*.json` 을 고친다.
- guide 와 현재 선언(`design/*.json`)·코드가 어긋나면 **guide 를 기준으로 선언을 고치고**, 3절의 절차를 밟는다.

## 3. 디자인 작업 순서 (요약)

1. `openbridge-guide/` 를 읽는다. (0절)
2. 요청이 어느 층인지 분류한다. (`k3i-openbridge-lab/CLAUDE.md` 1절의 6계층 표)
3. 바꿀 파일·키를 한 줄로 먼저 말한다.
4. `k3i-openbridge-lab/` 안에서 `design/` JSON 을 고친다 (코드보다 선언 우선).
5. `npm run check` → 통과할 때까지 고친다. 토큰을 건드렸으면 `npm run tokens`, 이어서 `npm run typecheck`.
6. `npm run dev` 로 화면을 확인한다 (가능하면 day·night 둘 다 스크린샷).
7. Figma 연결 시 동기화한다. (`k3i-openbridge-lab/CLAUDE.md` 3절)
8. 바꾼 것을 파일·키 단위로 요약한다.

## 4. 반드시 지키는 것 (상세는 `k3i-openbridge-lab/CLAUDE.md` 5절)

- 색은 토큰(`var(--k3i-*)`)만. 컴포넌트·CSS 에 색 리터럴 금지. OpenBridge 변수를 패널에서 바로 쓰지 말고 토큰 층을 거친다.
- 패널이 상태를 판단하는 코드를 넣지 않는다. 상태는 `src/domain/signal.ts` 에서만 정한다.
- `node_modules/@oicl/*` 를 고치지 않는다.
- `npm run check` 가 실패한 상태로 작업을 끝내지 않는다.
- 확인하지 않은 값·규칙을 지어내지 않는다. guide 에 없으면 사용자에게 묻는다.

## 5. 지금 상태 메모

`openbridge-guide/` 는 아직 비어 있다. 사용자가 작성지침 파일을 넣을 예정이다. 파일이 들어오면 0절대로 먼저 읽고 작업을 시작한다. 그 전에 디자인 요청이 오면, 이 지침을 근거로 **먼저 guide 파일부터 요청**한다.
