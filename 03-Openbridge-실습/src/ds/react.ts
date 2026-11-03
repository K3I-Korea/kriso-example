/**
 * K3I 컴포넌트의 React 래퍼.
 * OpenBridge 의 @oicl/openbridge-webcomponents-react 도 정확히 같은 방식(@lit/react createComponent)으로
 * 자동 생성되어 있다 → node_modules/@oicl/openbridge-webcomponents-react/navigation-instruments/compass/compass.js
 */
import * as React from "react";
import { createComponent, type EventName } from "@lit/react";
import { K3iValuePanel } from "./k3i-value-panel.js";
import { K3iHeadingPanel } from "./k3i-heading-panel.js";
import { K3iRudderPanel } from "./k3i-rudder-panel.js";
import { K3iLayout } from "./k3i-layout.js";
import type { AlertLevel } from "../domain/catalog.js";

export const ValuePanel = createComponent({
  tagName: "k3i-value-panel",
  elementClass: K3iValuePanel,
  react: React,
  events: { onAck: "k3i-ack" as EventName<CustomEvent<{ level: AlertLevel }>> },
});

export const HeadingPanel = createComponent({ tagName: "k3i-heading-panel", elementClass: K3iHeadingPanel, react: React });
export const RudderPanel = createComponent({ tagName: "k3i-rudder-panel", elementClass: K3iRudderPanel, react: React });
export const Layout = createComponent({ tagName: "k3i-layout", elementClass: K3iLayout, react: React });
