import { css } from "lit";

/**
 * 모든 컴포넌트가 공유하는 기본 스타일.
 * 값은 전부 tokens.css 의 CSS 변수(--ds-*)를 참조하고,
 * 토큰이 로드되지 않았을 때를 위해 fallback 값을 둔다.
 */
export const baseStyles = css`
  :host {
    box-sizing: border-box;
    font: var(--ds-font-body, 400 14px/22px sans-serif);
    color: var(--ds-semantic-text, #212529);
  }
  :host([hidden]) {
    display: none !important;
  }
  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }
`;

export const focusRing = css`
  :focus-visible {
    outline: 3px solid var(--ds-semantic-focus-ring, #91a7ff);
    outline-offset: 2px;
  }
`;
