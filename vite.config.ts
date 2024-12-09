import type { CustomizableConfig } from "vinxi/dist/types/lib/vite-dev";
import type { UserConfig } from "vite";

// we need to keep this because storybook uses it

export default {
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
} satisfies CustomizableConfig & Pick<UserConfig, "test">;
