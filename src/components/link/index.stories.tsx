import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ExternalLink } from ".";

const meta = {
  title: "Components/ExternalLink",
  component: ExternalLink,
  args: { onPress: fn(), children: "ExternalLink", href: "#" },
} satisfies Meta<typeof ExternalLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
