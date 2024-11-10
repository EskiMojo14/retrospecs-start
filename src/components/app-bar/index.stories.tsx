import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "~/components/badge";
import { Breadcrumb, Breadcrumbs } from "~/components/breadcrumbs";
import { IconButton } from "~/components/icon-button";
import { Link } from "~/components/link";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Logo } from "~/features/logo";
import { AppBar, AppBarRow } from ".";

const meta = {
  title: "Components/App Bar",
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <>
      <AppBar>
        <AppBarRow>
          <Toolbar as="nav" slot="nav" aria-label="Breadcrumbs">
            <Breadcrumbs>
              <Breadcrumb>
                <Logo href="/" aria-label="Home" />
              </Breadcrumb>
              <Breadcrumb>
                <Link href="/about">About</Link>
              </Breadcrumb>
            </Breadcrumbs>
          </Toolbar>
          <Toolbar slot="actions">
            <IconButton slot="action" tooltip="Notifications">
              <Badge badgeContent={1} color="blue" overlap="circle">
                <Symbol>notifications</Symbol>
              </Badge>
            </IconButton>
            <IconButton slot="action" tooltip="Sign out">
              <Symbol>logout</Symbol>
            </IconButton>
            <IconButton slot="action" tooltip="Preferences">
              <Symbol>settings_account_box</Symbol>
            </IconButton>
          </Toolbar>
        </AppBarRow>
      </AppBar>
      Some content
    </>
  ),
} satisfies Meta<typeof AppBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
