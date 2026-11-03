# KASS 디자인 시스템 심화 실습 — OpenBridge × K3I

발표자료 「KRISO 자율운항선박 대시보드 시각화 1차년도」의 설계를 실제로 돌아가는 코드로 옮긴 실습 프로젝트입니다.

- **5장 OpenBridge Design System** → `@oicl/openbridge-webcomponents` 2.1.0 (Lit) 을 Token·Primitive·Instrument 층으로 사용
- **36장 6계층 디자인 시스템** → Token · Primitive · Instrument · Block · Layout · View 를 폴더·파일로 그대로 구현
- **40장 상태 6종** → `design/states.json` + `src/domain/signal.ts` (우선순위로 하나만 표시)
- **44장 클래스 모델** → `Signal<T>`, `SignalAdapter`, `SignalStore`(rAF), `Panel`(abstract), `Registry`, `ViewSpec`

**목표: 자연어로 디자인 시스템을 바꾸고 → Figma 와 프론트엔드에 함께 반영.**
그래서 바뀔 수 있는 것은 전부 `design/` 의 JSON 선언으로 빼 두었고, `npm run check` 가 잘못된 변경을 막습니다.

## 실행

```bash
npm install
npm run dev        # 검사 → 토큰 빌드 → http://localhost:5173
```

화면 오른쪽 **시나리오** 토글로 6가지 상태를 하나씩 일으켜 보고, **상태 검사** 표에서
데이터 계층이 어떤 후보 중 무엇을 골랐는지, 그것이 Figma 의 어느 variant 인지 확인합니다.
오른쪽 위 밝기 버튼 → 팔레트(bright/day/dusk/night) 전환. K3I 패널도 자동으로 따라갑니다.

## 구조

```
design/                 ← 자연어 변경의 대상 (선언)
  tokens.json           Token    — K3I 토큰 → OpenBridge 변수 alias (+팔레트별 덮어쓰기)
  states.json           Block    — 상태 6종: 색 토큰·형태·문구·우선순위
  panels.json           Block    — 패널 종류와 필요한 신호 역할
  layouts.json          Layout   — grid-template-areas 슬롯 정의
  views/*.json          View     — 화면구성정의 (파일 추가 = 화면 추가)
  signals.json          (데이터) — 신호 카탈로그·임계값·ttl
  figma.json            Figma 파일 URL·이름 규칙
scripts/
  validate.mjs          선언 정합성 검사 (npm run check)
  build-tokens.mjs      tokens.json → src/styles/k3i-tokens.css (OpenBridge 변수 존재 검사)
  list-ob-vars.mjs      OpenBridge 팔레트 변수 4종 비교표
src/
  domain/               Signal<T>·SignalAdapter·catalog — 상태는 여기서만 결정
  infra/                MockMqttTransport·SignalStore(rAF 배치)
  ds/                   Block·Layout 층 Lit 컴포넌트 (K3iPanel 추상 클래스 상속)
  view/                 Registry·ViewRenderer — JSON → 화면
  app/                  OpenBridge 앱 골격(top-bar·팔레트 메뉴) + 실습 도구
docs/LESSONS.md         단계별 실습 (자연어 변경 루프 포함)
CLAUDE.md               Claude Code 작업 규칙 — 자연어 요청을 어느 파일로 보낼지
```

## 링크

- OpenBridge 소개: https://www.openbridge.no/about-openbridge
- OpenBridge 웹컴포넌트 소스: https://github.com/Ocean-Industries-Concept-Lab/openbridge-webcomponents
- Storybook (컴포넌트 API): https://openbridge-storybook.web.app
- Figma 라이브러리: openbridge.no 에서 최신(6.x) 링크를 받아 `design/figma.json` 에 기입

## 주의

- 신호 토픽·임계값·페이로드 스키마는 **실습용 가정값**입니다. 실제 과제에서는 kass-signal-catalog 와 분야5 MQTT 스키마로 교체하고 `KassV1Adapter` 를 맞춥니다.
- OpenBridge 2.x 는 릴리스 후 6개월간 AGPL-3.0, 이후 Apache-2.0 입니다(후원사는 즉시 상용 라이선스). 발표자료 5장의 "오픈소스이므로 그대로 차용" 표현은 이 조건을 반영해 보완이 필요합니다.
