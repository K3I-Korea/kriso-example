import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LAYOUTS } from "../domain/catalog.js";

/**
 * Layout 층 — design/layouts.json 의 grid-template-areas 로 슬롯 자리를 만든다.
 *
 *   <k3i-layout layout="l1-grid">
 *     <k3i-heading-panel slot="primary"></k3i-heading-panel>
 *   </k3i-layout>
 *
 * 슬롯 이름 = layouts.json areas 의 단어 = Figma 슬롯 프레임 이름 = view 의 slots 키.
 * 이 문자열이 세 곳에서 같아야 자동화가 끊기지 않는다 (validate.mjs 가 검사).
 */
@customElement("k3i-layout")
export class K3iLayout extends LitElement {
  @property({ reflect: true }) layout = "l1-grid";

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    .grid {
      display: grid;
      gap: var(--k3i-space-3);
      height: 100%;
    }
    .slot {
      min-width: 0;
      min-height: 0;
      display: grid;
    }
    ::slotted(*) {
      height: 100%;
    }
  `;

  render() {
    const def = LAYOUTS[this.layout];
    if (!def) return html`<p>알 수 없는 레이아웃: ${this.layout}</p>`;
    const names = [...new Set(def.areas.join(" ").split(/\s+/).filter((a) => a && a !== "."))];
    return html`
      <div
        class="grid"
        style="grid-template-columns:${def.columns};grid-template-rows:${def.rows};grid-template-areas:${def.areas
          .map((a) => `'${a.trim().replace(/\s+/g, " ")}'`)
          .join(" ")}"
      >
        ${names.map((n) => html`<div class="slot" style="grid-area:${n}"><slot name=${n}></slot></div>`)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "k3i-layout": K3iLayout;
  }
}
