/**
 * Code Connect — Figma 의 ds-button 컴포넌트 ↔ <ds-button> 코드 연결
 *
 * 연결되면 Figma Dev Mode 와 MCP get_design_context 가
 * "React+Tailwind 추측 코드" 대신 아래 example 을 그대로 돌려준다.
 *
 * 준비:  npm i -D @figma/code-connect@1  (v2 는 html 파서 미지원)
 * 게시:  npx figma connect publish --token <FIGMA_ACCESS_TOKEN>
 * (Code Connect 게시는 Figma Organization/Enterprise 플랜의 Dev/Full 시트 필요)
 *
 * state=hover 는 :hover 라서 매핑하지 않는다 (default 와 같은 코드).
 * iconStart 는 icon-start 슬롯에 넣을 아이콘 컴포넌트가 아직 없어 매핑하지 않는다.
 * → 아이콘 컴포넌트가 생기면 INSTANCE_SWAP 으로 바꾸고 여기서 figma.instance() 로 잇는다.
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/KbT8tHQXo3IrzCVadBNEvn/ds?node-id=21-182", {
  props: {
    variant: figma.enum("variant", {
      primary: "primary",
      secondary: "secondary",
      ghost: "ghost",
      danger: "danger",
    }),
    size: figma.enum("size", { sm: "sm", md: "md", lg: "lg" }),
    disabled: figma.enum("state", { disabled: true }),
    loading: figma.enum("state", { loading: true }),
    label: figma.string("label"),
  },
  example: ({ variant, size, disabled, loading, label }) =>
    html`<ds-button
      variant=${variant}
      size=${size}
      disabled=${disabled}
      loading=${loading}
    >${label}</ds-button>`,
});
