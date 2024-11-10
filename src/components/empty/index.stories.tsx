import type { Meta, StoryObj } from "@storybook/react";
import { Symbol } from "~/components/symbol";
import { EmptyState } from ".";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["small", "medium", "large", "x-large"],
    },
    icon: { table: { disable: true } },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    icon: <Symbol>inbox</Symbol>,
    title: "No invites",
    description: "You have no pending invites.",
    size: "medium",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
