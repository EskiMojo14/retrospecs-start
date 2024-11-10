import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Link } from ".";

const meta = {
  title: "Components/Link",
  component: Link,
  args: { onPress: fn(), children: "Link", href: "#" },
} satisfies Meta<typeof Link>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
