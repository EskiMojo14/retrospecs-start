import type { CustomizableConfig } from "vinxi/dist/types/lib/vite-dev";
import type { defineConfig as defineViteConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// we need to keep this because storybook uses it

type ViteConfig = Parameters<typeof defineViteConfig>[0];

const defineConfig = <T extends ViteConfig & CustomizableConfig>(config: T) =>
  config;

export default defineConfig({
  plugins: [viteTsConfigPaths({ projects: ["./tsconfig.json"] })],
});
