# 04. 패널 (Block 층)

Block(블록, 계기·프리미티브를 조합해 만든 K3I 패널 한 종류)은 6계층의 가운데에 있다. 아래의 Instrument(계기, OpenBridge 가 제공하는 완성 계기 — 나침반·타각계·수치 표시)를 조합해 "제목 + 상태 + 본문" 을 갖춘 패널을 만든다. 이 장에서는 패널이 어떻게 생겼는지 읽고, 새 패널 종류를 만드는 절차를 본다.

## 4-1. 패널 종류는 `design/panels.json` 이 정한다

`design/panels.json` 을 연다. 지금 패널은 세 종류다.

| 키 | tag | roles | 무엇 |
|---|---|---|---|
| `value` | `k3i-value-panel` | `value` | 수치 1개 (OpenBridge `obc-readout`) |
| `heading` | `k3i-heading-panel` | `hdg`, `cog`, `sog` | 나침반 + 침로·대지침로·대지속력 (`obc-compass`) |
| `rudder` | `k3i-rudder-panel` | `angle` | 타각계 (`obc-rudder`) |

`roles` 는 화면 구성(View, 05장)에서 이 패널에 **어떤 신호 역할을 연결해야 하는지**를 적어 둔 것이다. 예를 들어 `value` 패널은 `value` 역할 하나를 연결받아야 하고, `heading` 패널은 `hdg`·`cog`·`sog` 셋을 받아야 한다.

## 4-2. 모든 패널의 뼈대 — `K3iPanel`

`src/ds/base/k3i-panel.ts` 를 연다. 모든 K3I 패널이 상속하는 추상 기반 클래스다. 핵심만 짚는다.

**① 속성 세 개.** 데이터 계층에서 내려 준 값을 받는다.

```ts
@property() heading = "";                              // 패널 제목
@property({ reflect: true }) state: StateName = "invalid";  // 상태 6종 (Figma variant 와 1:1)
@property({ attribute: "state-text" }) stateText = "";      // 상태 배지 문구
```

**② 상태를 "형태" 로 바꾼다.** `state` 가 바뀌면 `updated()` 에서 `states.json` 의 `shape` 를 HTML 속성으로 반영하고, 상태 색을 `--state-color` 에 넣는다.

```ts
protected updated(changed: PropertyValues) {
  if (changed.has("state")) {
    const def = STATES[this.state];
    this.setAttribute("shape", def?.shape ?? "none");
    this.style.setProperty("--state-color", `var(--k3i-color-${def?.token ?? "text"})`);
  }
}
```

그러면 CSS 의 형태 규칙이 켜진다. `states.json` 의 `shape` 값과 글자 그대로 짝이다.

```css
:host([shape="dashed-border"]) .frame { border: var(--k3i-stroke-state) dashed var(--state-color); }
:host([shape="dim-value"])    .body  { opacity: 0.45; }
:host([shape="strong-border"]) .frame { border: var(--k3i-stroke-state) solid var(--state-color); }
:host([shape="left-bar"])     .frame::before { /* 왼쪽 세로 막대 */ }
```

**③ 색은 토큰만 쓴다.** `K3iPanel` 의 CSS 에는 `#hex` 가 하나도 없다. 전부 `var(--k3i-*)` 다(02장 토큰 층). "각 층은 바로 아래 층만 쓴다" 는 규칙을 코드로 지킨 것이다.

**④ 본문은 하위 클래스가 그린다.** `render()` 가 제목·배지·본문·액션 틀을 그리고, 본문 자리는 `renderBody()` 라는 추상 메서드로 비워 둔다. 각 패널이 이것만 구현한다.

```ts
protected abstract renderBody(): TemplateResult;
```

## 4-3. 실제 패널 하나 — `k3i-value-panel`

`src/ds/k3i-value-panel.ts` 를 연다. `K3iPanel` 을 상속하고 `renderBody()` 만 채운다.

```ts
@customElement("k3i-value-panel")
export class K3iValuePanel extends K3iPanel {
  @property({ type: Number }) value: number | null = null;
  @property() unit = "";
  ...
  protected renderBody() {
    return html`<obc-readout .value=${this.value} .unit=${this.unit} ...></obc-readout>`;
  }
}
```

본문에 OpenBridge 의 `obc-readout`(수치 표시 계기)을 그대로 쓴다. 계기는 `@oicl/openbridge-webcomponents/dist/...` 에서 import 한다. **OpenBridge 계기는 고치지 않고 조합만 한다.** 미확인 경보 패널을 누르면 `k3i-ack` 이벤트를 쏘는데, 확인 여부(`acked`)는 패널이 아니라 앱이 쥔다.

## 4-4. 이름을 실제 컴포넌트로 바꾸는 사전 — `registry.tsx`

`src/view/registry.tsx` 를 연다. `views/*.json` 의 `"panel": "value"` 같은 **문자열**을 실제 React 컴포넌트로 바꾸는 사전이다. 여기서 `roles` 를 패널 속성으로 풀어 넘긴다.

```tsx
export const REGISTRY = {
  value:   ({ spec, signals, ... }) => <ValuePanel value={signals.value?.value ?? null} ... />,
  heading: ({ spec, signals }) => { const w = worst([signals.hdg, signals.cog, signals.sog]); ... },
  rudder:  ({ spec, signals }) => <RudderPanel angle={signals.angle?.value ?? null} ... />,
};
```

여러 신호를 받는 패널(`heading`)은 `worst()` 로 **우선순위가 가장 높은 상태 하나만** 표시한다. 그리고 파일 끝에서 **선언(`panels.json`)과 사전(`REGISTRY`)이 어긋나면 시작할 때 바로 알린다**(한쪽에만 있는 이름을 `console.error` 로 짚는다).

## 4-5. 새 패널 종류 만들기 (CLAUDE.md 4절)

새 패널이 필요하면 다섯 곳을 함께 고친다. 순서가 중요하다.

1. **`src/ds/k3i-<name>-panel.ts`** — `K3iPanel` 을 상속하고 `renderBody()` 만 구현한다. OpenBridge 계기는 `@oicl/openbridge-webcomponents/dist/...` 에서 import 한다.
2. **`src/ds/index.ts`** 에 export 를 넣고, **`src/ds/react.ts`** 에 React 래퍼를 더한다.
3. **`design/panels.json`** 에 `tag` 와 `roles` 를 추가한다.
4. **`src/view/registry.tsx`** 에 렌더 함수를 등록한다(roles → props).
5. **Figma** 에 `k3i-<name>-panel` Component Set 을 만든다(`state` variant 6개).

> **📦 `K3iPanel` 을 상속하지 않고 패널을 만들면?**
>
> `K3iPanel` 을 상속하면 상태 6종 표현(테두리·흐린 본문·배지·왼쪽 막대)을 **그냥 얻는다.** 상속하지 않고 패널을 직접 만들면, 그 여섯 형태와 상태 색·배지 문구를 패널마다 새로 다 짜야 하고, 나중에 `states.json` 의 규칙을 바꿔도 그 패널만 안 따라온다. 그래서 새 패널은 반드시 `K3iPanel` 을 상속하고 `renderBody()` 만 채운다. 실제로 "통신 끊김" 시나리오를 켜 보면, 상속만으로 그 패널이 `stale`(갱신 없음) 표시를 바로 내는지 확인할 수 있다.

> **📦 패널이 상태를 직접 판단하면?**
>
> 패널 안에 "값이 440 을 넘으면 경보색" 같은 판단 코드를 넣으면 안 된다. 상태는 `src/domain/signal.ts` 한 곳에서만 정하고, 패널은 **받은 `state` 를 그리기만** 한다(04-2 의 속성). 판단을 패널마다 두면 같은 규칙이 곳곳에 흩어져 서로 틀어지고, `states.json`·`signals.json` 을 바꿔도 화면이 안 따라온다. 03장에서 본 "계기는 판단하지 않는다" 가 이 규칙이다.

## 따라 하기

1. `npm run dev` 로 화면을 연다.
2. 아무 수치 패널에서 오른쪽 클릭 → 검사(Inspect). `k3i-value-panel` 의 `shape` 속성과 안쪽 `obc-readout` 을 찾아 4-2·4-3 과 맞대어 본다.
3. 오른쪽 시나리오 토글로 "통신 끊김" 을 켜고, 패널의 `state` 가 `stale` 로, `shape` 가 `dim-value` 로 바뀌는지 본다.

## 이 장에서 한 것

- 패널 종류를 `panels.json` 이 정하고, `roles` 가 연결할 신호 역할을 적어 둔 것을 봤다.
- `K3iPanel` 이 제목·배지·상태 형태를 맡고, 각 패널은 `renderBody()` 로 OpenBridge 계기만 조합하는 구조를 읽었다.
- `registry.tsx` 가 이름을 컴포넌트로 바꾸고, 선언과 어긋나면 알린다는 것을 봤다.
- 새 패널 종류를 만드는 다섯 단계를 봤다.

다음 **05장**에서는 이 패널들을 어느 레이아웃의 어느 칸에 놓을지 정하는 Layout·View 층을 다룬다.
