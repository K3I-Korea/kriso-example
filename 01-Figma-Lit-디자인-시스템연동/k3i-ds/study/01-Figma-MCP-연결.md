# 01. Claude Code 를 Figma 에 연결하기

이 장에서는 Claude Code 가 Figma 파일을 읽고 쓰도록 **Figma MCP** 를 붙인다. 연결이 되면 다음 장부터 "코드의 토큰을 Figma 변수로 만들어 줘" 같은 지시를 Claude Code 에게 직접 내릴 수 있다. 끝에서는 실습용 Figma 파일도 하나 만든다.

## 1-1. 준비물

| 준비물 | 확인 |
|---|---|
| Claude Code (터미널) | 설치돼 있고 `k3i-ds` 폴더에서 열려 있어야 한다 |
| Figma 계정 | 로그인돼 있어야 한다 |
| **Figma 데스크톱 앱** | 플러그인 실행에 쓴다. 웹이 아니라 데스크톱 앱이 필요하다 |
| 00장의 `npm install` | 끝나 있어야 한다 |

## 1-2. 플랜에 따른 제한을 먼저 안다

Figma MCP 는 기능마다 필요한 플랜이 다르다. 학습 중에 막히지 않도록 미리 본다.

| 기능 | 조건 |
|---|---|
| MCP 읽기 도구 (`get_design_context`, `get_variable_defs` 등) | Starter 플랜이나 View/Collab 시트는 **월 6회 제한**. 넉넉히 쓰려면 Professional 이상 + Dev/Full 시트를 권한다 |
| MCP 캔버스 쓰기 (변수·컴포넌트 생성) | 원격 서버 전용. 베타 기간 무료이고 읽기 제한과는 별개다 |
| Code Connect 게시 | Organization / Enterprise 플랜 필요 (05장) |

읽기 도구가 월 6회로 묶이는 환경이라면, 쓰기 위주로 실습하고(제한 없음) 읽기는 꼭 필요할 때만 쓴다. 04장의 "코드 → Figma" 방향과 02장의 플러그인은 모두 읽기 도구를 쓰지 않는다.

## 1-3. 연결하기 (권장: 공식 플러그인)

터미널에서 아래를 실행한다.

```bash
claude plugin install figma@claude-plugins-official
```

설치한 뒤 **Claude Code 를 한 번 종료했다가 다시 연다.** 그리고 Claude Code 안에서 차례로 입력한다.

```
/plugin      → Installed 탭에서 figma 선택 → Authenticate → 브라우저에서 Figma 로그인 허용
/mcp         → figma 가 connected 로 보이면 성공
```

### 플러그인 없이 수동으로 연결하려면

```bash
# 모든 프로젝트에서 쓰려면 --scope user
claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
```

## 1-4. 연결이 됐는지 확인한다

`k3i-ds` 폴더를 연 Claude Code 에서 아래를 그대로 입력한다.

```
Figma MCP 에서 쓸 수 있는 도구 목록을 보여주고, 각각 읽기/쓰기 중 무엇인지 표로 정리해줘.
```

도구 목록이 나오고 그 안에 **캔버스에 쓰는 도구**(변수·스타일·컴포넌트를 만드는 도구)가 보이면 연결에 성공한 것이다. 이 도구를 02장에서 쓴다.

## 1-5. CLAUDE.md 가 규칙을 대신 기억한다

`k3i-ds` 폴더에는 `CLAUDE.md` 파일이 있다. Claude Code 는 폴더를 열 때 이 파일을 자동으로 읽는다. 여기에는 **토큰·컴포넌트의 이름을 Figma 와 코드에서 어떻게 맞출지**가 표로 적혀 있다(예: `tokens.json` 의 `color.brand.600` ↔ Figma `Primitives / color/brand/600` ↔ CSS `--ds-color-brand-600`).

그래서 다음 장부터 지시를 내릴 때 이름 규칙을 매번 설명하지 않아도 된다. 한 번 편집기로 `CLAUDE.md` 를 열어 "이름 매핑 규칙" 표를 눈으로 훑어 둔다. 어떤 규칙을 Claude Code 가 따를지 알고 있으면 결과를 확인하기 쉽다.

## 1-6. 실습용 Figma 파일 만들기

02장부터 토큰과 컴포넌트를 올릴 빈 파일을 하나 준비한다.

1. Figma 에서 새 **Design 파일**을 만들고 이름을 `ds` 로 한다.
2. 페이지를 세 개 만든다: `Foundations`, `Components`, `Playground`.
3. 파일 주소를 복사해 둔다. 주소는 `https://www.figma.com/design/<FILE_KEY>/ds` 꼴이다.

이 주소를 앞으로 `<FILE_URL>` 이라고 부른다. 다음 장들의 지시문에서 `<FILE_URL>` 자리에 이 주소를 넣으면 된다.

## 이 장에서 한 것

- Figma MCP 를 Claude Code 에 연결하고 `/mcp` 로 확인했다.
- 플랜별 제한을 알아 두었다.
- `CLAUDE.md` 가 이름 규칙을 대신 기억한다는 것을 봤다.
- 실습용 Figma 파일 `ds` 를 만들고 주소(`<FILE_URL>`)를 챙겼다.

다음 **02장**에서는 코드의 토큰을 이 Figma 파일에 올리고, 반대로 Figma 에서 바꾼 값을 코드로 되읽는 양방향을 해 본다.
