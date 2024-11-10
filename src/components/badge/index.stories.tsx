import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentPropsWithoutRef } from "react";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { colors } from "~/theme/colors";
import { pluralize } from "~/util";
import type { DistributiveOmit } from "~/util/types";
import { Badge } from ".";

const meta = {
  title: "Components/Badge",
  render: (args) => (
    <IconButton
      tooltip={pluralize`${args.badgeContent} ${[args.badgeContent, "notification"]}`}
    >
      <Badge {...args}>
        <Symbol>notifications</Symbol>
      </Badge>
    </IconButton>
  ),
  argTypes: {
    variant: { table: { disable: true } },
    color: { control: "select", options: colors },
    overlap: { control: "inline-radio", options: ["circle", "rectangle"] },
  },
  args: {
    badgeContent: 1,
    showZero: false,
    max: 99,
    color: "gold",
    collapsed: false,
    variant: "standard",
    overlap: "rectangle",
  },
} satisfies Meta<
  DistributiveOmit<ComponentPropsWithoutRef<typeof Badge>, "children">
>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Dot: Story = {
  render: (args) => (
    <IconButton tooltip="Notifications">
      <Badge {...args}>
        <Symbol>notifications</Symbol>
      </Badge>
    </IconButton>
  ),
  argTypes: {
    badgeContent: { table: { disable: true } },
    showZero: { table: { disable: true } },
    max: { table: { disable: true } },
  },
  args: { variant: "dot" },
};
