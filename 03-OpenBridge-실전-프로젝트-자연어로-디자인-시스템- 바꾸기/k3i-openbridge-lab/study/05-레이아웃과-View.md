# 05. 레이아웃과 View — 화면 구성

패널을 만들었으면(04장), 이제 **어느 레이아웃의 어느 칸에 어떤 패널을 어떤 신호로 채울지**를 정한다. 이 둘이 Layout 층과 View 층이고, 둘 다 코드가 아니라 선언(JSON)으로 바꾼다.

## 5-1. Layout — 칸 배치는 `design/layouts.json`

`design/layouts.json` 을 연다. CSS 의 `grid-template-areas` 로 화면을 몇 줄 몇 칸으로 나눌지 정한다.

```json
"l1-grid": {
  "columns": "1.4fr 1fr 1fr",
  "rows": "1fr 1fr 1fr",
  "areas": [
    "primary secondary kpi-1",
    "primary secondary kpi-2",
    "primary tertiary  kpi-3"
  ]
}
```

- `areas` 의 한 칸 이름(`primary`·`secondary`·`kpi-1` …)이 **슬롯 이름**이다. 같은 이름이 가로·세로로 이어지면 그만큼 넓은 칸이 된다(`primary` 는 왼쪽 세 줄을 다 차지한다).
- 이 슬롯 이름은 **세 곳에서 글자 그대로 같아야 한다**: `layouts.json` 의 칸 이름, `views/*.json` 의 `slots` 키, 그리고 Figma 의 슬롯 프레임 이름.

## 5-2. View — 무엇을 채울지는 `design/views/*.json`

`design/views/overview.json` 을 연다. 어떤 레이아웃을 쓰고, 각 슬롯에 어떤 패널을 어떤 신호로 채우는지 선언한다.

```json
{
  "id": "overview",
  "title": "항해 개요",
  "layout": "l1-grid",
  "slots": {
    "primary": { "panel": "heading", "title": "침로", "bind": { "hdg": "hdg", "cog": "cog", "sog": "sog" } },
    "kpi-1":   { "panel": "value",   "title": "주기관 회전수", "bind": { "value": "rpm" } },
    ...
  }
}
```

- `layout`: 5-1 의 레이아웃 이름.
- `slots.<이름>.panel`: 그 칸에 놓을 패널 종류(`panels.json` 의 키, 04장).
- `slots.<이름>.bind`: 패널의 **역할(role) → 신호 id**. `heading` 패널은 `hdg`·`cog`·`sog` 역할이 필요하고(04장 `roles`), 여기서 각 역할에 실제 신호를 연결한다.

화면 한 개가 JSON 파일 한 개다. `design/views/engine.json`(기관 상세)은 다른 레이아웃(`l2-split`)을 쓴다.

## 5-3. JSON 을 화면으로 조립하는 코드 — `ViewRenderer.tsx`

`src/view/ViewRenderer.tsx` 를 연다. 이 파일이 View 선언을 읽어 화면으로 조립한다.

- `<Layout layout={view.layout}>` 으로 레이아웃을 깔고(= `layouts.json` 의 그 칸 배치를 적용),
- 슬롯마다 `REGISTRY[panel]`(04장)로 패널을 그린다. 패널은 `slot={slot}` 을 달고 나오므로, 그 이름의 grid 칸에 가서 앉는다.

맨 위 주석이 못 박아 둔다: **화면 구성을 바꾸려면 이 파일이 아니라 `design/views/*.json` 을 고친다.**

화면 목록(탭)은 `src/domain/catalog.ts` 가 `import.meta.glob` 으로 `design/views/*.json` 을 **모두 자동으로 읽어** 만든다. 그래서 새 화면은 JSON 파일 하나만 추가하면 탭에 나타난다.

## 5-4. "개요 화면 오른쪽에 칸 하나 더" — 어디를 고치나

자연어 요청 하나가 Layout·View 두 파일로 끝나는 예다.

1. `layouts.json` 의 `l1-grid` 를 4열로 바꾸고 `areas` 에 `kpi-4` 를 넣는다.
2. `views/overview.json` 의 `slots` 에 `kpi-4` 를 더하고 신호를 연결한다.
3. `npm run check` 로 칸 수·슬롯 이름이 맞는지 확인한다(06장).

코드(`ViewRenderer.tsx`·`registry.tsx`)는 **한 줄도 안 고친다.**

> **📦 화면을 바꾸려고 `ViewRenderer.tsx`(코드)를 고치면?**
>
> 화면 구성은 코드가 아니라 `design/views/*.json` 으로 바꾼다. 코드를 직접 고치면, 선언(JSON)과 실제 화면이 따로 놀아 "선언이 진실 공급원" 이라는 전제가 틀어진다. 검사기(`npm run check`)도 선언만 보므로 코드에 숨은 변경은 못 막는다. 그래서 바꿀 수 있는 것은 전부 선언으로 빼 두었다. 코드를 고쳐야 하는 경우는 "새 패널 종류" 나 "새 상태 형태" 처럼 선언만으로 안 되는 드문 때뿐이다(04장, 03장).

> **📦 슬롯 이름을 layout·view·Figma 에서 다르게 쓰면?**
>
> 슬롯 이름은 세 곳에서 **글자 그대로** 같아야 한다. `layouts.json` 의 `areas` 가 `kpi-1` 인데 `views/*.json` 이 `kpi1` 로 적으면, 그 패널이 어느 칸에 앉을지 못 찾는다. `npm run check` 가 "슬롯 X 는 이 레이아웃에 없습니다 (가능: …)" 로 막아 준다(06장). Figma 프레임 이름까지 같아야 디자인과 코드가 이어진다(07장).

## 따라 하기

1. `npm run dev` 상태에서 화면 위쪽 탭으로 "항해 개요" 와 "기관 상세" 를 오간다. 두 화면이 쓰는 레이아웃이 어떻게 다른지 본다.
2. `design/views/engine.json` 의 어느 슬롯 `title` 을 바꿔 저장하고, 화면이 바뀌는지 본다(코드는 안 고쳤다).
3. `design/views/` 에 JSON 파일을 하나 복사해 `id` 를 바꿔 저장하면, 탭에 새 화면이 나타나는지 본다.

## 이 장에서 한 것

- `layouts.json` 이 `grid-template-areas` 로 칸을, `views/*.json` 이 그 칸에 들어갈 패널·신호를 정하는 것을 봤다.
- 슬롯 이름이 layout·view·Figma 에서 같아야 하는 까닭을 봤다.
- `ViewRenderer.tsx` 는 선언을 읽기만 하고, 화면은 JSON 으로 바꾼다는 규칙을 확인했다.
- 화면 파일 하나를 추가하면 탭에 자동으로 나타나는 것을 봤다.

다음 **06장**에서는 이 선언들을 바꾼 뒤 반드시 돌리는 검사기(`npm run check`)와 변경 절차를 다룬다.
