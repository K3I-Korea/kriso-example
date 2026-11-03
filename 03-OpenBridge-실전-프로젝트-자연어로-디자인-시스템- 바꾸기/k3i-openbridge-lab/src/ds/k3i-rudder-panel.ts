import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@oicl/openbridge-webcomponents/dist/navigation-instruments/rudder/rudder.js";
import "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";
import { ReadoutSize } from "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";

import { K3iPanel } from "./base/k3i-panel.js";

/** @summary 타각 패널 — OpenBridge obc-rudder + 수치 */
@customElement("k3i-rudder-panel")
export class K3iRudderPanel extends K3iPanel {
  @property({ type: Number }) angle: number | null = null;
  @property({ type: Number, attribute: "max-angle" }) maxAngle = 45;

  static styles = [
    K3iPanel.styles,
    css`
      .wrap {
        display: grid;
        justify-items: center;
        gap: var(--k3i-space-2);
      }
      obc-rudder {
        width: 100%;
        max-width: 260px;
        aspect-ratio: 2 / 1.2;
      }
    `,
  ];

  protected renderBody() {
    return html`
      <div class="wrap">
        <obc-rudder .angle=${this.angle ?? 0} .maxAngle=${this.maxAngle} showLabels></obc-rudder>
        <obc-readout .label=${"RUDDER"} .unit=${"°"} .value=${this.angle} .maxDigits=${2}
          .fractionDigits=${1} .size=${ReadoutSize.medium}></obc-readout>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "k3i-rudder-panel": K3iRudderPanel;
  }
}
