/**
 * Domain — Signal<T>  (발표자료 44장 클래스 모델: value · unit · quality · srcTs · rxTs · ttl · get state)
 *
 * "계기가 판단하지 않는다" — 상태(6종)는 여기서 결정되어 내려가고, 패널은 받은 상태를 그릴 뿐이다.
 * 우선순위와 문구는 design/states.json 에서 오므로, 규칙 변경은 JSON 수정만으로 모든 화면에 반영된다.
 */
import {
  STATE_PRIORITY,
  STATES,
  type AlertLevel,
  type Limits,
  type SignalDef,
  type StateName,
} from "./catalog.js";

/** 원천이 보고한 측정 품질 */
export type SourceQuality = "ok" | "degraded" | "invalid";

/** 화면으로 내려보내는 불변 스냅샷 (React 가 참조 비교로 변경을 감지) */
export interface SignalSnapshot {
  id: string;
  def: SignalDef;
  value: number | null;
  state: StateName;
  alertLevel: AlertLevel;
  /** 상태 배지 문구 (states.json text 에 {age}/{reason} 치환 완료) */
  stateText: string;
  /** 상태 색 토큰 이름 (tokens.json color 키) */
  stateToken: string;
  /** 이 상태가 왜 나왔는지 — 디버깅·검사 화면용 */
  candidates: StateName[];
}

export class Signal<T extends number = number> {
  value: T | null = null;
  quality: SourceQuality = "invalid";
  srcTs = 0; // 원천 측정 시각
  rxTs = 0; // 대시보드 수신 시각
  manual = false; // 운용자 수동 보정 중

  constructor(readonly def: SignalDef) {}

  get ttl() {
    return this.def.ttlMs;
  }

  update(value: T | null, quality: SourceQuality, srcTs: number, rxTs = Date.now()) {
    this.value = value;
    this.quality = quality;
    this.srcTs = srcTs;
    this.rxTs = rxTs;
  }

  /** 임계값 판정 */
  alertLevel(): AlertLevel {
    const v = this.value;
    if (v === null) return "none";
    const hit = (l: Limits | undefined, cmp: (a: number, b: number) => boolean): AlertLevel => {
      if (!l) return "none";
      if (l.alarm !== undefined && cmp(v, l.alarm)) return "alarm";
      if (l.warning !== undefined && cmp(v, l.warning)) return "warning";
      if (l.caution !== undefined && cmp(v, l.caution)) return "caution";
      return "none";
    };
    const order: AlertLevel[] = ["none", "caution", "warning", "alarm"];
    const a = hit(this.def.limits, (x, y) => x > y);
    const b = hit(this.def.limitsBelow, (x, y) => x < y);
    return order.indexOf(a) >= order.indexOf(b) ? a : b;
  }

  /** 지금 시각 기준으로 성립하는 모든 상태 후보 */
  candidates(now: number): StateName[] {
    const c: StateName[] = [];
    if (this.rxTs === 0 || this.quality === "invalid" || this.value === null) c.push("invalid");
    if (this.alertLevel() !== "none") c.push("alarm");
    if (this.rxTs !== 0 && now - this.rxTs > this.ttl) c.push("stale");
    if (this.quality === "degraded") c.push("degraded");
    if (this.manual) c.push("manual");
    c.push("normal");
    return c;
  }

  /** 우선순위(states.json priority)로 하나만 고른다 */
  state(now = Date.now()): StateName {
    const c = this.candidates(now);
    return STATE_PRIORITY.find((s) => c.includes(s)) ?? "normal";
  }

  snapshot(now = Date.now()): SignalSnapshot {
    const state = this.state(now);
    const level = this.alertLevel();
    const def = STATES[state];
    const age = Math.floor((now - this.rxTs) / 1000);
    const reason = level === "none" ? "" : `${level.toUpperCase()} ${this.def.label}`;
    return {
      id: this.def.id,
      def: this.def,
      value: state === "invalid" ? null : this.value,
      state,
      // alarm 이 아닌 상태가 우선해도 경보 수준 자체는 보존 (예: stale + 경보 → 흐린 값 + 경보 프레임 없음)
      alertLevel: state === "alarm" ? level : "none",
      stateText: def.text.replace("{age}", String(age)).replace("{reason}", reason),
      stateToken: def.token,
      candidates: this.candidates(now),
    };
  }
}
