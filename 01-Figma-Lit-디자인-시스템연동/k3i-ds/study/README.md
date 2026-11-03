# 01강 실습 교재 — Figma × Lit 디자인 시스템

Figma 디자인을 한 번만 구현해서 React·Vue·순수 HTML 어디서나 쓰는 방법을, Figma 연결부터 따라 하도록 적은 교재다. 00장부터 차례로 읽으며 그대로 실행하면 된다. 모든 명령은 `k3i-ds` 폴더에서 실행한다.

## 순서

| 장 | 제목 | 무엇을 하나 |
|---|---|---|
| 00 | [개요와 준비](00-개요와-준비.md) | 설치, `npm run dev`, 데모(실습 1) 따라 하기 |
| 01 | [Figma MCP 연결](01-Figma-MCP-연결.md) | Claude Code ↔ Figma 연결, 실습용 `ds` 파일 만들기 |
| 02 | [토큰 — 코드와 Figma 잇기](02-토큰-코드와-Figma-잇기.md) | `tokens.json`·`npm run tokens`, 플러그인으로 Figma 변수 생성, 역방향 |
| 03 | [Lit 컴포넌트 뜯어보기](03-Lit-컴포넌트-뜯어보기.md) | `ds-button`·`ds-input`·`ds-card`, Shadow DOM, 디자인을 지키는 세 장치 |
| 04 | [Figma 에 컴포넌트 그리기](04-Figma에-컴포넌트-그리기.md) | Component Set, variant 이름을 코드와 맞추기 |
| 05 | [Code Connect](05-Code-Connect.md) | Figma 컴포넌트에 진짜 `<ds-button>` 코드 잇기 |
| 06 | [앱에서 쓰기](06-앱에서-쓰기.md) | 순수 HTML·React·Vue 에서 같은 컴포넌트 쓰기 |
| 07 | [동기화 정리와 마무리](07-동기화-정리와-마무리.md) | 양방향 흐름, 새 컴포넌트 체크리스트, 한계 |
| 부록 | [자주 묻는 것](부록-자주-묻는-것.md) | `.mjs` 확장자 등 실습 중 자주 나오는 물음 |

## 미리 알아 둘 것

- 00장은 Figma 없이 코드만으로 끝난다. Figma 계정·데스크톱 앱·Claude Code 는 01장부터 쓴다.
- 읽기용 MCP 도구는 플랜에 따라 월 호출 제한이 있다(01장 참고). 쓰기(플러그인·변수 생성)는 제한이 없으니 그쪽 위주로 실습한다.
- 이 폴더 바깥의 `../CLAUDE.md`·`../figma/SETUP.md`·`../figma/LESSONS.md` 는 같은 내용을 규칙·레슨 형태로 정리한 참고 자료다.
