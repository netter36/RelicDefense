// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],

  // ▶︎ **여기**를 수정해 주세요.
  base: "./", // <‑- 절대 경로 대신 상대 경로 사용

  server: {
    host: "0.0.0.0",
    port: 8000,
  },
  clearScreen: false,
});
