# 2강 실습 교재 — React × Lit 상태 연동

같은 "상태"가 React·Lit(웹 컴포넌트)·Figma 세 곳에서 어떻게 이어지는지를, 따라 하며 익히는 교재다. 00장부터 차례로 읽으며 그대로 실행하면 된다. 모든 명령은 `k3i-ds` 폴더에서 실행한다.

**1강과 같은 프로젝트(`k3i-ds`)를 쓴다.** 1강에서 다룬 디자인 토큰과 컴포넌트 기본은 전제로 두고, 2강은 **상태 연동**에 집중한다. 1강 자료를 이미 받았다면 그대로 쓰면 된다.

## 순서

| 장 | 제목 | 무엇을 하나 |
|---|---|---|
| 00 | [개요와 준비](00-개요와-준비.md) | 설치, `npm run dev`, 상태 실습 화면(`demo/react.html`) 따라 하기 |
| 01 | [상태의 세 층](01-상태의-세-층.md) | 같은 상태가 Figma variant ↔ Lit 속성 ↔ React state 로 이어지는 구조 |
| 02 | [ds-switch 뜯어보기](02-ds-switch-뜯어보기.md) | `@property` vs `@state`, reflect, 취소 가능한 `ds-change` 이벤트 |
| 03 | [React 가 상태를 소유한다](03-React가-상태를-소유한다.md) | `state-lab.tsx` — state→props, 원격 잠금으로 거부, 되돌리기 |
| 04 | [DOM 속성과 Figma variant 실시간 보기](04-DOM속성과-Figma-variant-실시간-보기.md) | 관찰 표, `toFigma` 매핑, pressed 가 표에 안 나오는 이유 |
| 05 | [Figma 에 ds-switch 그리기와 Code Connect](05-Figma에-ds-switch-그리기와-Code-Connect.md) | variant 6개, `pressed` 를 Code Connect 에 매핑하지 않는 이유 |
| 06 | [역방향: Figma 에서 상태 추가](06-역방향-Figma에서-상태-추가.md) | Figma 에서 상태를 더하고 코드로 반영 |
| 부록 | [자주 묻는 것](부록-자주-묻는-것.md) | 실습 중 자주 나오는 물음 |

## 실행

```bash
cd k3i-ds
npm install
npm run dev        # http://localhost:5173/demo/react.html  ← 2강 실습 화면
```

## 미리 알아 둘 것

- 2강 실습 화면은 루트 `index.html`(1강 데모)이 아니라 **`demo/react.html`**(상태 실습)이다.
- 이 교재는 상태가 **어떻게 흐르고 누가 소유하는지**를 다룬다. 토큰·컴포넌트 구현 자체는 1강 교재(`../../01-Figma-Lit-디자인-시스템연동/k3i-ds/study/`)를 참고한다.
