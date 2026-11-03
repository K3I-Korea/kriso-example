/**
 * View 층 — ViewSpec(JSON) 을 화면으로 조립한다.
 * 화면 구성을 바꾸려면 이 파일이 아니라 design/views/*.json 을 고친다.
 */
import { Fragment, useSyncExternalStore } from "react";
import { PANELS, type ViewSpec } from "../domain/catalog.js";
import type { SignalStore } from "../infra/signal-store.js";
import { Layout } from "../ds/react.js";
import { REGISTRY } from "./registry.js";

interface Props {
  view: ViewSpec;
  store: SignalStore;
  acked: Set<string>;
  onAck: (signalId: string, level: string) => void;
}

/** 화면에 등장하는 신호 스냅샷 묶음을 구독 (어느 하나라도 바뀌면 리렌더) */
function useSnapshots(store: SignalStore, ids: string[]) {
  const key = ids.join(",");
  return useSyncExternalStore(store.subscribe, () => {
    // 스냅샷 객체가 같으면 같은 문자열 → 불필요한 리렌더 없음
    return ids.map((id) => `${id}:${store.get(id)?.state}:${store.get(id)?.value}:${store.get(id)?.stateText}`).join("|") + key;
  });
}

export function ViewRenderer({ view, store, acked, onAck }: Props) {
  const ids = Object.values(view.slots).flatMap((s) => Object.values(s.bind));
  useSnapshots(store, ids);

  return (
    <Layout layout={view.layout} style={{ height: "100%" }}>
      {Object.entries(view.slots).map(([slot, spec]) => {
        const render = REGISTRY[spec.panel];
        if (!render || !PANELS[spec.panel]) return null;
        const signals = Object.fromEntries(
          Object.entries(spec.bind).map(([role, sid]) => [role, store.get(sid)])
        );
        // 패널 자신이 slot={slot} 을 가지므로 k3i-layout 의 직계 자식이어야 한다 (감싸는 div 금지)
        return <Fragment key={slot}>{render({ slot, spec, signals, acked, onAck })}</Fragment>;
      })}
    </Layout>
  );
}
