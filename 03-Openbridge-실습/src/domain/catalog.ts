/**
 * design/ 선언 파일을 타입과 함께 읽어 들이는 단일 창구.
 * 코드 어디서도 JSON 을 직접 import 하지 말고 여기를 거친다 → 선언 형식이 바뀌면 이 파일만 고치면 된다.
 */
import signalsJson from "../../design/signals.json";
import statesJson from "../../design/states.json";
import panelsJson from "../../design/panels.json";
import layoutsJson from "../../design/layouts.json";

export type StateName = "normal" | "degraded" | "stale" | "invalid" | "alarm" | "manual";
export type AlertLevel = "none" | "caution" | "warning" | "alarm";

export interface Limits {
  caution?: number;
  warning?: number;
  alarm?: number;
}

export interface SignalDef {
  id: string;
  topic: string;
  label: string;
  unit: string;
  fractionDigits: number;
  maxDigits: number;
  ttlMs: number;
  /** 값이 이보다 크면 해당 수준 */
  limits?: Limits;
  /** 값이 이보다 작으면 해당 수준 */
  limitsBelow?: Limits;
}

export interface StateDef {
  token: string;
  shape: string;
  text: string;
}

export const SIGNALS: Record<string, SignalDef> = Object.fromEntries(
  Object.entries(signalsJson.signals).map(([id, s]) => [id, { id, ...(s as Omit<SignalDef, "id">) }])
);

export const STATE_PRIORITY = statesJson.priority as StateName[];
export const STATES = statesJson.states as Record<StateName, StateDef>;

export interface PanelDef {
  tag: string;
  roles: string[];
  description: string;
}
export const PANELS = panelsJson.panels as Record<string, PanelDef>;

export interface LayoutDef {
  description: string;
  columns: string;
  rows: string;
  areas: string[];
}
export const LAYOUTS = layoutsJson.layouts as Record<string, LayoutDef>;

export interface ViewSlot {
  panel: string;
  title?: string;
  bind: Record<string, string>;
}
export interface ViewSpec {
  id: string;
  title: string;
  layout: string;
  slots: Record<string, ViewSlot>;
}

/** design/views/*.json 을 모두 읽는다 (Vite glob import — 파일을 추가하면 자동으로 화면 목록에 나타남) */
const viewModules = import.meta.glob<ViewSpec>("../../design/views/*.json", { eager: true, import: "default" });
export const VIEWS: ViewSpec[] = Object.values(viewModules).sort((a, b) =>
  a.id === "overview" ? -1 : b.id === "overview" ? 1 : a.id.localeCompare(b.id)
);
