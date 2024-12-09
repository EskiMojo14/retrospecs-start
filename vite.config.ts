import type { CustomizableConfig } from "vinxi/dist/types/lib/vite-dev";
import type { defineConfig as defineViteConfig } from "vite";

// we need to keep this because storybook uses it

type ViteConfig = Parameters<typeof defineViteConfig>[0];

const defineConfig = <T extends ViteConfig & CustomizableConfig>(config: T) =>
  config;

export default defineConfig({
  resolve: {
    alias: {
      "~": "/src",
      "@": "/app",
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
});
