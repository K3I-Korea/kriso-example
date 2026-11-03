/**
 * Code Connect — Figma 의 ds-button 컴포넌트 ↔ <ds-button> 코드 연결
 *
 * 연결되면 Figma Dev Mode 와 MCP get_design_context 가
 * "React+Tailwind 추측 코드" 대신 아래 example 을 그대로 돌려준다.
 *
 * 준비:  npm i -D @figma/code-connect
 * 게시:  npx figma connect publish --token <FIGMA_ACCESS_TOKEN>
 * (Code Connect 게시는 Figma Organization/Enterprise 플랜의 Dev/Full 시트 필요)
 *
 * ⚠️ 아래 URL 을 실제 ds-button Component Set 링크로 교체하세요.
 *    Figma 에서 컴포넌트 선택 → 우클릭 → Copy link to selection
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/FILE_KEY/ds?node-id=NODE_ID", {
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
