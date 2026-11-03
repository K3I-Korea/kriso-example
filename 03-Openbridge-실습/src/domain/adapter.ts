/**
 * Domain — SignalAdapter  (발표자료 44장: abstract parse(raw): Signal, 스키마 버전별 구현체)
 *
 * 통신 형식(MQTT 페이로드)과 화면 의미(Signal)를 분리한다.
 * 분야5 스키마가 바뀌면 새 Adapter 하나만 추가하고 store 에 넣는 것을 바꾸면 끝 — 화면 코드는 그대로.
 */
import type { SourceQuality } from "./signal.js";

export interface ParsedSample {
  value: number | null;
  quality: SourceQuality;
  srcTs: number;
}

export abstract class SignalAdapter {
  abstract readonly schema: string;
  /** 형식이 맞지 않으면 null (→ 신호는 갱신되지 않고, 계속 안 오면 stale/invalid 로 표시) */
  abstract parse(raw: unknown): ParsedSample | null;
}

/**
 * 실습용 가정 스키마 v1:  { "v": 12.3, "q": 0|1|2, "t": 1730000000000 }
 *   q: 0 = ok, 1 = degraded, 2 = invalid
 */
export class KassV1Adapter extends SignalAdapter {
  readonly schema = "kass/v1";

  parse(raw: unknown): ParsedSample | null {
    if (typeof raw !== "object" || raw === null) return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.t !== "number") return null;
    const q: SourceQuality = r.q === 1 ? "degraded" : r.q === 2 ? "invalid" : "ok";
    const value = typeof r.v === "number" && Number.isFinite(r.v) ? r.v : null;
    return { value, quality: value === null ? "invalid" : q, srcTs: r.t };
  }
}
