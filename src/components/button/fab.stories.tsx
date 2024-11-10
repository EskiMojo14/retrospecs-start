import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Symbol } from "~/components/symbol";
import { buttonColors } from "./constants";
import { Fab, ExtendedFab } from "./fab";

const meta = {
  title: "Components/Button/Fab",
  component: Fab,
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    placement: {
      control: "select",
      options: ["center", "corner"],
    },
    color: {
      control: "select",
      options: buttonColors,
    },
    onPress: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    onPress: fn(),
    children: <Symbol>add</Symbol>,
    size: "medium",
    color: "gold",
    exited: false,
    tooltip: "Create",
    placement: undefined,
  },
} satisfies Meta<typeof Fab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Extended: Story = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: ({ size, ...args }) => <ExtendedFab {...args} />,
  argTypes: {
    size: { table: { disable: true } },
  },
  args: {
    children: (
      <>
        <Symbol slot="leading">add</Symbol>
        Create
      </>
    ),
  },
};
