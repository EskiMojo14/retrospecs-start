import { defineConfig } from "@tanstack/react-start/config";
import viteConfig from "./vite.config";

export default defineConfig({
  tsr: {
    appDirectory: "./src",
  },
  vite: viteConfig,
});
