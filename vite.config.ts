import type { CustomizableConfig } from "vinxi/dist/types/lib/vite-dev";
import type { ViteUserConfig } from "vitest/config";

// we need to keep this because storybook uses it

export default {
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
} satisfies CustomizableConfig & Pick<ViteUserConfig, "test">;
