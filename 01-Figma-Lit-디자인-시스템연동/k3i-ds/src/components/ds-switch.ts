import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { baseStyles, focusRing } from "../styles/shared.js";

/**
 * @summary Figma "Switch" 컴포넌트의 구현체 — 상태 관리 실습용
 *
 * 상태의 3가지 종류를 한 컴포넌트에서 보여준다.
 *  1) @property checked   : 외부(React 등)가 소유·제어하는 공개 상태 → Figma variant `checked`
 *  2) @property disabled  : 외부가 주는 공개 상태                  → Figma variant `state=disabled`
 *  3) @state  pressed     : 컴포넌트 내부 전용 상태(외부 비공개)   → Figma variant `state=pressed`
 *
 * @fires ds-change - 토글 시도 시 { checked } (cancelable).
 *   부모가 event.preventDefault() 하면 토글이 취소되고 원래 값으로 돌아간다.
 *
 * @csspart track - 바탕 트랙
 * @csspart thumb - 움직이는 원
 */
@customElement("ds-switch")
export class DsSwitch extends LitElement {
  static formAssociated = true;

  static styles = [
    baseStyles,
    focusRing,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--ds-space-2);
        cursor: pointer;
      }
      :host([disabled]) {
        opacity: 0.45;
        cursor: not-allowed;
      }
      button {
        all: unset;
        position: relative;
        width: 44px;
        height: 24px;
        border-radius: 999px;
        background: var(--ds-semantic-border);
        transition: background-color 0.15s;
        flex: none;
      }
      button:focus-visible {
        outline: 3px solid var(--ds-semantic-focus-ring);
        outline-offset: 2px;
      }
      :host([checked]) button {
        background: var(--ds-semantic-primary);
      }
      .thumb {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--ds-color-gray-0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        transition: transform 0.15s, width 0.15s;
      }
      :host([checked]) .thumb {
        transform: translateX(20px);
      }
      /* 내부 상태 pressed: 누르는 동안 thumb 이 살짝 늘어남 */
      .thumb.pressed {
        width: 24px;
      }
      :host([checked]) .thumb.pressed {
        transform: translateX(16px);
      }
      label {
        font: var(--ds-font-label);
        color: var(--ds-semantic-text);
        cursor: inherit;
      }
    `,
  ];

  /** 공개 상태: 켜짐/꺼짐. reflect → HTML 속성·CSS 선택자·Figma variant 와 1:1 */
  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() label = "";
  @property() name = "";

  /** 내부 상태: 바깥에서는 읽거나 쓸 수 없다. 바뀌면 다시 그리기만 한다. */
  @state() private pressed = false;

  private internals = this.attachInternals();

  render() {
    return html`
      <button
        part="track"
        id="sw"
        role="switch"
        aria-checked=${this.checked ? "true" : "false"}
        ?disabled=${this.disabled}
        @click=${this.toggle}
        @pointerdown=${() => (this.pressed = true)}
        @pointerup=${() => (this.pressed = false)}
        @pointerleave=${() => (this.pressed = false)}
      >
        <span part="thumb" class="thumb ${this.pressed ? "pressed" : ""}"></span>
      </button>
      ${this.label ? html`<label for="sw" @click=${this.toggle}>${this.label}</label>` : ""}
    `;
  }

  /** checked 가 어떤 경로로 바뀌든(내부 클릭, 외부 대입) 폼 값을 맞춘다 */
  protected updated(changed: Map<string, unknown>) {
    if (changed.has("checked")) {
      this.internals.setFormValue(this.checked ? "on" : null);
    }
  }

  private toggle(e: Event) {
    e.preventDefault(); // label 클릭이 button 클릭을 한 번 더 일으키지 않도록
    if (this.disabled) return;

    const previous = this.checked;
    this.checked = !previous; // ① 먼저 낙관적으로 바꾸고

    const ev = new CustomEvent("ds-change", {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    // ② 부모에게 알린다. 부모가 거부(preventDefault)하면 ③ 되돌린다.
    if (!this.dispatchEvent(ev)) this.checked = previous;
  }

  formResetCallback() {
    this.checked = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ds-switch": DsSwitch;
  }
}
