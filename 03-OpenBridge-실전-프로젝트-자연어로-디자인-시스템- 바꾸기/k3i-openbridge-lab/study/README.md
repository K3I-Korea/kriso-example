# 3강 실습 교재 — OpenBridge × K3I (자연어로 디자인 시스템 바꾸기)

OpenBridge(해양 HMI 디자인 시스템) 위에 K3I 디자인 시스템을 얹어 자율운항선박 대시보드를 만들고, **자연어 요청만으로 그 디자인을 바꿔 Figma·프론트엔드에 함께 반영**하는 실습이다. 00장부터 차례로 읽으며 그대로 실행하면 된다. 모든 명령은 `k3i-openbridge-lab` 폴더에서 실행한다.

이 프로젝트는 **1·2강과 다른 별도 프로젝트**다. 1·2강(`k3i-ds`)의 토큰·컴포넌트 개념은 도움이 되지만, 코드와 구조는 여기서 새로 시작한다.

## 실행

```bash
cd k3i-openbridge-lab
npm install
npm run dev        # 검사 → 토큰 빌드 → http://localhost:5173
```

## 순서

| 장 | 제목 | 무엇을 하나 |
|---|---|---|
| 00 | [개요와 준비](00-개요와-준비.md) | 설치, `npm run dev`, 대시보드 둘러보기 |
| 01 | [6계층 구조](01-6계층-구조.md) | View·Layout·Block·Instrument·Primitive·Token, 요청을 어느 층으로 보낼지 |
| 02 | [토큰 층](02-토큰-층.md) | `design/tokens.json` → OpenBridge 변수 alias, 팔레트 |
| 03 | [신호와 상태](03-신호와-상태.md) | `signals.json`·`states.json`, 상태는 데이터 계층이 결정 |
| 04 | 패널(Block) | `panels.json`, `K3iPanel`, 새 패널 만들기 |
| 05 | 레이아웃과 View | `layouts.json`, `views/*.json` |
| 06 | 검사기와 변경 절차 | `npm run check`(`validate.mjs`), 안전한 변경 순서 |
| 07 | 자연어로 바꾸기와 Figma 동기화 | 요청 → 선언 수정 → 검사 → Figma 반영 |
| 부록 | 자주 묻는 것 | 용어·배경지식 |

## 미리 알아 둘 것

- 바뀔 수 있는 것은 전부 `design/` 의 JSON 선언으로 빼 두었다. 대부분의 자연어 요청은 코드가 아니라 이 JSON 을 고쳐서 끝난다.
- `npm run check`(`scripts/validate.mjs`)가 잘못된 변경을 막는다. 검사를 통과하지 못한 채로 끝내지 않는다.
- 상위 폴더의 `../CLAUDE.md`·`k3i-openbridge-lab/CLAUDE.md` 는 "자연어 요청을 어느 파일로 보낼지" 를 정리한 작업 규칙이고, `docs/LESSONS.md` 는 단계별 실습이다.
