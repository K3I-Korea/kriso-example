# 06. 역방향 — Figma 에서 상태 추가 → 코드 반영

지금까지는 코드 → Figma 방향이었다. 이 장에서는 **디자이너가 Figma 에서 새 상태를 추가**하고, 그것을 코드로 되읽는다. 토큰·컴포넌트·상태가 한 번에 연결되는 것을 끝으로 확인한다.

## 6-1. 상황

적용이 끝났을 때 버튼이 잠깐 **초록색 "완료"** 로 보이면 좋겠다고 하자. 디자이너가 Figma 에서 먼저 그린다.

1. Figma 에서 `ds-button` Component Set 에 `state=success` variant 를 직접 추가한다(초록 배경, 체크 아이콘).

이제 코드에는 없는 상태가 Figma 에만 생겼다. 이것을 코드로 가져온다.

## 6-2. 코드로 되읽기

Claude Code 에게 이렇게 시킨다.

```
Figma 의 ds-button Component Set 을 읽어서 코드에 없는 variant 를 찾아줘.
있으면 ds-button.ts 에 해당 @property 와 스타일을 추가하고,
demo/state-lab.tsx 의 toFigma 매핑과 "적용 완료" 후 1초간 success 상태를 보여주는 로직을 추가해.
색은 tokens.json 에 semantic.success 토큰을 먼저 만들고 그걸 써.
```

이 한 번의 요청이 세 층을 모두 건드린다.

| 층 | 바뀌는 곳 | 무엇 |
|---|---|---|
| 토큰 | `tokens/tokens.json` | `semantic.success` 를 **먼저** 만든다(원시 색 alias) |
| 컴포넌트 | `src/components/ds-button.ts` | `state=success` 용 `@property`·스타일(`var(--ds-semantic-success)`) |
| 상태 | `demo/state-lab.tsx` | `toFigma` 매핑에 success 추가, "적용 완료" 뒤 1초간 success 로 보이는 로직 |

## 6-3. 왜 토큰부터 만드나

> **📦 색을 `#2f9e44` 처럼 바로 넣으면 안 되나?**
>
> 안 된다. 컴포넌트에 색을 직접 적으면(색 리터럴), 다크 테마에서 그 색이 따라 바뀌지 않고, 나중에 "완료 색을 바꿔 달라" 는 요청이 오면 그 색을 적은 곳을 모두 찾아 고쳐야 한다. 그래서 **먼저 `tokens.json` 에 `semantic.success` 를 만들고**(2강이 쓰는 원시 색 하나를 가리키게 한다), 컴포넌트는 `var(--ds-semantic-success)` 만 쓴다. 디자인 값은 한 곳에만 둔다는 2강 전체의 원칙이 역방향 작업에도 그대로 적용된다. 토큰을 먼저 만들고 `npm run tokens` 를 돌린 뒤에 컴포넌트를 고친다.

## 6-4. 확인한다 (따라 하기)

1. 위 요청대로 토큰 → 컴포넌트 → 상태를 고친다.
2. `npm run tokens` 로 토큰을 다시 만든다.
3. `npm run dev` → `http://localhost:5173/demo/react.html`.
4. 자율운항을 켜고 속력을 정상 범위로 넣은 뒤 **적용**을 누른다. → 적용이 끝나면 버튼이 1초간 success 로 보인다.
5. **다크 테마**에서도 success 색이 제대로 나오는지 본다(토큰을 거쳤으니 따라와야 한다).

## 이 장에서 한 것

- Figma 에서 추가한 `state=success` 를 코드로 되읽어, 토큰(`semantic.success`)·컴포넌트(`ds-button`)·상태(`state-lab`)를 한 번에 연결했다.
- 역방향 작업에서도 "색은 토큰부터" 라는 원칙을 지키는 까닭을 봤다.

## 2강을 마치며

같은 "상태" 가 Figma variant·Lit 속성·React state 세 곳에서 다른 이름으로 살고, 그 소유자는 하나(React)이며, 거부(`preventDefault`)와 내부 상태(`@state`)를 어떻게 다루는지를 한 바퀴 돌았다. 더 깊은 참고는 `figma/LESSONS.md` 의 L8, 그리고 `CLAUDE.md` 의 매핑 표에 있다.
