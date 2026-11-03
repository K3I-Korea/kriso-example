# 0단계 — Claude Code ↔ Figma MCP 연결

## 준비물
- Claude Code (터미널) 설치 완료
- Figma 계정 + **Figma 데스크톱 앱** (플러그인 실행용)
- 이 프로젝트: `npm install`

## 플랜/시트 확인 (중요)
| 기능 | 필요 조건 |
|---|---|
| MCP 읽기 도구 (`get_design_context`, `get_variable_defs` 등) | Starter 플랜 또는 View/Collab 시트는 **월 6회 제한** → 학습하려면 Professional 이상 + Dev/Full 시트 권장 |
| MCP 캔버스 쓰기 (변수·컴포넌트 생성) | 원격 서버 전용, 현재 베타 기간 무료, 읽기 rate limit 대상 아님 |
| Code Connect 게시 | Organization / Enterprise 플랜 |

> 월 6회 제한에 걸리는 환경이라면: 쓰기 위주로 학습하고(제한 없음), 읽기는 꼭 필요할 때만 쓰세요.

## 연결 (권장: 공식 플러그인)

```bash
claude plugin install figma@claude-plugins-official
```

Claude Code를 재시작한 뒤:

```
/plugin      → Installed 탭에서 figma 선택 → Authenticate → 브라우저에서 Figma 로그인 허용
/mcp         → figma 가 connected 로 표시되면 성공
```

### 수동 연결 (플러그인 없이)
```bash
# 모든 프로젝트에서 쓰려면 --scope user
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

## 연결 확인 프롬프트

Claude Code에서 이 프로젝트 폴더(`ds/`)를 열고:

```
Figma MCP 에서 사용할 수 있는 도구 목록을 보여주고, 각각 읽기/쓰기 중 무엇인지 표로 정리해줘.
```

→ 도구 목록에 캔버스에 쓰는 도구가 보이면 1단계로 진행.

## 학습용 Figma 파일 만들기
1. Figma에서 새 Design 파일 생성 → 이름 `ds`
2. 페이지 3개: `Foundations`, `Components`, `Playground`
3. 파일 URL을 복사해 두기 (`https://www.figma.com/design/<FILE_KEY>/ds`)
