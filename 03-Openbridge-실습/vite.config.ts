import { defineConfig } from "vite";

export default defineConfig({
  // OpenBridge 는 process.env.NODE_ENV 로 개발 모드 경고를 켠다 (decorator.js 의 중복 등록 경고 등)
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
  },
  esbuild: {
    jsx: "automatic",
  },
});
