/**
 * Code Connect — Figma ds-input ↔ <ds-input>
 *
 * state 중 invalid·disabled 는 같은 이름의 boolean attribute 로 잇는다.
 * state=focus 는 :focus 라서 코드로 지정할 방법이 없으므로 매핑하지 않는다 (default 와 같은 코드).
 * Figma 속성 helpText 는 코드의 help-text attribute 다.
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/KbT8tHQXo3IrzCVadBNEvn/ds?node-id=23-30", {
  props: {
    label: figma.string("label"),
    placeholder: figma.string("placeholder"),
    helpText: figma.string("helpText"),
    required: figma.boolean("required"),
    invalid: figma.enum("state", { invalid: true }),
    disabled: figma.enum("state", { disabled: true }),
  },
  example: ({ label, placeholder, helpText, required, invalid, disabled }) =>
    html`<ds-input
      label=${label}
      placeholder=${placeholder}
      help-text=${helpText}
      required=${required}
      invalid=${invalid}
      disabled=${disabled}
    ></ds-input>`,
});
