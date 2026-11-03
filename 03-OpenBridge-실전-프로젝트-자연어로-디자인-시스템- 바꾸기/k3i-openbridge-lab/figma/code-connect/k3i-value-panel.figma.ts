/**
 * Code Connect — Figma `k3i-value-panel` ↔ <k3i-value-panel>
 *
 * state variant 는 데이터 계층이 정하지만, 코드 예시에서는 "이 상태를 재현하려면 어떤 속성을 주는가" 를 보여준다.
 * 준비: npm i -D @figma/code-connect   게시: npx figma connect publish --token <TOKEN>
 * ⚠️ URL 을 실제 Component Set 링크로 교체 (design/figma.json 의 k3iFileUrl 파일 안)
 */
import figma, { html } from "@figma/code-connect/html";

figma.connect("https://www.figma.com/design/FILE_KEY/kass?node-id=NODE_ID", {
  props: {
    heading: figma.string("heading"),
    state: figma.enum("state", {
      normal: "normal",
      degraded: "degraded",
      stale: "stale",
      invalid: "invalid",
      alarm: "alarm",
      manual: "manual",
    }),
    alertLevel: figma.enum("state", { alarm: "alarm" }),
  },
  example: ({ heading, state, alertLevel }) =>
    html`<k3i-value-panel
      heading=${heading}
      state=${state}
      alert-level=${alertLevel}
      unit="°C"
      value="437"
    ></k3i-value-panel>`,
});
