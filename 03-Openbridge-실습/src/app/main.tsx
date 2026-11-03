import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Token 층 ① OpenBridge 팔레트 (bright/day/dusk/night) ② K3I alias 토큰
import "@oicl/openbridge-webcomponents/dist/openbridge.css";
import "../styles/k3i-tokens.css";
import "./app.css";

// Block·Layout 층 등록
import "../ds/index.js";

import { App } from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
