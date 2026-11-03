/**
 * View 층 — Registry  (발표자료 44장: 이름 → 클래스 매핑)
 *
 * design/views/*.json 의 "panel": "heading" 같은 문자열을 실제 컴포넌트로 바꾸는 사전.
 * 새 패널 종류를 추가할 때: ① src/ds 에 Lit 클래스 ② design/panels.json 에 roles ③ 여기 등록.
 */
import type { ReactElement } from "react";
import { PANELS, STATE_PRIORITY, type ViewSlot } from "../domain/catalog.js";
import type { SignalSnapshot } from "../domain/signal.js";
import { HeadingPanel, RudderPanel, ValuePanel } from "../ds/react.js";

export interface PanelRenderProps {
  slot: string;
  spec: ViewSlot;
  /** role → 스냅샷 (bind 를 풀어서 전달) */
  signals: Record<string, SignalSnapshot | undefined>;
  acked: Set<string>;
  /** 확인 기록 키는 `${signalId}:${level}` */
  onAck: (signalId: string, level: string) => void;
}

/** 여러 신호를 묶는 패널은 가장 우선순위 높은 상태 하나만 표시 */
export function worst(snaps: (SignalSnapshot | undefined)[]): SignalSnapshot | undefined {
  return snaps
    .filter((s): s is SignalSnapshot => !!s)
    .sort((a, b) => STATE_PRIORITY.indexOf(a.state) - STATE_PRIORITY.indexOf(b.state))[0];
}

export const REGISTRY: Record<string, (p: PanelRenderProps) => ReactElement> = {
  value: ({ slot, spec, signals, acked, onAck }) => {
    const s = signals.value;
    return (
      <ValuePanel
        slot={slot}
        heading={spec.title ?? s?.def.label ?? ""}
        state={s?.state ?? "invalid"}
        stateText={s?.stateText ?? ""}
        value={s?.value ?? null}
        unit={s?.def.unit ?? ""}
        fractionDigits={s?.def.fractionDigits ?? 0}
        maxDigits={s?.def.maxDigits ?? 3}
        alertLevel={s?.alertLevel ?? "none"}
        acked={!!s && acked.has(`${s.id}:${s.alertLevel}`)}
        onAck={() => s && onAck(s.id, s.alertLevel)}
      />
    );
  },

  heading: ({ slot, spec, signals }) => {
    const w = worst([signals.hdg, signals.cog, signals.sog]);
    return (
      <HeadingPanel
        slot={slot}
        heading={spec.title ?? "Heading"}
        state={w?.state ?? "invalid"}
        stateText={w?.stateText ?? ""}
        hdg={signals.hdg?.value ?? null}
        cog={signals.cog?.value ?? null}
        sog={signals.sog?.value ?? null}
        headingSetpoint={45}
      />
    );
  },

  rudder: ({ slot, spec, signals }) => {
    const s = signals.angle;
    return (
      <RudderPanel
        slot={slot}
        heading={spec.title ?? "Rudder"}
        state={s?.state ?? "invalid"}
        stateText={s?.stateText ?? ""}
        angle={s?.value ?? null}
      />
    );
  },
};

// 선언(panels.json)과 구현(REGISTRY)이 어긋나면 시작 시 바로 알린다
for (const name of Object.keys(PANELS)) {
  if (!REGISTRY[name]) console.error(`[registry] panels.json 의 "${name}" 이 REGISTRY 에 없습니다`);
}
for (const name of Object.keys(REGISTRY)) {
  if (!PANELS[name]) console.error(`[registry] REGISTRY 의 "${name}" 이 panels.json 에 없습니다`);
}
