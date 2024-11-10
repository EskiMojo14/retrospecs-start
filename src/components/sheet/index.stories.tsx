import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "react-aria-components";
import { Button } from "~/components/button";
import { Checkbox } from "~/components/checkbox";
import { Divider } from "~/components/divider";
import { IconButton } from "~/components/icon-button";
import { List, ListItem } from "~/components/list";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Heading } from "~/components/typography";
import { ModalSideSheet, SheetContent } from ".";

const meta = {
  title: "Components/SideSheet",
  render: (props) => (
    <ModalSideSheet {...props}>
      {({ close }) => (
        <>
          <Header slot="title">
            <Heading variant="headline6" slot="title">
              Filters
            </Heading>
            <IconButton onPress={close} tooltip="Close">
              <Symbol>close</Symbol>
            </IconButton>
          </Header>
          <SheetContent>
            <section>
              <Heading
                variant="subtitle2"
                style={{ padding: "0 24px" }}
                id="label-title"
              >
                Labels
              </Heading>
              <List
                variant="one-line"
                selectionMode="multiple"
                aria-labelledby="label-title"
              >
                {["Events", "Personal", "Projects", "Reminders", "Family"].map(
                  (category) => (
                    <ListItem key={category} textValue={category}>
                      <Checkbox slot="selection" />
                      {category}
                    </ListItem>
                  ),
                )}
              </List>
            </section>
          </SheetContent>
          <Divider />
          <Toolbar slot="actions">
            <Button onPress={close} variant="filled">
              Save
            </Button>
            <Button onPress={close} variant="outlined">
              Cancel
            </Button>
          </Toolbar>
        </>
      )}
    </ModalSideSheet>
  ),
  argTypes: {
    trigger: { table: { disable: true } },
    attach: {
      control: "inline-radio",
      options: ["start", "end"],
    },
  },
  args: {
    isDismissable: false,
    isKeyboardDismissDisabled: false,
    trigger: <Button>Open sheet</Button>,
    attach: "end",
  },
} satisfies Meta<typeof ModalSideSheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
