# 04. Figma 에 컴포넌트 그리기

03장에서 읽은 Lit 컴포넌트와 **똑같은 모양·똑같은 이름**으로 Figma 에 컴포넌트를 만든다. 이름을 글자 그대로 맞춰 두면, 05장의 Code Connect 와 MCP 가 Figma 속성과 코드 속성을 자동으로 대응시킬 수 있다. 이 장은 Claude Code 에게 그리게 하되, 무엇을 확인해야 하는지에 초점을 둔다.

## 4-1. 왜 이름을 맞추나

Figma 의 **Component Set** 은 변형(variant)을 묶은 것이고, 그 variant 속성은 Lit 의 `@property({ reflect: true })` 속성과 짝을 이룬다. 같은 "상태"가 두 곳에서 다른 이름이면 사람이 매번 손으로 맞춰야 한다. 이름을 글자 그대로(대소문자까지) 맞추면 자동으로 이어진다.

`CLAUDE.md` 의 "컴포넌트 매핑 표" 가 그 약속이다. Claude Code 는 이 표를 자동으로 읽으므로, 지시문에서 매번 되풀이하지 않아도 된다.

| Lit 컴포넌트 | Figma Component Set | variant 속성 | 기타 속성 |
|---|---|---|---|
| `<ds-button>` | `ds-button` | `variant`: primary·secondary·ghost·danger / `size`: sm·md·lg / `state`: default·hover·disabled·loading | Text `label`, Boolean `iconStart` |
| `<ds-input>` | `ds-input` | `state`: default·focus·invalid·disabled | Text `label`, `placeholder`, `helpText`, Boolean `required` |
| `<ds-card>` | `ds-card` | `elevated`: false·true | 슬롯은 Auto layout 프레임 `header`/`body`/`footer` |

## 4-2. 먼저 토큰 문서를 그려 본다 (Foundations)

컴포넌트에 앞서, 02장에서 올린 토큰을 눈으로 보는 문서를 만들면 Figma 쪽 변수가 제대로 올라갔는지 확인하기 좋다. Claude Code 에게(`<FILE_URL>` 은 01장의 `ds` 파일 주소):

```
<FILE_URL> 의 Foundations 페이지에 디자인 토큰 문서를 그려줘.
- Color: Semantic 변수마다 스와치(48x48) + 변수 이름 + Code syntax 텍스트. Light/Dark 두 프레임을 나란히, 각 프레임에 해당 모드 적용
- Spacing: space/* 변수 값만큼의 가로 막대
- Radius: radius/* 를 적용한 사각형
- Typography: ds/title, ds/label, ds/body 텍스트 스타일 샘플
모든 fill·간격·반경은 숫자 대신 변수에 바인딩하고 Auto layout 을 써.
```

**확인**: Dark 프레임을 고르고 오른쪽 패널에서 모드가 `Semantic: Dark` 인지 본다. 원시 색 하나를 바꾸면 스와치가 함께 바뀌는지 본다(02장의 별칭 구조가 Figma 에서도 동작하는지 확인).

## 4-3. ds-button Component Set 만들기

Claude Code 에게 코드의 스타일을 읽어 그대로 그리게 한다.

```
<FILE_URL> 의 Components 페이지에 ds-button Component Set 을 만들어줘.
src/components/ds-button.ts 의 static styles 를 읽고 시각적으로 똑같이 재현해.
- variant 속성: variant(primary/secondary/ghost/danger) × size(sm/md/lg) × state(default/hover/disabled/loading)
- Text 속성 label, Boolean 속성 iconStart
- 높이: sm 32 / md 40 / lg 48, 패딩·반경·gap 은 Primitives 변수에 바인딩
- 색은 Semantic 변수에만 바인딩, 텍스트는 ds/label 스타일
- disabled 는 opacity 45%
CLAUDE.md 의 컴포넌트 매핑 표를 지켜.
```

이어서 `ds-input`, `ds-card` 도 같은 방식으로 만든다. 지시문에서 컴포넌트 이름과 파일 경로만 바꾸면 된다.

**반드시 지킬 두 규칙** (CLAUDE.md 에도 적혀 있다):

- 모든 레이아웃은 **Auto layout**, 간격·패딩·반경은 **변수 바인딩**(숫자 직접 입력 금지).
- 색 fill·stroke 는 **Semantic 변수만** 바인딩(Primitives 직접 바인딩 금지).

## 4-4. 내부 상태는 그리되 코드와 구분한다

03장에서 본 대로, 어떤 상태는 겉에서 제어하고(`@property`) 어떤 상태는 컴포넌트 내부 전용이다(`@state`). Figma 에서는 둘 다 variant 로 그려 "이렇게 보인다"를 표현하되, 05장 Code Connect 에는 **겉에서 제어하는 속성만** 잇는다. 내부 상태는 코드에서 바깥이 지정할 수 없기 때문이다.

## 4-5. 코드와 맞는지 확인한다

1. `npm run dev` 로 데모를 연다.
2. Figma Playground 페이지에 방금 만든 ds-button 인스턴스를 놓고 variant·size 를 바꿔 본다.
3. 데모 화면과 나란히 놓고 색·높이·패딩이 같은지 본다. 다른 곳이 있으면 Claude Code 에게 "데모의 ds-button 과 Figma 의 ds-button 이 다른 부분을 찾아 Figma 쪽을 고쳐 줘" 라고 시킨다.

## 이 장에서 한 것

- Figma variant 속성과 Lit 속성을 이름으로 맞추는 까닭을 봤다.
- Foundations 문서와 ds-button·ds-input·ds-card Component Set 을 Claude Code 로 그렸다.
- Auto layout·변수 바인딩·Semantic 전용 규칙을 지켰다.
- 데모와 맞대어 차이를 확인했다.

다음 **05장**에서는 Figma 컴포넌트에 "추측 코드"가 아니라 진짜 `<ds-button>` 코드를 잇는 Code Connect 를 한다.
