/**
 * 앱 — OpenBridge 앱 골격(top-bar, 팔레트 메뉴) + K3I View + 실습 도구(시나리오·상태 검사)
 */
import { useEffect, useMemo, useState } from "react";
import { ObcTopBar } from "@oicl/openbridge-webcomponents-react/components/top-bar/top-bar.js";
import { ObcBrillianceMenu } from "@oicl/openbridge-webcomponents-react/components/brilliance-menu/brilliance-menu.js";
import { ObcPalette } from "@oicl/openbridge-webcomponents/dist/components/brilliance-menu/brilliance-menu.js";

import { VIEWS } from "../domain/catalog.js";
import { KassV1Adapter } from "../domain/adapter.js";
import { MockMqttTransport } from "../infra/mock-transport.js";
import { SignalStore } from "../infra/signal-store.js";
import { ViewRenderer } from "../view/ViewRenderer.js";
import { ControlPanel } from "./ControlPanel.js";
import { Inspector } from "./Inspector.js";

export function App() {
  // 인프라는 앱 수명 동안 하나 (실제 과제에서는 LiveTransport + 게이트웨이)
  const { transport, store } = useMemo(() => {
    const transport = new MockMqttTransport();
    return { transport, store: new SignalStore(transport, new KassV1Adapter()) };
  }, []);

  useEffect(() => {
    store.start();
    return () => store.stop();
  }, [store]);

  // ── 앱이 소유하는 UI 상태 ──
  const [viewId, setViewId] = useState(VIEWS[0]?.id ?? "overview");
  const [palette, setPalette] = useState<ObcPalette>(ObcPalette.day);
  const [menuOpen, setMenuOpen] = useState(false);
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const [showTools, setShowTools] = useState(true);

  // OpenBridge 팔레트 = <html data-obc-theme>. K3I 토큰은 var() 로 연결되어 있어 자동으로 따라간다.
  useEffect(() => {
    document.documentElement.dataset.obcTheme = palette;
  }, [palette]);

  // 확인 기록은 "신호:수준" 단위 — 경보가 해소되거나 수준이 올라가면(warning→alarm) 다시 미확인이 된다
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
        setAcked((prev) => {
          const next = new Set(
            [...prev].filter((key) => {
              const [id, level] = key.split(":");
              const s = store.get(id);
              return s?.state === "alarm" && s.alertLevel === level;
            })
          );
          return next.size === prev.size ? prev : next;
        });
      });
    return () => {
      unsubscribe();
    };
  }, [store]);

  const view = VIEWS.find((v) => v.id === viewId) ?? VIEWS[0];

  return (
    <div className="app">
      <ObcTopBar
        appTitle="KASS"
        pageName={view.title}
        showDimmingButton
        dimmingButtonActivated={menuOpen}
        showClock
        onDimmingButtonClicked={() => setMenuOpen((o) => !o)}
        onMenuButtonClicked={() => setShowTools((t) => !t)}
        menuButtonActivated={showTools}
      />

      {menuOpen && (
        <div className="brilliance">
          <ObcBrillianceMenu
            palette={palette}
            showBrightness={false}
            onPaletteChanged={(e) => setPalette(e.detail.value)}
          />
        </div>
      )}

      <nav className="tabs">
        {VIEWS.map((v) => (
          <button key={v.id} className={v.id === view.id ? "on" : ""} onClick={() => setViewId(v.id)}>
            {v.title}
          </button>
        ))}
        <span className="hint">palette: {palette} · layout: {view.layout}</span>
      </nav>

      <main className={showTools ? "with-tools" : ""}>
        <section className="view">
          <ViewRenderer
            view={view}
            store={store}
            acked={acked}
            onAck={(id, level) => setAcked((s) => new Set(s).add(`${id}:${level}`))}
          />
        </section>
        {showTools && (
          <aside className="tools">
            <ControlPanel transport={transport} store={store} />
            <Inspector store={store} view={view} acked={acked} />
          </aside>
        )}
      </main>
    </div>
  );
}
