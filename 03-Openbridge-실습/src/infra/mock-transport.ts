/**
 * Infra — 모의 MQTT 전송 계층 (브로커 없이 실습하기 위한 대역)
 *
 * 실제로는 mqtt.js(ws) 또는 게이트웨이 WebSocket(LiveTransport) 으로 바꾼다.
 * Transport 인터페이스만 지키면 store·화면은 바뀌지 않는다.
 */
import { SIGNALS } from "../domain/catalog.js";

export interface RawMessage {
  topic: string;
  payload: unknown;
}

export interface Transport {
  onMessage(cb: (m: RawMessage) => void): () => void;
  start(): void;
  stop(): void;
}

export class MockMqttTransport implements Transport {
  private listeners = new Set<(m: RawMessage) => void>();
  private timers: number[] = [];

  // ── 실습용 시나리오 손잡이 (ControlPanel 에서 조작) ──
  linkUp = true; // false → 모든 신호 stale
  overheating = false; // 배기온도 상승 → caution → warning → alarm
  degradedNav = false; // 항해 센서 품질 저하 (q=1)
  invalidLube = false; // 윤활유 압력 센서 고장 (v=null)
  headingSetpoint = 45;

  private hdg = 30;
  private rudder = 0;
  private rpm = 640;
  private exhaust = 380;
  private lube = 3.4;

  onMessage(cb: (m: RawMessage) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(id: keyof typeof SIGNALS | string, v: number | null, q = 0) {
    if (!this.linkUp) return;
    const topic = SIGNALS[id]?.topic;
    if (!topic) return;
    const m = { topic, payload: { v, q, t: Date.now() } };
    this.listeners.forEach((l) => l(m));
  }

  start() {
    this.timers.push(
      window.setInterval(() => {
        const err = ((this.headingSetpoint - this.hdg + 540) % 360) - 180;
        this.rudder += (Math.max(-35, Math.min(35, err * 1.5)) - this.rudder) * 0.1;
        this.hdg = (this.hdg + this.rudder * 0.01 + 360) % 360;
        const q = this.degradedNav ? 1 : 0;
        this.emit("hdg", this.hdg, q);
        this.emit("cog", (this.hdg + 2 * Math.sin(Date.now() / 7000) + 360) % 360, q);
        this.emit("sog", 12 + Math.sin(Date.now() / 9000) * 0.6, q);
        this.emit("rudder", this.rudder);
      }, 100)
    );
    this.timers.push(
      window.setInterval(() => {
        this.rpm += (Math.random() - 0.5) * 8 + (650 - this.rpm) * 0.05;
        this.exhaust += ((this.overheating ? 460 : 380) - this.exhaust) * 0.06 + (Math.random() - 0.5) * 2;
        this.lube += (3.4 - this.lube) * 0.1 + (Math.random() - 0.5) * 0.05;
        this.emit("rpm", this.rpm);
        this.emit("exhaust", this.exhaust);
        this.emit("lube", this.invalidLube ? null : this.lube, this.invalidLube ? 2 : 0);
      }, 500)
    );
  }

  stop() {
    this.timers.forEach(clearInterval);
    this.timers = [];
  }
}
