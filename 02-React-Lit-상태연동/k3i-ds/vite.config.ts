import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // 개발 서버의 기준 폴더. `npm run dev` 를 하면 루트 index.html(http://localhost:5173)과
  // demo/react.html(/demo/react.html)이 모두 서빙된다.
  root: ".",
  build: {
    outDir: "dist",
    emptyOutDir: false, // tokens.css 를 지우지 않도록
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        react: resolve(__dirname, "src/react/index.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      // 소비하는 앱이 lit / react 를 직접 설치하도록 번들에서 제외
      external: [/^lit/, "react", "@lit/react"],
    },
  },
});
