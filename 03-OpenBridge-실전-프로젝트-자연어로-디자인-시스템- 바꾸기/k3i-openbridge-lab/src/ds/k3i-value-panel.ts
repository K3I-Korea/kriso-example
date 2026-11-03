import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";
import { ReadoutSize } from "@oicl/openbridge-webcomponents/dist/navigation-instruments/readout/readout.js";
import { AlertType } from "@oicl/openbridge-webcomponents/dist/types.js";
import {
  ObcAlertFrameMode,
  type AlertFrameConfig,
} from "@oicl/openbridge-webcomponents/dist/components/alert-frame/alert-frame.js";

import { K3iPanel } from "./base/k3i-panel.js";
import type { AlertLevel } from "../domain/catalog.js";

/**
 * @summary 수치 1개를 보여주는 패널 — OpenBridge obc-readout 사용
 * @fires k3i-ack - 미확인 경보 패널을 누르면 발생. 확인 여부(acked)는 앱이 소유한다.
 */
@customElement("k3i-value-panel")
export class K3iValuePanel extends K3iPanel {
  @property({ type: Number }) value: number | null = null;
  @property() unit = "";
  @property({ type: Number, attribute: "fraction-digits" }) fractionDigits = 0;
  @property({ type: Number, attribute: "max-digits" }) maxDigits = 3;
  @property({ attribute: "alert-level", reflect: true }) alertLevel: AlertLevel = "none";
  @property({ type: Boolean, reflect: true }) acked = false;

  static styles = [
    K3iPanel.styles,
    css`
      obc-readout {
        display: block;
      }
      :host([alert-level]:not([alert-level="none"]):not([acked])) {
        cursor: pointer;
      }
    `,
  ];

  constructor() {
    super();
    this.addEventListener("click", () => {
      if (this.alertLevel !== "none" && !this.acked) {
        this.dispatchEvent(
          new CustomEvent("k3i-ack", { detail: { level: this.alertLevel }, bubbles: true, composed: true })
        );
      }
    });
  }

  private alertFrame(): AlertFrameConfig | false {
    const map = { caution: AlertType.Caution, warning: AlertType.Warning, alarm: AlertType.Alarm } as const;
    if (this.alertLevel === "none") return false;
    return {
      status: map[this.alertLevel],
      mode: this.acked ? ObcAlertFrameMode.ackedActive : ObcAlertFrameMode.unackedActive,
    };
  }

  protected renderBody() {
    return html`
      <obc-readout
        .value=${this.value}
        .unit=${this.unit}
        .fractionDigits=${this.fractionDigits}
        .maxDigits=${this.maxDigits}
        .size=${ReadoutSize.large}
        .alert=${this.alertFrame()}
      ></obc-readout>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "k3i-value-panel": K3iValuePanel;
  }
}
