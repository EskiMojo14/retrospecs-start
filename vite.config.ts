import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vitest/config";

// we need to keep this because storybook uses it

export default defineConfig({
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  test: {
    setupFiles: ["./test-setup.ts"],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "legacy",
      },
    },
  },
  plugins: [tanstackStart()],
});
