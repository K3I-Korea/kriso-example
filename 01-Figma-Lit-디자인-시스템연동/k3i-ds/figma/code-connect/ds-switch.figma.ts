/**
 * Code Connect — Figma ds-switch ↔ <ds-switch>
 *
 * 매핑하는 것은 외부에서 제어하는 @property(checked, disabled)뿐이다.
 * state=pressed 는 Lit 내부의 @state 라서 코드로 지정할 방법이 없으므로 매핑하지 않는다.
 * → Figma 에서 pressed variant 를 선택해도 코드 예시는 기본 상태로 나온다 (의도된 동작).
 *
 * ⚠️ URL 을 실제 ds-switch Component Set 링크로 교체하세요.
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/FILE_KEY/ds?node-id=NODE_ID", {
  props: {
    checked: figma.enum("checked", { true: true, false: false }),
    disabled: figma.enum("state", { disabled: true }),
    label: figma.string("label"),
  },
  example: ({ checked, disabled, label }) =>
    html`<ds-switch label=${label} checked=${checked} disabled=${disabled}></ds-switch>`,
});
