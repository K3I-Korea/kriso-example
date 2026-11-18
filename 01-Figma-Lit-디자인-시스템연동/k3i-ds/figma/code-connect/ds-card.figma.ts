/**
 * Code Connect — Figma ds-card ↔ <ds-card>
 *
 * Figma 의 SLOT 속성 header·body·footer 를 Lit 의 <slot name="header">·기본 슬롯·<slot name="footer"> 로 잇는다.
 * 슬롯에 놓인 내용은 Dev Mode 에서 figma.slot() 자리에 채워진다.
 * header·footer 는 slot attribute 가 필요해서 <div slot="..."> 로 감싼다.
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/KbT8tHQXo3IrzCVadBNEvn/ds?node-id=24-38", {
  props: {
    elevated: figma.enum("elevated", { true: true, false: false }),
    header: figma.slot("header"),
    body: figma.slot("body"),
    footer: figma.slot("footer"),
  },
  example: ({ elevated, header, body, footer }) =>
    html`<ds-card elevated=${elevated}>
      <div slot="header">${header}</div>
      ${body}
      <div slot="footer">${footer}</div>
    </ds-card>`,
});
