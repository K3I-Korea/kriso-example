# 04. DOM 속성과 Figma variant 실시간으로 보기

2강의 실습 화면을 열어, React 상태가 바뀔 때 **Lit 이 반영한 DOM 속성**과 그에 대응하는 **Figma variant** 가 어떻게 실시간으로 따라 바뀌는지 눈으로 본다. 상태가 세 층(React → Lit → Figma)으로 흐르는 것을 화면에서 확인하는 장이다.

## 4-1. 실습 화면 열기

```bash
npm run dev    # → http://localhost:5173/demo/react.html
```

화면은 둘로 나뉜다.

- **왼쪽 — 자율운항 제어 패널**: 자율운항 스위치, 원격 잠금 스위치, 목표 속력 입력칸, 초기화·적용 버튼.
- **오른쪽 — 상태 관찰**: ① React state, ② Lit 이 반영한 DOM 속성 → ③ Figma variant, ④ 이벤트 로그.

## 4-2. 오른쪽 "②③ 표" 가 보여 주는 것

`demo/state-lab.tsx` 의 `useAttributes` 훅이 `MutationObserver` 로 각 컴포넌트의 **실제 HTML 속성**을 읽는다. 그래서 ②열은 상상이 아니라 **Lit 이 `reflect` 로 내보낸 결과 그대로**다. ③열은 `toFigma` 매핑으로 그 DOM 속성을 Figma variant 이름으로 바꾼 것이다.

`toFigma` 매핑은 코드에 이렇게 적혀 있다(`CLAUDE.md` 의 이름 규칙과 같다).

| 컴포넌트 | DOM 속성 | → Figma variant |
|---|---|---|
| `ds-switch` | `checked` 있음/없음, `disabled` 있음 | `checked`=true/false, `state`=disabled 또는 default |
| `ds-input` | `disabled`·`invalid` 있음 | `state`=disabled / invalid / default |
| `ds-button` | `variant`·`size`, `loading`·`disabled` 있음 | `variant`, `size`, `state`=loading / disabled / default |

왼쪽을 조작할 때마다 이 표가 실시간으로 바뀐다. **코드의 상태 → 화면의 디자인 → Figma 의 variant 가 한 줄로 이어진다**는 것을 눈으로 보는 것이 이 표의 목적이다.

## 4-3. 직접 조작해 보기 (따라 하기)

1. **자율운항 스위치**를 켠다. → ② 에 `checked` 가 나타나고 ③ 이 `checked=true` 로 바뀐다. ① React state 의 `autopilot` 도 `true` 다.
2. **목표 속력**에 `40` 을 넣는다(0~30 범위 밖). → ② 에 `invalid` 가 붙고 ③ 이 `state=invalid` 로 바뀐다. 입력칸이 빨갛게 된다.
3. **적용** 버튼을 누른다. → 1.2초 동안 ③ 이 `state=loading` 이 되고 버튼에 도는 표시가 나온다(`applying` 상태).
4. **스위치를 누른 채로 있어** 본다. → 움직이는 원(thumb)이 살짝 늘어난다. 그런데 **② 표는 그대로다.** 다음 절이 그 까닭이다.

(원격 잠금을 켜고 자율운항을 토글하면 React 가 거부하는 동작은 **03장**에서 자세히 다룬다.)

## 4-4. `pressed` 는 왜 표에 안 나오나

스위치를 누르는 동안 늘어나는 thumb 은 `ds-switch.ts` 의 **`@state pressed`** 다. 이 값은 DOM 속성으로 **내보내지 않는다**(`@property` 와 달리 `reflect` 가 없다). ② 표는 `MutationObserver` 로 **HTML 속성만** 읽으므로, 속성이 아닌 `pressed` 는 애초에 볼 수가 없다. 이것은 버그가 아니라 **공개 상태와 내부 상태를 가르는 설계**가 그대로 드러난 것이다.

> **📦 관찰 표에 `pressed` 가 안 보이는 게 버그 아닌가?**
>
> 아니다. 일부러 그렇게 둔 것이다. `pressed` 는 "지금 누르고 있다" 는 **컴포넌트 내부 사정**이라, 바깥(React·Figma·폼)이 알 필요가 없다. 그래서 `@state` 로 두어 DOM 속성으로 내보내지 않는다. 만약 이것을 `@property({ reflect: true })` 로 바꾸면 `pressed` 가 HTML 속성으로 새어 나가 ② 표·③ Figma variant 에까지 나타나고, 포인터를 누를 때마다 속성이 바뀌어 불필요한 변화가 쏟아진다. "바깥이 알아야 하는 것(`checked`·`disabled`)은 `@property`, 내부 사정(`pressed`)은 `@state`" 라는 가름이 여기서 눈에 보인다.

## 이 장에서 한 것

- `demo/react.html` 실습 화면에서 React state → DOM 속성 → Figma variant 가 실시간으로 이어지는 것을 봤다.
- `useAttributes`(MutationObserver)가 `reflect` 된 속성만 읽고, `toFigma` 가 그것을 variant 이름으로 바꾸는 것을 확인했다.
- `@state pressed` 가 표에 안 나오는 까닭(내부 상태는 DOM 속성으로 노출하지 않음)을 봤다.

다음 **05장**에서는 이 `ds-switch` 를 Figma 에 그리고 Code Connect 로 잇는다.
