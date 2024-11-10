import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { ComponentPropsWithoutRef } from "react";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { colors } from "~/theme/colors";
import { TextField } from "./text-field";

interface StoryProps
  extends Omit<ComponentPropsWithoutRef<typeof TextField>, "icon" | "action"> {
  icon: boolean;
  action: boolean;
}

const meta = {
  title: "Components/TextField",
  render: ({ icon, action, ...args }) => (
    <TextField
      {...args}
      icon={icon ? <Symbol>id_card</Symbol> : undefined}
      action={
        action ? (
          <IconButton slot="action" tooltip="Clear">
            <Symbol>cancel</Symbol>
          </IconButton>
        ) : undefined
      }
    />
  ),
  argTypes: {
    color: {
      control: "select",
      options: colors,
    },
  },
  args: {
    onChange: fn(),
    onAction: fn(),
    isDisabled: false,
    textarea: false,
    icon: true,
    action: true,
    label: "Label",
    description: "Description",
    color: "gold",
    placeholder: "Placeholder",
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
