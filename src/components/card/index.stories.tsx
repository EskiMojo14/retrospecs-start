import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "~/components/button";
import { Divider } from "~/components/divider";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { colors } from "~/theme/colors";
import { cardVariants } from "./constants";
import { Card, CardActions, CardPrimaryAction, CardSection } from ".";

interface StoryArgs extends ComponentPropsWithoutRef<typeof Card> {
  onPrimaryAction?: () => void;
  onActionButton?: () => void;
  onActionIcon?: () => void;
}

const meta: Meta<ComponentPropsWithoutRef<typeof Card> & StoryArgs> = {
  title: "Components/Card",
  component: Card,
  argTypes: {
    color: {
      control: "select",
      options: colors,
    },
    variant: {
      control: "select",
      options: cardVariants,
    },
    onPrimaryAction: { table: { disable: true } },
    onActionButton: { table: { disable: true } },
    onActionIcon: { table: { disable: true } },
    style: { table: { disable: true } },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: ({ onPrimaryAction, onActionButton, onActionIcon, ...args }) => (
    <Card {...args}>
      <CardPrimaryAction
        onPress={onPrimaryAction}
        style={{
          padding: "16px",
        }}
      >
        Primary action
      </CardPrimaryAction>
      <Divider />
      <CardSection
        style={{
          padding: "16px",
        }}
      >
        Normal section
      </CardSection>
      <Divider />
      <CardActions>
        <Toolbar slot="buttons">
          <Button onPress={onActionButton} slot="action">
            Button
          </Button>
          <Button onPress={onActionButton} slot="action">
            Button
          </Button>
        </Toolbar>
        <Toolbar slot="icons">
          <IconButton onPress={onActionIcon} tooltip="Edit" slot="action">
            <Symbol>edit</Symbol>
          </IconButton>
          <IconButton tooltip="Delete" slot="action">
            <Symbol>delete</Symbol>
          </IconButton>
        </Toolbar>
      </CardActions>
    </Card>
  ),
  args: {
    onPrimaryAction: fn(),
    onActionButton: fn(),
    onActionIcon: fn(),
    color: "gold",
    variant: "filled",
  },
};
