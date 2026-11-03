/**
 * Infra — SignalStore  (발표자료 44장: key → Signal 보관, rAF 틱으로만 방출)
 *
 *   Transport(초당 수십 건) → Adapter.parse → Signal.update → [rAF 1회] 스냅샷 재계산 → 구독자 알림
 *   + 500ms 시계 틱: 메시지가 끊겨도 stale 로 바뀌어야 하므로 시간 경과만으로도 재계산
 *
 * 스냅샷은 "상태·값이 실제로 바뀐 신호만" 새 객체로 교체한다 → 해당 패널만 리렌더.
 */
import { useSyncExternalStore } from "react";
import { SIGNALS } from "../domain/catalog.js";
import { Signal, type SignalSnapshot } from "../domain/signal.js";
import type { SignalAdapter } from "../domain/adapter.js";
import type { Transport } from "./mock-transport.js";

export class SignalStore {
  private signals = new Map<string, Signal>();
  private byTopic = new Map<string, Signal>();
  private snaps = new Map<string, SignalSnapshot>();
  private listeners = new Set<() => void>();
  private dirty = false;
  private frame = 0;
  private clock = 0;

  stats = { received: 0, rejected: 0, flushes: 0 };

  constructor(private transport: Transport, private adapter: SignalAdapter) {
    for (const def of Object.values(SIGNALS)) {
      const s = new Signal(def);
      this.signals.set(def.id, s);
      this.byTopic.set(def.topic, s);
      this.snaps.set(def.id, s.snapshot());
    }
    transport.onMessage(({ topic, payload }) => {
      const s = this.byTopic.get(topic);
      if (!s) return;
      const p = this.adapter.parse(payload);
      if (!p) {
        this.stats.rejected++;
        return;
      }
      this.stats.received++;
      s.update(p.value, p.quality, p.srcTs);
      this.schedule();
    });
  }

  start() {
    this.transport.start();
    this.clock = window.setInterval(() => this.schedule(), 500);
  }

  stop() {
    this.transport.stop();
    clearInterval(this.clock);
  }

  setManual(id: string, on: boolean) {
    const s = this.signals.get(id);
    if (s) {
      s.manual = on;
      this.schedule();
    }
  }

  isManual(id: string) {
    return this.signals.get(id)?.manual ?? false;
  }

  private schedule() {
    this.dirty = true;
    if (!this.frame) this.frame = requestAnimationFrame(this.flush);
  }

  private flush = () => {
    this.frame = 0;
    if (!this.dirty) return;
    this.dirty = false;
    const now = Date.now();
    let changed = false;
    for (const [id, s] of this.signals) {
      const next = s.snapshot(now);
      const prev = this.snaps.get(id)!;
      if (
        prev.value !== next.value ||
        prev.state !== next.state ||
        prev.stateText !== next.stateText ||
        prev.alertLevel !== next.alertLevel
      ) {
        this.snaps.set(id, next);
        changed = true;
      }
    }
    if (changed) {
      this.stats.flushes++;
      this.listeners.forEach((l) => l());
    }
  };

  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  get(id: string): SignalSnapshot | undefined {
    return this.snaps.get(id);
  }
}

export function useSignal(store: SignalStore, id: string) {
  return useSyncExternalStore(store.subscribe, () => store.get(id));
}
