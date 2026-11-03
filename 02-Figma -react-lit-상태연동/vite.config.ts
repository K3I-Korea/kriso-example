import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  // `npm run dev` → demo/index.html 을 띄움
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
