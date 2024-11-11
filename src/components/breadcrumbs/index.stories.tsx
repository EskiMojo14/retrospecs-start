import type { Meta, StoryObj } from "@storybook/react";
import { ExternalLink } from "~/components/link";
import { Breadcrumbs, Breadcrumb } from ".";

const meta = {
  title: "Components/Breadcrumbs",
  render: (args) => (
    <Breadcrumbs {...args}>
      <Breadcrumb>
        <ExternalLink href="/">Home</ExternalLink>
      </Breadcrumb>
      <Breadcrumb>
        <ExternalLink href="/products">Products</ExternalLink>
      </Breadcrumb>
      <Breadcrumb>
        <ExternalLink href="/products/123">Product 123</ExternalLink>
      </Breadcrumb>
    </Breadcrumbs>
  ),
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { isDisabled: false },
};
