# K3I 디자인 시스템 실습

Figma 디자인을 한 번만 구현해 React·Vue·순수 HTML 어디서나 쓰는 방법을 세 강으로 나눠 다룬다. 각 폴더에 강의 슬라이드(`.pptx`)와 실습 코드가 함께 들어 있다.

## 구성

| 폴더 | 강 | 실습 코드 | 다루는 것 |
|---|---|---|---|
| `01-Figma-Lit-디자인-시스템연동` | 1강 Figma × Lit | `k3i-ds` | Figma 토큰을 Lit 웹 컴포넌트로 옮겨 단일 공급원 만들기 |
| `02-React-Lit-상태연동` | 2강 React × Lit 상태 연동 | `k3i-ds` | 컴포넌트 상태, `@lit/react` 래퍼, 거부 가능한 이벤트 |
| `03-OpenBridge-실전-프로젝트-자연어로-디자인-시스템- 바꾸기` | 3강 OpenBridge 실전 | `k3i-openbridge-lab` | 선언 파일과 검사기, 자연어로 디자인 시스템 바꾸기 |

1강과 2강은 같은 프로젝트(`k3i-ds`)를 쓴다. 3강은 별도 프로젝트다.

## 실행

각 실습 폴더의 코드 디렉터리로 들어가서 돌린다.

```bash
# 1·2강
cd "01-Figma-Lit-디자인-시스템연동/k3i-ds"
npm install
npm run dev

# 3강
cd "03-OpenBridge-실전-프로젝트-자연어로-디자인-시스템- 바꾸기/k3i-openbridge-lab"
npm install
npm run dev
```

폴더마다 `수업안내.md`와 `README.md`에 그 강에서 쓰는 파일과 실습 순서를 적어 두었다.
