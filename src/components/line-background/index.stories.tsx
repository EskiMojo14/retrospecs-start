import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentPropsWithoutRef } from "react";
import { backgroundColors } from "./constants";
import { LineBackground } from ".";

interface StoryProps extends ComponentPropsWithoutRef<typeof LineBackground> {
  width: number;
  height: number;
  opacity: number;
}

const meta = {
  title: "Components/LineBackground",
  render: ({ height, width, ...props }) => (
    <div
      style={{
        height: `${height}vh`,
        width: `${width}vw`,
        position: "relative",
        transition: "height 0.25s, width 0.25s",
      }}
    >
      <LineBackground {...props} />
    </div>
  ),
  argTypes: {
    width: {
      control: {
        type: "range",
        min: 0,
        max: 100,
        step: 10,
      },
    },
    height: {
      control: {
        type: "range",
        min: 0,
        max: 100,
        step: 10,
      },
    },
    opacity: {
      control: {
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
      },
    },
    scale: {
      control: {
        type: "range",
        min: 0.5,
        max: 2,
        step: 0.5,
      },
    },
    color: {
      control: "select",
      options: [undefined, ...backgroundColors],
    },
  },
  args: { scale: 1, opacity: 1, height: 50, width: 50, color: undefined },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
