# 심화 실습 — 자연어로 디자인 시스템을 바꾸고 프론트엔드까지 반영하기

> 전제: 앞선 기초 실습(`ds` 프로젝트 `figma/SETUP.md`)으로 Claude Code 에 Figma MCP 가 연결되어 있다.
> 이 프로젝트 폴더에서 `claude` 를 실행하면 `CLAUDE.md` 가 자동으로 읽힌다.

```
         자연어 요청
              │
              ▼
   ┌── Claude Code (CLAUDE.md 규칙으로 "어느 층?" 판단) ──┐
   │                                                       │
   ▼                                                       ▼
design/*.json 수정 ── npm run check ──▶ 프론트엔드      Figma MCP
 (tokens·states·layouts·views·signals)   (자동 반영)    (K3I 변수·컴포넌트·화면 프레임)
              ▲                                            │
              └──────── 디자이너가 Figma 에서 수정 ◀────────┘  (역방향: P7)
```

핵심 원리: **바뀔 수 있는 것은 전부 선언(JSON)으로 빼고, 코드는 선언을 읽기만 한다.**
그러면 자연어 변경 = JSON 편집이 되고, 검사기(`npm run check`)가 안전망이 된다.

---

## P0. 준비

```bash
npm install && npm run dev      # http://localhost:5173
```

1. 오른쪽 **시나리오** 토글 5개를 하나씩 켜 보고 패널의 색·형태·문구가 어떻게 바뀌는지 본다 (상태 6종 전부 재현됨)
2. 밝기 버튼 → night 팔레트. K3I 패널까지 함께 바뀌는 이유를 `src/styles/k3i-tokens.css` 에서 확인
3. Figma: openbridge.no 에서 OpenBridge Figma 라이브러리(6.x)를 받아 팀 라이브러리로 게시하고, K3I 작업용 파일을 하나 만든다
4. 두 URL 을 `design/figma.json` 의 `openbridgeLibraryUrl`, `k3iFileUrl` 에 기입

---

## P1. 구조를 Claude 에게 설명시키기 (읽기 전용)

```
이 저장소의 6계층(Token·Primitive·Instrument·Block·Layout·View)이 각각 어느 폴더/파일에 있는지 표로 정리하고,
"배기 온도" 패널 하나가 MQTT 메시지에서 화면 픽셀이 되기까지 거치는 파일을 순서대로 짚어줘. 코드는 고치지 마.
```

확인할 것
- `Signal.candidates()` → `states.json priority` → 패널 `state` 속성 → `k3i-panel.ts` 의 `:host([shape=...])` 연결
- OpenBridge 의 `dist/decorator.js` — 같은 태그를 두 번 등록하면 오류 대신 경고만 내도록 `customElement` 를 직접 만든 사례 (기초 실습의 데코레이터 질문과 연결)

---

## P2. Token — 색을 자연어로 바꾸기

### 2-1. 코드 쪽
```
야간(night) 팔레트에서만 caution 색을 OpenBridge 의 warning 계열보다 덜 눈에 띄는 색으로 바꾸고 싶어.
npm run ob:vars -- alert-caution 과 -- alert-warning 으로 후보 변수를 비교한 뒤 design/tokens.json 에 palettes.night 로 반영해.
CLAUDE.md 절차대로 check → tokens → 스크린샷(day, night)까지 해.
```

### 2-2. Figma 쪽
```
design/tokens.json 을 design/figma.json 의 k3iFileUrl 파일에 Variables 컬렉션 "K3I" 로 만들어줘.
- 변수 이름: color/surface, color/alarm … (group/name)
- 값: OpenBridge 라이브러리의 해당 변수(ob 필드)를 alias 로 연결. 라이브러리 변수를 찾을 수 없으면 멈추고 목록을 보여줘
- 모든 변수에 Code syntax WEB = var(--k3i-<group>-<name>)
- palettes 덮어쓰기가 있으면, OpenBridge 라이브러리의 팔레트 모드 구조를 먼저 확인하고 어떻게 표현할지 제안만 해 (바로 만들지 말 것)
```

💡 OpenBridge Figma 라이브러리에서 팔레트가 어떤 방식(모드/별도 컬렉션)으로 구성되어 있는지는 직접 확인해야 한다. Claude 에게 "먼저 구조를 읽고 보고" 시키는 것이 안전하다.

---

## P3. 상태 규칙 — 문구·우선순위·형태

### 3-1. 문구와 우선순위
```
운용자 피드백: "수동 보정 중인데 통신이 끊기면 수동 표시가 사라져서 헷갈린다."
manual 이 stale 보다 우선 보이도록 바꾸고, stale 문구를 "갱신 끊김 {age}초" 로 바꿔줘.
바꾼 뒤 시나리오 '통신 끊김'+'타각 수동 보정'을 함께 켰을 때 타각 패널이 무엇을 보여야 하는지 설명해.
```
→ `states.json` 만 바뀌고 코드는 그대로인지 확인 (`git diff --stat`)

### 3-2. 검사기가 막는 변경 일부러 해보기
```
stale 을 깜빡이게(blink) 해줘.
```
→ `npm run check` 가 "지원하지 않는 shape" 로 막는다. Claude 가 CLAUDE.md 4절을 따라
`k3i-panel.ts` CSS + `validate.mjs SHAPES` 를 먼저 추가하는지 관찰. (선교 화면 점멸은 경보 전용 관례라는 점도 토론해 볼 것)

### 3-3. Figma 상태 variant
```
k3iFileUrl 파일의 Components 페이지에 k3i-value-panel Component Set 을 만들어줘.
- variant state = states.json 의 6개 이름 그대로
- 각 variant 의 테두리·배지 색은 K3I 변수(color/<token>)에 바인딩, 형태(shape)는 src/ds/base/k3i-panel.ts CSS 를 읽고 재현
- 본문에는 OpenBridge 라이브러리의 readout 컴포넌트 인스턴스를 사용
- 배지 문구는 states.json text ({age} 는 "5", {reason} 은 "ALARM EXH. TEMP" 로 채워서)
```

---

## P4. Layout · View — 화면을 자연어로 구성

### 4-1. 슬롯 추가
```
항해 개요 화면 오른쪽에 수치 칸을 하나 더 두고 싶어. l1-grid 를 4열로 바꾸고 kpi-4 슬롯을 만들어
윤활유 압력을 kpi-4 로 옮기고, 비게 된 kpi-3 에는 SOG 를 넣어줘. tertiary 는 지워도 돼.
```

### 4-2. 새 화면
```
"추진 감시" 화면을 새로 만들어줘. l2-split 레이아웃, 위 3칸은 RPM·배기온도·윤활유압, 아래 detail 은 타각.
파일만 추가하면 탭에 나타나는지 확인해.
```
→ `design/views/propulsion.json` 하나 추가로 끝나는지 (`import.meta.glob` 이 자동 수집)

### 4-3. Figma 화면 프레임
```
layouts.json 의 각 레이아웃을 k3iFileUrl 의 Layouts 페이지에 layout/<이름> 프레임으로 그려줘.
grid areas 를 Auto layout 으로 재현하고, 각 슬롯 프레임 이름은 area 이름 그대로.
그다음 views/*.json 마다 Views 페이지에 view/<id> 프레임을 만들고 슬롯마다 해당 k3i-*-panel 인스턴스를 넣어.
```

---

## P5. 데이터 — 신호와 임계값

```
분야5 에서 연료 소모율(vessel/engine/me1/fuel-rate, L/h)을 준다고 가정하고 신호를 추가해줘.
소수 1자리, ttl 3초, 260 초과 caution, 300 초과 warning. 추진 감시 화면에 넣고,
모의 전송기(mock-transport)에도 그럴듯한 값을 내보내게 해.
```
→ 이 요청은 `signals.json` + `views` 에 더해 `src/infra/mock-transport.ts` 도 고친다. "실데이터가 오면 모의 코드만 사라진다" 는 경계를 확인.

---

## P6. 새 Block — OpenBridge 계기로 패널 만들기

```
OpenBridge 의 obc-azimuth-thruster 로 "추진기 방위" 패널을 새로 만들어줘.
custom-elements.json 에서 속성을 확인하고, CLAUDE.md 4절 절차(Lit 클래스 → index/react → panels.json → registry → Figma)를 전부 따라.
신호는 thruster-angle(°), thruster-load(%) 두 개를 signals.json 에 추가.
```

확인
- 새 클래스가 `K3iPanel` 을 상속해서 상태 6종 표현을 **공짜로** 얻는지 (시나리오 '통신 끊김' 으로 stale 확인)
- `registry.tsx` 시작 시 검사가 panels.json 과의 불일치를 잡는지 (일부러 등록을 빼 보기)

---

## P7. 역방향 — 디자이너가 Figma 에서 바꾼 것을 코드로

디자이너가 Figma 에서 직접:
- K3I 변수 `color/caution` 의 alias 를 다른 OpenBridge 변수로 교체
- `layout/l1-grid` 프레임에서 kpi 열을 왼쪽으로 이동

```
k3iFileUrl 의 K3I 변수와 Layouts 페이지를 읽어서 design/tokens.json, design/layouts.json 과 다른 점을 diff 로 보여줘.
내가 승인하면 JSON 에 반영하고 npm run check 를 돌려.
```

💡 선언(JSON)이 진실 공급원이므로 "Figma → JSON → (검사) → 화면" 순서를 지킨다. Figma 를 직접 코드에 반영하지 않는다.

---

## P8. 종합 미션 — 분야2 근거 화면

자연어 사양 하나로 끝까지:

```
L2 근거 화면을 만들자. 목적: 충돌 위험 판단의 근거를 보여주는 화면.
- 위: 최근접 선박 거리(nm), CPA(nm), TCPA(min) 수치 3개 — CPA 0.5 미만 warning, 0.3 미만 alarm
- 아래: 침로 패널
- 데이터는 아직 없으니 모의 전송기에 시나리오 토글 '근접 선박 접근'을 추가해서 CPA 가 줄어들게
코드·선언·Figma(K3I 변수·컴포넌트·view 프레임)까지 전부 반영하고, 마지막에 변경 파일 목록과 day/night 스크린샷을 보여줘.
```

### 점검표
- [ ] `npm run check`, `npm run typecheck` 통과
- [ ] 색 리터럴 0개 (`grep -rnE "#[0-9a-fA-F]{3,6}\b|rgb\(" src/ds src/app`)
- [ ] 새 신호가 6가지 상태를 모두 낼 수 있는가 (시나리오로 재현)
- [ ] Figma 이름(변수·Component Set·슬롯 프레임·view 프레임)이 JSON 과 글자 그대로 같은가
- [ ] day/night 두 팔레트에서 읽히는가

---

## 좋은 자연어 요청의 4요소

1. **목적/이유** — "운용자가 헷갈린다", "야간 암순응" (Claude 가 어느 층인지 판단하는 근거)
2. **범위** — 어떤 화면·팔레트·신호에만 적용하는지
3. **제약** — "OpenBridge 원본은 건드리지 말 것", "먼저 제안만"
4. **확인 방법** — check·스크린샷·시나리오 조합

나쁜 예: "경보 좀 더 눈에 띄게"
좋은 예: "야간 팔레트에서만, 미확인 alarm 패널 테두리를 지금보다 두껍게. states.json/tokens.json 으로 해결되는지 먼저 판단하고, 안 되면 코드 변경안을 제안만 해. night 스크린샷으로 확인."
