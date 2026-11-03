/**
 * React 18 이하용 얇은 래퍼.
 * 구현은 Lit 컴포넌트 하나뿐이고, 여기서는 props/이벤트 매핑만 한다.
 * (React 19 이상은 <ds-button> 을 직접 써도 되지만, 타입 지원과
 *  onDsChange 같은 이벤트 이름 때문에 이 래퍼를 쓰는 편이 편하다.)
 */
import * as React from "react";
import { createComponent, type EventName } from "@lit/react";
import { DsButton } from "../components/ds-button.js";
import { DsInput } from "../components/ds-input.js";
import { DsCard } from "../components/ds-card.js";
import { DsSwitch } from "../components/ds-switch.js";

export const Button = createComponent({
  tagName: "ds-button",
  elementClass: DsButton,
  react: React,
});

export const Input = createComponent({
  tagName: "ds-input",
  elementClass: DsInput,
  react: React,
  events: {
    onDsInput: "ds-input" as EventName<CustomEvent<{ value: string }>>,
    onDsChange: "ds-change" as EventName<CustomEvent<{ value: string }>>,
  },
});

export const Card = createComponent({
  tagName: "ds-card",
  elementClass: DsCard,
  react: React,
});

export const Switch = createComponent({
  tagName: "ds-switch",
  elementClass: DsSwitch,
  react: React,
  events: {
    onDsChange: "ds-change" as EventName<CustomEvent<{ checked: boolean }>>,
  },
});
