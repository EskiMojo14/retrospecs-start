import type { Meta, StoryObj } from "@storybook/react";
import { Dialog, DialogTrigger } from "react-aria-components";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { Heading, Typography } from "~/components/typography";
import { Popover } from ".";
import styles from "./story.module.scss";

const meta = {
  title: "Components/Popover",
  render: (args) => (
    <DialogTrigger>
      <IconButton tooltip="Help">
        <Symbol>info</Symbol>
      </IconButton>
      <Popover {...args}>
        <Dialog className={styles.dialog}>
          <Heading variant="subtitle1" slot="title">
            Help
          </Heading>
          <Typography variant="body2" className={styles.content}>
            For help accessing your account, please contact support.
          </Typography>
        </Dialog>
      </Popover>
    </DialogTrigger>
  ),
  argTypes: {
    placement: {
      control: "select",
      options: [
        "bottom",
        "bottom left",
        "bottom right",
        "bottom start",
        "bottom end",
        "top",
        "top left",
        "top right",
        "top start",
        "top end",
        "left",
        "left top",
        "left bottom",
        "start",
        "start top",
        "start bottom",
        "right",
        "right top",
        "right bottom",
        "end",
        "end top",
        "end bottom",
      ],
    },
  },
  args: {
    placement: "top",
    withBg: true,
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
