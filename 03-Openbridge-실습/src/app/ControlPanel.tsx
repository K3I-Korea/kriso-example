/**
 * 실습용 시나리오 조작 — 6가지 상태를 하나씩 일으켜 보는 손잡이.
 * OpenBridge 의 obc-toggle-switch 를 React 래퍼로 사용 (Primitive 층 직접 사용 예).
 */
import { useState } from "react";
import { ObcToggleSwitch } from "@oicl/openbridge-webcomponents-react/components/toggle-switch/toggle-switch.js";
import type { MockMqttTransport } from "../infra/mock-transport.js";
import type { SignalStore } from "../infra/signal-store.js";

interface Props {
  transport: MockMqttTransport;
  store: SignalStore;
}

export function ControlPanel({ transport, store }: Props) {
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const items: { label: string; desc: string; get: () => boolean; set: (v: boolean) => void }[] = [
    { label: "통신 끊김", desc: "모든 신호 → stale (ttl 경과 후)", get: () => !transport.linkUp, set: (v) => (transport.linkUp = !v) },
    { label: "배기온도 상승", desc: "exhaust → caution·warning·alarm", get: () => transport.overheating, set: (v) => (transport.overheating = v) },
    { label: "항해센서 품질 저하", desc: "hdg/cog/sog → degraded", get: () => transport.degradedNav, set: (v) => (transport.degradedNav = v) },
    { label: "윤활유 센서 고장", desc: "lube → invalid", get: () => transport.invalidLube, set: (v) => (transport.invalidLube = v) },
    { label: "타각 수동 보정", desc: "rudder → manual", get: () => store.isManual("rudder"), set: (v) => store.setManual("rudder", v) },
  ];

  return (
    <div className="card">
      <h4>시나리오</h4>
      {items.map((it) => (
        <ObcToggleSwitch
          key={it.label}
          label={it.label}
          hasDescription
          description={it.desc}
          checked={it.get()}
          onChange={(e) => {
            it.set(e.detail.checked);
            rerender();
          }}
        />
      ))}
    </div>
  );
}
