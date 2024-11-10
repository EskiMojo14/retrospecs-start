import type { Meta, StoryObj } from "@storybook/react";
import { Button, LinkButton } from "~/components/button";
import { Symbol } from "~/components/symbol";
import { toastTypes, type Toast } from "./constants";
import { GlobalToastRegion } from "./toast-region";
import { toastQueue } from ".";

type StoryProps = Toast & {
  hasAction?: boolean;
  timeout?: number;
};

const meta = {
  title: "Components/Toast",
  render: ({ symbol, hasAction, timeout, ...toast }) => {
    return (
      <>
        <Button
          onPress={() =>
            toastQueue.add(
              {
                ...toast,
                symbol: symbol ? <Symbol>{symbol}</Symbol> : undefined,
                actions: hasAction
                  ? ({ close }) => (
                      <LinkButton variant="outlined" onPress={close} href="#">
                        Take me there
                      </LinkButton>
                    )
                  : undefined,
              },
              { timeout },
            )
          }
        >
          Queue toast
        </Button>
        <GlobalToastRegion />
      </>
    );
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: toastTypes,
    },
    symbol: {
      control: "text",
    },
    timeout: {
      control: "number",
    },
  },
  args: {
    type: "default",
    title: "",
    description: "This is a toast message.",
    hasAction: false,
    timeout: undefined,
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
