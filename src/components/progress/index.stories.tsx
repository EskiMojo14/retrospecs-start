import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "~/theme/colors";
import type { ProgressProps } from ".";
import { CassetteProgress, CircularProgress, LinearProgress } from ".";

const meta = {
  title: "Components/Progress",
  render: () => <div />,
  argTypes: {
    style: { table: { disable: true } },
    "aria-label": { table: { disable: true } },
    color: { control: "select", options: colors },
    value: { control: "range", min: 0, max: 100 },
  },
  args: {
    color: "gold",
    isHidden: false,
    "aria-label": "Demo progress bar",
    thickness: 4,
  },
} satisfies Meta<ProgressProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DeterminateLinear: Story = {
  render: (args) => <LinearProgress {...args} />,
  args: {
    value: 50,
    style: { width: "50vw" },
  },
};

/*
export const IndeterminateLinear: Story = {
  render: (args) => <LinearProgress {...args} />,
  argTypes: {
    value: { table: { disable: true } },
  },
  args: {
    isIndeterminate: true,
    style: { width: "50vw" },
  },
};
*/

export const DeterminateCircular: Story = {
  render: (args) => <CircularProgress {...args} />,
  args: {
    value: 50,
  },
};

export const IndeterminateCircular: Story = {
  argTypes: {
    value: { table: { disable: true } },
  },
  render: (args) => <CircularProgress {...args} />,
  args: {
    isIndeterminate: true,
  },
};

export const DeterminateCassette: Story = {
  argTypes: {
    thickness: { table: { disable: true } },
  },
  render: (args) => <CassetteProgress {...args} />,
  args: {
    value: 50,
  },
};

export const IndeterminateCassette: Story = {
  argTypes: {
    value: { table: { disable: true } },
    thickness: { table: { disable: true } },
  },
  render: (args) => <CassetteProgress {...args} />,
  args: {
    isIndeterminate: true,
  },
};
