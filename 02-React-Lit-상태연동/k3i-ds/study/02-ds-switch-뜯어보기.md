# 02. ds-switch 뜯어보기 — 상태 세 종류를 한 컴포넌트에

`src/components/ds-switch.ts` 를 연다. 이 스위치 하나가 상태의 **세 종류**를 모두 보여 준다. 공개 상태 둘(`@property`)과 내부 전용 상태 하나(`@state`), 그리고 **취소 가능한 이벤트** 다.

## 2-1. 공개 상태 — `@property` (바깥이 소유·제어)

```ts
@property({ type: Boolean, reflect: true }) checked = false;
@property({ type: Boolean, reflect: true }) disabled = false;
```

- `checked`·`disabled` 는 **바깥(React)이 내려 주는** 상태다. `reflect: true` 라서 값이 바뀌면 HTML 속성으로 나간다(`<ds-switch checked>`).
- 그 덕분에 CSS 선택자 `:host([checked]) button { background: var(--ds-semantic-primary); }` 가 맞아 켜진 색이 되고, Figma variant `checked=true` 와도 짝을 이룬다(01장).

## 2-2. 내부 전용 상태 — `@state` (바깥에 감춤)

```ts
@state() private pressed = false;
```

- `pressed` 는 "지금 누르고 있는가" 다. `@state` 는 **컴포넌트 내부 전용**이라, 값이 바뀌면 다시 그리기만 하고 **HTML 속성으로 나가지 않는다.**
- 그래서 누르는 동안 thumb 이 늘어나지만(`.thumb.pressed { width: 24px; }`), 00장에서 본 대로 **관찰 표(DOM 속성)에는 안 나타난다.**
- `pressed` 는 `pointerdown` 에 `true`, `pointerup`·`pointerleave` 에 `false` 로 바뀐다(render 의 이벤트 핸들러).

`@property` 와 `@state` 의 차이가 2강의 핵심이다. 바깥이 제어할 상태는 `@property`(공개), 컴포넌트가 혼자 쓰는 상태는 `@state`(비공개)다.

> **📦 `pressed` 를 `@state` 가 아니라 `@property` 로 두면?**
>
> `pressed` 를 `@property({ reflect: true })` 로 바꾸면, "누르는 중" 이라는 **내부 사정이 HTML 속성으로 공개되어** 바깥 API 가 되어 버린다. 그러면 React 가 `pressed` 를 내려 줄 수 있다고 오해하게 되고(실제로는 포인터가 정하는 값), 관찰 표와 Figma 매핑에도 불필요하게 끼어든다. 더구나 포인터가 움직일 때마다 React 까지 다시 그리게 만들 수 있다. 내부에서만 쓰는 상태는 `@state` 로 감춰 **공개 API 를 깔끔하게** 둔다. 그래서 05장에서 `pressed` 는 Code Connect 에 매핑하지 않는다.

## 2-3. 취소 가능한 `ds-change` 이벤트 — 거부를 받아들이는 설계

스위치의 핵심은 `toggle()` 이다. 눌렸을 때 **먼저 바꾸고, 부모에게 물은 뒤, 거부하면 되돌린다.**

```ts
private toggle(e: Event) {
  e.preventDefault();
  if (this.disabled) return;

  const previous = this.checked;
  this.checked = !previous;              // ① 먼저 낙관적으로 바꾸고

  const ev = new CustomEvent("ds-change", {
    detail: { checked: this.checked },
    bubbles: true, composed: true,
    cancelable: true,                     // ← 부모가 거부할 수 있게
  });
  if (!this.dispatchEvent(ev)) this.checked = previous;  // ② 거부하면 ③ 되돌림
}
```

순서가 중요하다.

1. **먼저 바꾼다**(낙관적). 사용자는 누르면 바로 반응하는 것을 본다.
2. `ds-change` 를 **`cancelable: true`** 로 보낸다. 부모(React)가 받는다.
3. `dispatchEvent` 는 부모가 `preventDefault()` 를 불렀으면 `false` 를 돌려준다. 그러면 **원래 값으로 되돌린다.**

00장에서 원격 잠금을 켜고 눌렀을 때 스위치가 잠깐 켜졌다 돌아온 것이 이 흐름이다. 거부 여부는 React 가 정한다(03장).

> **📦 `cancelable` 과 거부 검사가 없으면? — 잠금이 듣지 않는다**
>
> `toggle()` 에서 `cancelable: true` 를 빼거나 `dispatchEvent` 반환값을 검사하지 않으면, 스위치는 **눌리는 대로 무조건 켜진다.** React 가 "잠금 중이니 거부" 라고 해도 스위치는 그 말을 듣지 못한다. 그러면 화면의 스위치와 React state 가 틀어진다(스위치는 켜졌는데 React 는 안 켜졌다고 안다). 취소 가능한 이벤트 + 반환값 검사가 **거부를 성립시키는 장치**다. 직접 지워서 돌려 보면 잠금이 안 먹는 것을 확인할 수 있다(`figma/LESSONS.md` L8 의 마지막 질문).

## 2-4. 폼 값도 맞춘다 (보충)

```ts
protected updated(changed) {
  if (changed.has("checked")) this.internals.setFormValue(this.checked ? "on" : null);
}
```

`checked` 가 내부 클릭으로 바뀌든 React 가 내려 줘서 바뀌든, 어느 방향이든 바깥 `<form>` 의 값을 맞춘다(`static formAssociated = true` + `attachInternals()`). 폼 연동은 1강 교재 03장에서 다뤘다.

## 따라 하기

1. `npm run dev` → `http://localhost:5173/demo/react.html`.
2. 자율운항 스위치를 누르고 있어 본다. thumb 이 늘어나는지, 그런데 오른쪽 ② 표에는 안 나오는지 본다(`@state pressed`).
3. 원격 잠금을 켜고 자율운항을 눌러, 잠깐 켜졌다 돌아오는지 본다(취소 가능한 `ds-change`).

## 이 장에서 한 것

- `@property`(공개, reflect)와 `@state`(내부 전용, 비공개)의 차이를 코드로 봤다.
- `pressed` 가 HTML 속성으로 안 나가는 까닭을 봤다.
- `toggle()` 의 "먼저 바꾸고 → 알리고 → 거부하면 되돌림" 흐름과 `cancelable` 의 역할을 봤다.

다음 **03장**에서는 이 이벤트를 받아 상태를 정하는 React 쪽(`state-lab.tsx`)을 본다.
