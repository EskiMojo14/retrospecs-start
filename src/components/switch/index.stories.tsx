import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Symbol } from "~/components/symbol";
import { colors } from "~/theme/colors";
import { Switch } from ".";

const meta = {
  title: "Components/Switch",
  component: Switch,
  argTypes: {
    color: {
      control: "select",
      options: colors,
    },
  },
  args: {
    onChange: fn(),
    children: "Label",
    isDisabled: false,
    color: "gold",
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const DynamicLabel: Story = {
  argTypes: {
    children: { table: { disable: true } },
  },
  args: {
    icon: ({ isSelected }) => <Symbol>{isSelected ? "check" : "close"}</Symbol>,
    children: ({ isSelected }) => (isSelected ? "Selected" : "Not selected"),
  },
};
