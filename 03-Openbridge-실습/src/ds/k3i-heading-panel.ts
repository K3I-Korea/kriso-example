import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@oicl/openbridge-webcomponents/dist/navigation-instruments/compass/compass.js";
import "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";
import { ReadoutSize } from "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";

import { K3iPanel } from "./base/k3i-panel.js";

/**
 * @summary 침로 패널 — OpenBridge obc-compass + HDG/COG/SOG readout
 * 상태 표현·프레임·배지는 K3iPanel 이 처리하므로 여기서는 계기 배치만 한다.
 */
@customElement("k3i-heading-panel")
export class K3iHeadingPanel extends K3iPanel {
  @property({ type: Number }) hdg: number | null = null;
  @property({ type: Number }) cog: number | null = null;
  @property({ type: Number }) sog: number | null = null;
  @property({ type: Number, attribute: "heading-setpoint" }) headingSetpoint: number | null = null;

  static styles = [
    K3iPanel.styles,
    css`
      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: var(--k3i-space-4);
        align-items: center;
        height: 100%;
      }
      obc-compass {
        width: 100%;
        max-width: 340px;
        aspect-ratio: 1;
        justify-self: center;
      }
      .readouts {
        display: grid;
        gap: var(--k3i-space-3);
        min-width: 108px;
      }
    `,
  ];

  protected renderBody() {
    const r = (label: string, unit: string, v: number | null, digits: number) => html`
      <obc-readout .label=${label} .unit=${unit} .value=${v} .maxDigits=${digits}
        .fractionDigits=${1} .size=${ReadoutSize.medium}></obc-readout>`;
    return html`
      <div class="grid">
        <obc-compass
          .heading=${this.hdg ?? 0}
          .courseOverGround=${this.cog ?? 0}
          .headingSetpoint=${this.headingSetpoint}
        ></obc-compass>
        <div class="readouts">
          ${r("HDG", "°", this.hdg, 3)} ${r("COG", "°", this.cog, 3)} ${r("SOG", "kn", this.sog, 2)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "k3i-heading-panel": K3iHeadingPanel;
  }
}
