import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { baseStyles, focusRing } from "../styles/shared.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * @summary Figma "Button" 컴포넌트의 구현체
 *
 * @slot - 버튼 라벨
 * @slot icon-start - 라벨 앞 아이콘
 * @slot icon-end - 라벨 뒤 아이콘
 *
 * @csspart base - 내부 <button> (레이아웃 미세 조정용으로만 공개)
 *
 * @cssprop --ds-button-min-width - 최소 너비 (기본 auto)
 */
@customElement("ds-button")
export class DsButton extends LitElement {
  /** form 안에서 submit/reset 동작을 하기 위해 폼 연동 활성화 */
  static formAssociated = true;

  static styles = [
    baseStyles,
    focusRing,
    css`
      :host {
        display: inline-block;
      }
      button {
        all: unset; /* 브라우저 기본 스타일 제거 → 오직 토큰만 반영 */
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--ds-space-2, 8px);
        width: 100%;
        min-width: var(--ds-button-min-width, auto);
        font: var(--ds-font-label, 600 14px/20px sans-serif);
        border-radius: var(--ds-radius-md, 8px);
        border: 1px solid transparent;
        cursor: pointer;
        transition: background-color 0.15s, border-color 0.15s, color 0.15s;
        user-select: none;
      }

      /* --- 사이즈 (Figma variant: size) --- */
      :host([size="sm"]) button {
        padding: var(--ds-space-1) var(--ds-space-3);
        height: 32px;
      }
      button,
      :host([size="md"]) button {
        padding: var(--ds-space-2) var(--ds-space-4);
        height: 40px;
      }
      :host([size="lg"]) button {
        padding: var(--ds-space-3) var(--ds-space-6);
        height: 48px;
      }

      /* --- 변형 (Figma variant: type) --- */
      button,
      :host([variant="primary"]) button {
        background: var(--ds-semantic-primary);
        color: var(--ds-semantic-on-primary);
      }
      :host([variant="primary"]) button:hover {
        background: var(--ds-semantic-primary-hover);
      }
      :host([variant="secondary"]) button {
        background: var(--ds-semantic-surface);
        color: var(--ds-semantic-text);
        border-color: var(--ds-semantic-border);
      }
      :host([variant="secondary"]) button:hover {
        background: var(--ds-semantic-surface-alt);
      }
      :host([variant="ghost"]) button {
        background: transparent;
        color: var(--ds-semantic-primary);
      }
      :host([variant="ghost"]) button:hover {
        background: var(--ds-semantic-surface-alt);
      }
      :host([variant="danger"]) button {
        background: var(--ds-semantic-danger);
        color: var(--ds-color-gray-0);
      }

      /* --- 상태 --- */
      :host([disabled]) button {
        opacity: 0.45;
        cursor: not-allowed;
        pointer-events: none;
      }
      :host([full-width]) {
        display: block;
      }

      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  @property({ reflect: true }) variant: ButtonVariant = "primary";
  @property({ reflect: true }) size: ButtonSize = "md";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) loading = false;
  @property({ type: Boolean, reflect: true, attribute: "full-width" }) fullWidth = false;
  @property() type: "button" | "submit" | "reset" = "button";

  private internals = this.attachInternals();

  render() {
    return html`
      <button
        part="base"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? "true" : "false"}
        @click=${this.handleClick}
      >
        ${this.loading
          ? html`<span class="spinner" aria-hidden="true"></span>`
          : html`<slot name="icon-start"></slot>`}
        <slot></slot>
        <slot name="icon-end"></slot>
      </button>
    `;
  }

  /** Shadow DOM 안의 <button>은 바깥 <form>을 모르므로 직접 연결 */
  private handleClick() {
    const form = this.internals.form;
    if (!form) return;
    if (this.type === "submit") form.requestSubmit();
    if (this.type === "reset") form.reset();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ds-button": DsButton;
  }
}
