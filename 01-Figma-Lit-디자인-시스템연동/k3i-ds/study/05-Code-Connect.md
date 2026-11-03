# 05. Code Connect — Figma 컴포넌트에 진짜 코드 잇기

Code Connect 는 Figma 컴포넌트와 실제 코드를 이어 준다. 이어 두면 Figma Dev Mode 와 MCP 가 "React+Tailwind 추측 코드" 대신 `<ds-button variant="primary">` 처럼 **이미 있는 컴포넌트를 쓰는 코드**를 그대로 돌려준다.

> Code Connect 게시는 Figma Organization / Enterprise 플랜의 Dev/Full 시트가 필요하다. 플랜이 안 되면 이 장의 매핑 파일을 읽고 구조만 이해한 뒤 넘어가도 된다.

## 5-1. 설정 파일 — figma.config.json

`figma.config.json` 을 연다. 이 프로젝트가 HTML(웹 컴포넌트)용 Code Connect 를 쓰고, 매핑 파일을 어디서 찾을지 적혀 있다.

```json
{
  "codeConnect": {
    "parser": "html",
    "include": ["figma/code-connect/**/*.figma.ts"]
  }
}
```

## 5-2. 매핑 파일 읽기 — ds-button.figma.ts

`figma/code-connect/ds-button.figma.ts` 를 연다. 세 부분이다.

**① 어떤 Figma 노드에 잇는가.** `figma.connect(URL, ...)` 의 URL 이 Figma 의 ds-button Component Set 을 가리킨다. 지금은 `FILE_KEY` / `NODE_ID` 가 자리값으로 들어 있어 **실제 링크로 바꿔야 한다.**

**② Figma 속성 → 코드 속성 매핑(`props`).** Figma 의 variant·text 를 코드 props 로 옮긴다.

```ts
props: {
  variant: figma.enum("variant", { primary:"primary", secondary:"secondary", ghost:"ghost", danger:"danger" }),
  size:    figma.enum("size", { sm:"sm", md:"md", lg:"lg" }),
  disabled: figma.enum("state", { disabled: true }),
  loading:  figma.enum("state", { loading: true }),
  label:   figma.string("label"),
}
```

여기서 `state` 중 `hover`·`default` 는 매핑하지 않는다. 04장에서 말한 대로 내부 상태나 자동 상태는 코드에서 바깥이 지정하지 않기 때문이다.

**③ 돌려줄 코드(`example`).** 매핑한 값으로 실제 사용 코드를 만든다.

```ts
example: ({ variant, size, disabled, loading, label }) =>
  html`<ds-button variant=${variant} size=${size} disabled=${disabled} loading=${loading}>${label}</ds-button>`
```

## 5-3. URL 을 실제 링크로 바꾸기

1. Figma 에서 04장에 만든 **ds-button Component Set** 을 고른다.
2. 오른쪽 클릭 → **Copy link to selection**.
3. `ds-button.figma.ts` 의 `figma.connect("...")` 안 URL 을 복사한 링크로 바꾼다.

Claude Code 에게 맡기면 속성 이름·값이 코드와 맞는지까지 확인해 준다.

```
figma/code-connect/ds-button.figma.ts 의 URL 을 <FILE_URL> 의 ds-button Component Set 노드 링크로 바꾸고,
Figma 속성 이름과 enum 값이 실제 컴포넌트와 일치하는지 MCP 로 확인해서 고쳐줘.
같은 형식으로 ds-input, ds-card 용 파일도 만들어줘.
```

## 5-4. 게시하기

```bash
npm i -D @figma/code-connect
npx figma connect publish --token <FIGMA_ACCESS_TOKEN>
```

`<FIGMA_ACCESS_TOKEN>` 은 Figma 설정에서 만든 개인 토큰이다. 게시가 끝나면 Figma 에 코드 연결이 올라간다.

## 5-5. 확인한다

1. Figma 를 **Dev Mode** 로 바꾼다.
2. ds-button 인스턴스를 고른다.
3. 오른쪽 Code 패널에 `<ds-button variant="..." size="...">...</ds-button>` 이 보이면 성공이다. 연결 전의 추측 코드와 어떻게 다른지 비교한다.

## 이 장에서 한 것

- `figma.config.json` 과 `ds-button.figma.ts` 의 세 부분(노드 링크·속성 매핑·example)을 읽었다.
- Component Set 링크로 URL 을 바꾸고 ds-input·ds-card 매핑을 만들었다.
- 게시한 뒤 Dev Mode 에서 진짜 `<ds-button>` 코드가 나오는지 확인했다.

다음 **06장**에서는 이 컴포넌트를 React·Vue·순수 HTML 앱에서 실제로 쓴다.
