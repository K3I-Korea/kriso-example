import { LitElement, html, css, type CSSResultGroup, type PropertyValues, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { STATES, type StateName } from "../../domain/catalog.js";

/**
 * Block 층 — 모든 K3I 패널의 추상 기반 클래스  (발표자료 44장: Panel (abstract) title · status · body · actions)
 *
 * 6계층 중 위치
 *   View   (React, design/views/*.json)
 *   Layout (k3i-layout, design/layouts.json)
 *   Block  ← 여기: K3iPanel ─┬─ k3i-value-panel
 *                            ├─ k3i-heading-panel
 *                            └─ k3i-rudder-panel
 *   Instrument / Primitive : OpenBridge (obc-compass, obc-rudder, obc-readout …)
 *   Token  : --k3i-* → OpenBridge 팔레트 변수 (design/tokens.json)
 *
 * 규칙: 각 층은 바로 아래 층만 쓴다 → 이 클래스는 색 리터럴 없이 --k3i-* 토큰만 사용한다.
 *
 * 상태 표현은 design/states.json 이 결정한다:
 *   token → 상태 색, shape → 형태(아래 CSS), text → 배지 문구(데이터 계층에서 치환되어 들어옴)
 * 패널은 상태를 "판단"하지 않고 받은 state 를 그리기만 한다.
 */
export abstract class K3iPanel extends LitElement {
  /** 패널 제목 */
  @property() heading = "";
  /** 데이터 계층이 결정한 상태 (Figma variant `state` 와 1:1) */
  @property({ reflect: true }) state: StateName = "invalid";
  /** 배지 문구 */
  @property({ attribute: "state-text" }) stateText = "";

  /** states.json 의 shape 를 HTML 속성으로 반영 → CSS 가 형태를 바꾼다 */
  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (changed.has("state")) {
      const def = STATES[this.state];
      this.setAttribute("shape", def?.shape ?? "none");
      this.style.setProperty("--state-color", `var(--k3i-color-${def?.token ?? "text"})`);
    }
  }

  static styles: CSSResultGroup = css`
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
      font-family: var(--k3i-font-family);
      color: var(--k3i-color-text);
      --state-color: var(--k3i-color-text);
    }
    .frame {
      position: relative;
      box-sizing: border-box;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: var(--k3i-space-2);
      padding: var(--k3i-space-3) var(--k3i-space-4) var(--k3i-space-4);
      background: var(--k3i-color-surface);
      border: 1px solid var(--k3i-color-border);
      border-radius: var(--k3i-radius-lg);
      overflow: hidden;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--k3i-space-2);
      min-height: 22px;
    }
    h3 {
      margin: 0;
      font: var(--k3i-font-label);
      color: var(--k3i-color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge {
      font: var(--k3i-font-badge);
      color: var(--state-color);
      border: 1px solid var(--state-color);
      border-radius: var(--k3i-radius-md);
      padding: 0 var(--k3i-space-2);
      white-space: nowrap;
    }
    .body {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    footer:empty {
      display: none;
    }

    /* ── 형태(shape) — states.json 의 shape 값과 1:1. 새 형태는 여기에 추가 후 validate.mjs SHAPES 에 등록 ── */
    :host([shape="dashed-border"]) .frame {
      border: var(--k3i-stroke-state) dashed var(--state-color);
    }
    :host([shape="dim-value"]) .body {
      opacity: 0.45;
    }
    :host([shape="hide-scale"]) .body {
      opacity: 0.15;
      filter: grayscale(1);
    }
    :host([shape="strong-border"]) .frame {
      border: var(--k3i-stroke-state) solid var(--state-color);
    }
    :host([shape="left-bar"]) .frame::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: var(--k3i-stroke-manual-bar);
      background: var(--state-color);
    }
  `;

  render(): TemplateResult {
    return html`
      <section class="frame" part="frame">
        <header>
          <h3>${this.heading}</h3>
          ${this.stateText ? html`<span class="badge" part="badge">${this.stateText}</span>` : ""}
        </header>
        <div class="body" part="body">${this.renderBody()}</div>
        <footer><slot name="actions"></slot></footer>
      </section>
    `;
  }

  /** 하위 클래스: OpenBridge Instrument/Primitive 를 조합해 본문을 그린다 */
  protected abstract renderBody(): TemplateResult;
}
