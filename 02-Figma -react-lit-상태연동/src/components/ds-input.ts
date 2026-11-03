import { LitElement, html, css, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { baseStyles, focusRing } from "../styles/shared.js";

/**
 * @summary Figma "Text Field" 컴포넌트의 구현체 (폼 연동 지원)
 *
 * label·input·도움말을 모두 Shadow DOM 안에 두어
 * aria 참조(for, aria-describedby)가 경계를 넘지 않도록 설계.
 *
 * @fires ds-input - 입력할 때마다 { value }
 * @fires ds-change - 값이 확정될 때(blur/enter) { value }
 *
 * @csspart input - 내부 <input>
 */
@customElement("ds-input")
export class DsInput extends LitElement {
  static formAssociated = true;
  static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  static styles = [
    baseStyles,
    focusRing,
    css`
      :host {
        display: block;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: var(--ds-space-1);
      }
      label {
        font: var(--ds-font-label);
        color: var(--ds-semantic-text);
      }
      .required {
        color: var(--ds-semantic-danger);
        margin-left: 2px;
      }
      input {
        font: var(--ds-font-body);
        color: var(--ds-semantic-text);
        background: var(--ds-semantic-surface);
        height: 40px;
        padding: 0 var(--ds-space-3);
        border: 1px solid var(--ds-semantic-border);
        border-radius: var(--ds-radius-md);
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      input::placeholder {
        color: var(--ds-semantic-text-muted);
      }
      input:focus {
        border-color: var(--ds-semantic-primary);
        box-shadow: 0 0 0 3px var(--ds-semantic-focus-ring);
      }
      :host([invalid]) input {
        border-color: var(--ds-semantic-danger);
      }
      .help {
        font-size: 12px;
        line-height: 18px;
        color: var(--ds-semantic-text-muted);
      }
      :host([invalid]) .help {
        color: var(--ds-semantic-danger);
      }
      :host([disabled]) input {
        background: var(--ds-semantic-surface-alt);
        cursor: not-allowed;
      }
    `,
  ];

  @property() label = "";
  @property() name = "";
  @property() value = "";
  @property() placeholder = "";
  @property() type: "text" | "email" | "password" | "number" | "tel" | "url" = "text";
  @property({ attribute: "help-text" }) helpText = "";
  @property({ attribute: "error-text" }) errorText = "";
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) invalid = false;

  @query("input") private inputEl!: HTMLInputElement;
  private internals = this.attachInternals();

  render() {
    const message = this.invalid && this.errorText ? this.errorText : this.helpText;
    return html`
      <div class="field">
        ${this.label
          ? html`<label for="input">
              ${this.label}${this.required
                ? html`<span class="required" aria-hidden="true">*</span>`
                : nothing}
            </label>`
          : nothing}
        <input
          id="input"
          part="input"
          .value=${this.value}
          type=${this.type}
          placeholder=${this.placeholder || nothing}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.invalid ? "true" : "false"}
          aria-describedby=${message ? "help" : nothing}
          @input=${this.onInput}
          @change=${this.onChange}
        />
        ${message ? html`<span id="help" class="help">${message}</span>` : nothing}
      </div>
    `;
  }

  /** 값이 바뀔 때마다 바깥 <form>의 FormData 에 반영 */
  protected updated(changed: Map<string, unknown>) {
    if (changed.has("value")) {
      this.internals.setFormValue(this.value);
      this.syncValidity();
    }
  }

  private onInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
    if (this.invalid) this.invalid = false;
    this.dispatchEvent(
      new CustomEvent("ds-input", { detail: { value: this.value }, bubbles: true, composed: true })
    );
  }

  private onChange() {
    this.dispatchEvent(
      new CustomEvent("ds-change", { detail: { value: this.value }, bubbles: true, composed: true })
    );
  }

  private syncValidity() {
    if (!this.inputEl) return;
    const v = this.inputEl.validity;
    this.internals.setValidity(v, this.inputEl.validationMessage, this.inputEl);
  }

  // --- 폼 콜백 (ElementInternals) ---
  formResetCallback() {
    this.value = "";
    this.invalid = false;
  }
  formDisabledCallback(disabled: boolean) {
    this.disabled = disabled;
  }

  /** <form>의 checkValidity()/submit 시 호출됨 → 디자인 시스템 스타일로 에러 표시 */
  checkValidity() {
    this.syncValidity();
    const ok = this.internals.checkValidity();
    this.invalid = !ok;
    return ok;
  }

  focus(options?: FocusOptions) {
    this.inputEl?.focus(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ds-input": DsInput;
  }
}
