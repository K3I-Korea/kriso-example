/**
 * 상태 검사기 — 데이터 계층이 상태를 어떻게 결정했는지, 그것이 Figma 의 어느 variant 인지 보여준다.
 *   후보(candidates) → states.json priority 로 하나 선택 → 패널 state → Figma `state=<name>`
 */
import { useSyncExternalStore } from "react";
import { STATE_PRIORITY, type ViewSpec } from "../domain/catalog.js";
import type { SignalStore } from "../infra/signal-store.js";

interface Props {
  store: SignalStore;
  view: ViewSpec;
  acked: Set<string>;
}

export function Inspector({ store, view, acked }: Props) {
  const ids = [...new Set(Object.values(view.slots).flatMap((s) => Object.values(s.bind)))];
  useSyncExternalStore(store.subscribe, () => ids.map((id) => store.get(id)?.stateText + "" + store.get(id)?.state).join() + store.stats.flushes);

  return (
    <div className="card">
      <h4>상태 검사 <small>우선순위: {STATE_PRIORITY.join(" > ")}</small></h4>
      <table>
        <thead>
          <tr>
            <th>신호</th>
            <th>후보</th>
            <th>Figma variant</th>
          </tr>
        </thead>
        <tbody>
          {ids.map((id) => {
            const s = store.get(id);
            if (!s) return null;
            return (
              <tr key={id}>
                <td>{id}</td>
                <td className="mono">
                  {s.candidates.map((c) => (
                    <span key={c} className={c === s.state ? "chosen" : ""}>{c} </span>
                  ))}
                </td>
                <td className="mono">
                  state={s.state}
                  {s.alertLevel !== "none" && `, level=${s.alertLevel}${acked.has(`${id}:${s.alertLevel}`) ? ", acked" : ""}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="stats mono">
        수신 {store.stats.received} · 거부 {store.stats.rejected} · 화면 갱신 {store.stats.flushes}
      </p>
    </div>
  );
}
