import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyles } from "../styles/shared.js";

/**
 * @summary Figma "Card" 컴포넌트의 구현체
 *
 * @slot header - 카드 제목 영역
 * @slot - 본문
 * @slot footer - 하단 액션 영역 (보통 ds-button 배치)
 *
 * @csspart base - 카드 외곽
 * @cssprop --ds-card-padding - 내부 여백 (기본 --ds-space-6)
 */
@customElement("ds-card")
export class DsCard extends LitElement {
  static styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .card {
        background: var(--ds-semantic-surface);
        border: 1px solid var(--ds-semantic-border);
        border-radius: var(--ds-radius-lg);
        padding: var(--ds-card-padding, var(--ds-space-6));
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-4);
      }
      :host([elevated]) .card {
        border-color: transparent;
        box-shadow: var(--ds-shadow-card);
      }
      .header ::slotted(*) {
        margin: 0;
        font: var(--ds-font-title);
        color: var(--ds-semantic-text);
      }
      .footer {
        display: flex;
        justify-content: flex-end;
        gap: var(--ds-space-2);
      }
      .header.empty,
      .footer.empty {
        display: none;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) elevated = false;
  @state() private hasHeader = false;
  @state() private hasFooter = false;

  render() {
    return html`
      <section part="base" class="card">
        <div class="header ${this.hasHeader ? "" : "empty"}">
          <slot name="header" @slotchange=${this.onSlot}></slot>
        </div>
        <div class="body"><slot></slot></div>
        <div class="footer ${this.hasFooter ? "" : "empty"}">
          <slot name="footer" @slotchange=${this.onSlot}></slot>
        </div>
      </section>
    `;
  }

  /** 슬롯이 비어 있으면 해당 영역의 gap 이 생기지 않도록 숨김 */
  private onSlot(e: Event) {
    const slot = e.target as HTMLSlotElement;
    const filled = slot.assignedNodes({ flatten: true }).length > 0;
    if (slot.name === "header") this.hasHeader = filled;
    if (slot.name === "footer") this.hasFooter = filled;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ds-card": DsCard;
  }
}
