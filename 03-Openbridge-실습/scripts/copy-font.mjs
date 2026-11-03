// OpenBridge 가 함께 배포하는 Noto Sans 폰트를 public/ 으로 복사 (오프라인 선교 환경 대비)
import { copyFileSync, existsSync, mkdirSync } from "node:fs";

const src = "node_modules/@oicl/openbridge-webcomponents/dist/NotoSans.ttf";
mkdirSync("public", { recursive: true });
if (!existsSync("public/NotoSans.ttf")) {
  copyFileSync(src, "public/NotoSans.ttf");
  console.log("✔ public/NotoSans.ttf 복사");
}
