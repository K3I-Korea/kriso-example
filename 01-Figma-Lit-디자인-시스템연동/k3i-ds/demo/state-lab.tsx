/**
 * 상태 실습 — React(상태 소유자) × Lit(디자인 시스템) × Figma(variant)
 *
 *   React state ──props──▶ Lit 컴포넌트 ──reflect──▶ HTML 속성 ──▶ Figma variant
 *        ▲                      │
 *        └──── ds-change / ds-input 이벤트 ────┘
 *
 * 실행: npm run dev → http://localhost:5173/demo/react.html
 */
import { StrictMode, useEffect, useRef, useState, type RefObject } from "react";
import { createRoot } from "react-dom/client";
import { Button, Card, Input, Switch } from "../src/react/index.js";
import type { DsButton, DsInput, DsSwitch } from "../src/index.js";

// ---------------------------------------------------------------------------
// 1) 실제 DOM 속성을 관찰하는 훅 — Lit 이 reflect 한 결과를 그대로 보여준다
// ---------------------------------------------------------------------------
function useAttributes(ref: RefObject<HTMLElement | null>) {
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () =>
      setAttrs(Object.fromEntries([...el.attributes].map((a) => [a.name, a.value])));
    read();
    const mo = new MutationObserver(read);
    mo.observe(el, { attributes: true });
    return () => mo.disconnect();
  }, [ref]);
  return attrs;
}

// ---------------------------------------------------------------------------
// 2) DOM 속성 → Figma variant 이름 (CLAUDE.md 의 매핑 표와 동일한 규칙)
// ---------------------------------------------------------------------------
type Attrs = Record<string, string>;
const has = (a: Attrs, k: string) => k in a;

const toFigma = {
  "ds-switch": (a: Attrs) => ({
    checked: has(a, "checked") ? "true" : "false",
    state: has(a, "disabled") ? "disabled" : "default",
  }),
  "ds-input": (a: Attrs) => ({
    state: has(a, "disabled") ? "disabled" : has(a, "invalid") ? "invalid" : "default",
  }),
  "ds-button": (a: Attrs) => ({
    variant: a.variant ?? "primary",
    size: a.size ?? "md",
    state: has(a, "loading") ? "loading" : has(a, "disabled") ? "disabled" : "default",
  }),
};

// ---------------------------------------------------------------------------
// 3) 실습 화면
// ---------------------------------------------------------------------------
function StateLab() {
  // ── React 가 소유하는 상태 (단일 진실 공급원) ──
  const [autopilot, setAutopilot] = useState(false);
  const [locked, setLocked] = useState(false);
  const [speed, setSpeed] = useState("12");
  const [applying, setApplying] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const speedNum = Number(speed);
  const speedValid = speed !== "" && speedNum >= 0 && speedNum <= 30;

  const push = (msg: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()}  ${msg}`, ...l].slice(0, 8));

  // ── 관찰용 ref ──
  const switchRef = useRef<DsSwitch>(null);
  const inputRef = useRef<DsInput>(null);
  const buttonRef = useRef<DsButton>(null);
  const swAttrs = useAttributes(switchRef);
  const inAttrs = useAttributes(inputRef);
  const btAttrs = useAttributes(buttonRef);

  // ── 이벤트 핸들러 (Lit → React) ──
  const onAutopilotChange = (e: CustomEvent<{ checked: boolean }>) => {
    if (locked) {
      e.preventDefault(); // Lit 컴포넌트에게 "거부"를 알림 → 스위치가 원래대로 돌아감
      push(`ds-change(checked=${e.detail.checked}) → 잠금 상태라 React 가 거부`);
      return;
    }
    setAutopilot(e.detail.checked);
    push(`ds-change(checked=${e.detail.checked}) → setAutopilot`);
  };

  const apply = async () => {
    setApplying(true);
    push(`적용 시작: ${speed} kn`);
    await new Promise((r) => setTimeout(r, 1200)); // 서버 호출 흉내
    setApplying(false);
    push("적용 완료");
  };

  const reset = () => {
    setAutopilot(false);
    setSpeed("12");
    push("초기화 (React 가 props 로 내려보냄)");
  };

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: 24 }}>
      <h1 style={{ font: "var(--ds-font-title)", margin: 0 }}>
        상태 실습 — React × Lit × Figma
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        {/* ───────── 왼쪽: 조작 패널 ───────── */}
        <Card elevated>
          <h2 slot="header">자율운항 제어 패널</h2>
          <div style={{ display: "grid", gap: 16 }}>
            <Switch
              ref={switchRef}
              label="자율운항 모드"
              checked={autopilot}
              onDsChange={onAutopilotChange}
            />
            <Switch
              label="원격 잠금 (켜면 위 스위치 변경을 React가 거부)"
              checked={locked}
              onDsChange={(e) => {
                setLocked(e.detail.checked);
                push(`잠금 = ${e.detail.checked}`);
              }}
            />
            <Input
              ref={inputRef}
              label="목표 속력 (kn)"
              type="number"
              value={speed}
              disabled={!autopilot}
              invalid={autopilot && !speedValid}
              helpText="0 ~ 30 kn"
              errorText="0 ~ 30 사이 값을 입력하세요"
              onDsInput={(e) => setSpeed(e.detail.value)}
            />
          </div>
          <div slot="footer" style={{ display: "flex", gap: 8 }}>
            <Button variant="ghost" onClick={reset}>
              초기화
            </Button>
            <Button
              ref={buttonRef}
              loading={applying}
              disabled={!autopilot || !speedValid}
              onClick={apply}
            >
              적용
            </Button>
          </div>
        </Card>

        {/* ───────── 오른쪽: 관찰 패널 ───────── */}
        <Card>
          <h2 slot="header">상태 관찰</h2>

          <Section title="① React state">
            <Pre>{JSON.stringify({ autopilot, locked, speed, speedValid, applying }, null, 2)}</Pre>
          </Section>

          <Section title="② Lit 이 반영한 DOM 속성 → ③ Figma variant">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--ds-semantic-text-muted)" }}>
                  <th style={th}>컴포넌트</th>
                  <th style={th}>DOM 속성</th>
                  <th style={th}>Figma variant</th>
                </tr>
              </thead>
              <tbody>
                <Row tag="ds-switch" attrs={swAttrs} />
                <Row tag="ds-input" attrs={inAttrs} />
                <Row tag="ds-button" attrs={btAttrs} />
              </tbody>
            </table>
          </Section>

          <Section title="④ 이벤트 로그 (Lit → React)">
            <Pre>{log.join("\n") || "스위치를 눌러 보세요"}</Pre>
          </Section>
        </Card>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// 작은 표시용 컴포넌트
// ---------------------------------------------------------------------------
const th: React.CSSProperties = { padding: "4px 6px", borderBottom: "1px solid var(--ds-semantic-border)" };
const td: React.CSSProperties = { ...th, verticalAlign: "top", fontFamily: "ui-monospace, monospace" };

function Row({ tag, attrs }: { tag: keyof typeof toFigma; attrs: Attrs }) {
  const shown = Object.entries(attrs)
    .filter(([k]) => !["style", "class"].includes(k))
    .map(([k, v]) => (v === "" ? k : `${k}="${v}"`))
    .join(" ");
  const figma = Object.entries(toFigma[tag](attrs))
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  return (
    <tr>
      <td style={td}>{tag}</td>
      <td style={td}>{shown || "—"}</td>
      <td style={{ ...td, color: "var(--ds-semantic-primary)" }}>{figma}</td>
    </tr>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 6, marginBottom: 16 }}>
      <strong style={{ font: "var(--ds-font-label)" }}>{title}</strong>
      {children}
    </section>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre
      style={{
        margin: 0,
        padding: 10,
        borderRadius: 8,
        background: "var(--ds-semantic-surface-alt)",
        fontSize: 12,
        whiteSpace: "pre-wrap",
      }}
    >
      {children}
    </pre>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StateLab />
  </StrictMode>
);
