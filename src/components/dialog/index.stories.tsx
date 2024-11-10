import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "~/components/button";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Typography, Heading } from "~/components/typography";
import { Dialog, DialogContent } from ".";

const meta = {
  title: "Components/Dialog",
  render: (props) => (
    <Dialog role="alertdialog" {...props}>
      {({ close }) => (
        <>
          <Heading variant="headline6" slot="title">
            Delete item
          </Heading>
          <DialogContent>
            <Typography variant="body1">
              Are you sure you want to delete this item?
            </Typography>
          </DialogContent>
          <Toolbar slot="actions">
            <Button onPress={close}>Cancel</Button>
            <Button onPress={close} variant="elevated" color="red">
              Delete
            </Button>
          </Toolbar>
        </>
      )}
    </Dialog>
  ),
  argTypes: {
    trigger: { table: { disable: true } },
  },
  args: {
    isDismissable: false,
    isKeyboardDismissDisabled: false,
    trigger: (
      <Button color="red">
        <Symbol slot="leading">delete</Symbol>
        Delete item
      </Button>
    ),
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
