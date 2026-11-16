# 03. React 가 상태를 소유한다 — state-lab.tsx

`demo/state-lab.tsx` 를 연다. 02장의 스위치가 보낸 `ds-change` 를 받아, **켤지 말지를 정하는 쪽**이 여기다. 이 파일이 상태의 단일 공급원인 React 다.

## 3-1. React 가 쥔 상태

```ts
const [autopilot, setAutopilot] = useState(false);
const [locked, setLocked] = useState(false);
const [speed, setSpeed] = useState("12");
const [applying, setApplying] = useState(false);
```

자율운항 여부·잠금 여부·목표 속력·적용 중 여부를 **React 가 전부 쥔다.** 화면의 스위치·입력칸·버튼은 이 값을 받아 그릴 뿐이다.

## 3-2. 내려 주기 — state 를 props 로

```tsx
<Switch
  label="자율운항 모드"
  checked={autopilot}          // ← React state 를 props 로 내려 줌
  onDsChange={onAutopilotChange}
/>
```

`checked={autopilot}` 로 React 의 값을 스위치에 내려 준다. 01장의 "내려가는 방향"(React → Lit → HTML 속성)이 이 한 줄이다. `Switch` 는 `src/react/index.ts` 의 래퍼로, Lit 의 `ds-change` 이벤트를 React 식 이름 `onDsChange` 로 바꿔 준다.

## 3-3. 올라오는 이벤트를 받아 거부하거나 반영하기

스위치가 눌리면 `onAutopilotChange` 가 받는다.

```ts
const onAutopilotChange = (e: CustomEvent<{ checked: boolean }>) => {
  if (locked) {
    e.preventDefault();        // ← Lit 에게 "거부" 를 알림 → 스위치가 원래대로 돌아감
    push(`... 잠금 상태라 React 가 거부`);
    return;
  }
  setAutopilot(e.detail.checked);   // ← 허용하면 state 를 바꿈
  push(`... → setAutopilot`);
};
```

- **잠금 중이면** `e.preventDefault()` 를 부른다. 그러면 02장의 `toggle()` 에서 `dispatchEvent` 가 `false` 를 돌려받아 스위치를 **원래 값으로 되돌린다.**
- **잠금이 아니면** `setAutopilot(e.detail.checked)` 로 React state 를 바꾼다. 그러면 그 값이 다시 props 로 내려가 스위치가 그 상태로 확정된다.

핵심은 **켤지 말지의 결정이 오직 React 에 있다**는 것이다. 스위치는 "눌렸다" 만 알리고, 판단은 하지 않는다. 그래서 "잠금 중이면 거부" 같은 규칙을 React 한 곳에 둘 수 있다.

## 3-4. 다른 상태들도 같은 방식

- **목표 속력**: `value={speed}` 로 내려 주고, `onDsInput={(e) => setSpeed(e.detail.value)}` 로 받는다. 자율운항이 꺼져 있으면 `disabled={!autopilot}`, 값이 범위를 벗어나면 `invalid={... !speedValid}` 로 상태를 내려 준다.
- **적용 버튼**: `applying` 이 참이면 `loading`, 조건이 안 맞으면 `disabled` 를 내려 준다. 전부 React state 에서 나온다.

어느 것이든 **값은 React 가 쥐고, 컴포넌트는 받아 그린다.** 상태가 한 곳에서만 정해지니 화면이 서로 어긋나지 않는다.

> **📦 React 가 preventDefault 를 안 하고, 대신 state 만 안 바꾸면?**
>
> "잠금 중엔 `setAutopilot` 을 안 부르면 되지 않나" 싶을 수 있다. 하지만 02장의 스위치는 이벤트를 보내기 **전에 이미 낙관적으로 켜 둔** 상태다. React 가 state 만 그대로 두고 **거부를 안 알리면**, 스위치(화면)는 켜진 채로 남고 React 는 꺼졌다고 알아 **둘이 틀어진다.** `preventDefault()` 로 "되돌려라" 를 분명히 알려야 스위치가 원래대로 돌아온다. 거부는 state 를 안 바꾸는 것만으로는 안 되고, **이벤트로 되돌리라고 말해 줘야** 한다.

> **📦 래퍼(`onDsChange`) 없이 직접 이벤트를 달면?**
>
> `src/react/index.ts` 의 `Switch` 래퍼가 Lit 의 `ds-change` 를 React 의 `onDsChange` 로 이어 준다. 래퍼 없이 React 18 에서 `<ds-switch>` 에 직접 쓰면, 커스텀 이벤트와 `detail` 같은 객체 전달이 온전치 않아 손이 많이 간다(`addEventListener` 를 직접 달아야 한다). React 19 이상은 좀 낫지만 타입과 이벤트 이름 때문에 래퍼가 여전히 편하다. 자세한 것은 1강 교재 06장에 있다.

## 따라 하기

1. `npm run dev` → `http://localhost:5173/demo/react.html`.
2. 잠금을 끈 채로 자율운항을 켜 본다 → 오른쪽 ① React state 의 `autopilot` 이 `true` 로 바뀐다.
3. 잠금을 켜고 자율운항을 눌러 본다 → ④ 로그에 "거부" 가 뜨고 스위치가 돌아온다. ① state 는 그대로다.

## 이 장에서 한 것

- React 가 모든 상태를 쥐고 props 로 내려 준다는 것을 봤다.
- 올라온 `ds-change` 를 받아, 잠금이면 `preventDefault()` 로 거부하고 아니면 state 를 바꾸는 흐름을 봤다.
- 거부는 state 를 안 바꾸는 것으로 끝나지 않고 이벤트로 되돌려야 함을 봤다.

다음 **04장**에서는 오른쪽 관찰 패널(DOM 속성 ↔ Figma variant 표)이 어떻게 만들어지는지, 그리고 `pressed` 가 왜 거기 안 나오는지를 본다.
