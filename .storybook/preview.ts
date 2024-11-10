import type { Preview } from "@storybook/react";
import { darkThemeDecorator, rtlDecorator } from "./decorators";
import "./scss-loader.scss";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        method: "alphabetical",
      },
    },
    layout: "centered",
  },
  args: {
    dark: window.matchMedia("(prefers-color-scheme: dark)").matches,
    dir: "ltr",
  },
  argTypes: {
    dark: {
      control: "boolean",
    },
    dir: {
      control: {
        type: "inline-radio",
      },
      options: ["ltr", "rtl"],
    },
  },
  decorators: [darkThemeDecorator, rtlDecorator],
};

export default preview;
