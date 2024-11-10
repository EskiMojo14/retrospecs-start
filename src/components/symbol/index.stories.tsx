import type { Meta, StoryObj } from "@storybook/react";
import type { ComponentPropsWithoutRef, ComponentType } from "react";
import { Symbol } from ".";

interface StoryProps {
  dir?: "ltr" | "rtl";
}

const meta = {
  title: "Components/Symbol",
  component: Symbol as ComponentType<
    ComponentPropsWithoutRef<typeof Symbol> & StoryProps
  >,
  argTypes: {
    weight: {
      control: {
        type: "range",
        min: 100,
        max: 700,
        step: 100,
      },
    },
    grade: {
      control: {
        type: "range",
        min: -25,
        max: 200,
      },
    },
    size: {
      control: {
        type: "range",
        min: 20,
        max: 48,
      },
    },
    opticalSize: {
      control: {
        type: "range",
        min: 20,
        max: 48,
      },
    },
    dir: {
      control: {
        type: "inline-radio",
      },
      options: ["ltr", "rtl"],
    },
  },
  args: {
    children: "edit",
    fill: false,
    weight: 400,
    grade: undefined,
    opticalSize: undefined,
    size: 24,
    flipRtl: false,
    dir: "ltr",
  },
} satisfies Meta<ComponentPropsWithoutRef<typeof Symbol> & StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
