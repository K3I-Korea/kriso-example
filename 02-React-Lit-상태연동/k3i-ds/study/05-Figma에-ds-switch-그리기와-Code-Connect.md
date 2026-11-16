# 05. Figma 에 ds-switch 그리기와 Code Connect

03·04장에서 본 `ds-switch` 를 Figma 에 Component Set 으로 그리고, Code Connect 로 코드와 잇는다. 여기서 핵심은 **내부 상태(`@state pressed`)를 Figma 에는 그리되 Code Connect 에는 잇지 않는다**는 점이다. 그 까닭을 이 장에서 확인한다.

## 5-1. ds-switch Component Set 만들기

Claude Code 에게 코드의 스타일을 읽어 그대로 그리게 한다(`<FILE_URL>` 은 실습용 `ds` 파일 주소).

```
<FILE_URL> 의 Components 페이지에 ds-switch Component Set 을 만들어줘.
src/components/ds-switch.ts 의 static styles 를 읽고 그대로 재현해.
- variant: checked(false/true) × state(default/pressed/disabled) = 6개
- Text 속성 label
- pressed 는 thumb 너비 24px, disabled 는 opacity 45%
- 색은 Semantic 변수에만 바인딩 (꺼짐 트랙 = border, 켜짐 트랙 = primary)
CLAUDE.md 매핑 표를 따르고, 다 만들면 6개 variant 이름을 나열해.
```

`ds-switch.ts` 와 맞춰 보면 variant 가 코드의 어떤 부분인지 보인다.

| Figma variant | 코드 |
|---|---|
| `checked` = false/true | `@property({ reflect: true }) checked` → `:host([checked]) button` 켜짐 색 |
| `state` = disabled | `@property({ reflect: true }) disabled` → `:host([disabled])` opacity 45% |
| `state` = pressed | `@state pressed` → `.thumb.pressed` 너비 24px |
| Text `label` | `@property() label` |

여섯 개를 다 그리는 것은 디자이너가 "이 상태에선 이렇게 보인다" 를 모두 그림으로 갖기 위해서다. `pressed` 모양도 그림으로는 있어야 한다.

## 5-2. Code Connect 로 잇기 — 그런데 `pressed` 는 뺀다

`figma/code-connect/ds-switch.figma.ts` 를 연다. 매핑하는 것은 **외부에서 제어하는 `@property` 둘(`checked`, `disabled`)뿐**이다.

```ts
props: {
  checked: figma.enum("checked", { true: true, false: false }),
  disabled: figma.enum("state", { disabled: true }),
  label: figma.string("label"),
},
example: ({ checked, disabled, label }) =>
  html`<ds-switch label=${label} checked=${checked} disabled=${disabled}></ds-switch>`,
```

`state` 중 `pressed` 는 **매핑하지 않는다.** 그래서 Figma 에서 `pressed` variant 를 골라도, Code Connect 가 돌려주는 코드 예시는 기본 상태로 나온다(의도된 동작).

> **📦 `pressed` 를 Code Connect 에 억지로 매핑하면?**
>
> `pressed` 는 Lit 내부의 `@state` 라, **코드에서 바깥이 지정할 방법이 없다.** `<ds-switch pressed>` 같은 속성은 존재하지 않는다(내부에서 포인터로만 켜진다). 그런데도 Code Connect 에 `pressed` 를 넣으면, Figma 가 "설정할 수 없는 속성을 설정하는" 거짓 코드를 내놓게 된다. 읽는 사람은 그 코드를 따라 쓰다가 "그런 속성이 없다" 는 것을 뒤늦게 알게 된다. 그래서 Code Connect 에는 **바깥이 실제로 줄 수 있는 `@property` 만** 잇는다. 그림(Figma variant)은 6개 다 있어도, 코드로 잇는 것은 넷(`checked`·`disabled`·`label`, 그리고 기본)뿐이다.

## 5-3. 확인한다 (따라 하기)

1. Code Connect 를 게시한다(플랜이 되면). `npm i -D @figma/code-connect` 로 깔고 `npx figma connect publish --token <FIGMA_ACCESS_TOKEN>` 로 올린다(Organization/Enterprise 플랜 필요). 1강 05장의 Code Connect 와 같은 방식이다.
2. Figma 를 **Dev Mode** 로 바꾸고 ds-switch 인스턴스를 고른다.
3. `checked`·`disabled` 를 바꾸면 Code 패널의 `<ds-switch ...>` 코드가 따라 바뀐다.
4. `state` 를 `pressed` 로 바꿔 본다. → 그림은 바뀌지만 **코드 예시는 그대로**다. 5-2 에서 설명한 그 동작이다.

게시 플랜이 안 되면 `ds-switch.figma.ts` 매핑 파일을 읽고 구조만 이해해도 된다.

## 이 장에서 한 것

- `ds-switch` Component Set 6개 variant 를 그리고, 각 variant 가 코드의 `@property`·`@state` 어디인지 맞췄다.
- Code Connect 에 `checked`·`disabled`·`label` 만 잇고, 내부 상태 `pressed` 는 뺀 까닭을 봤다.

다음 **06장**에서는 방향을 뒤집어, Figma 에서 새 상태를 추가하고 그것을 코드로 되읽는다.
