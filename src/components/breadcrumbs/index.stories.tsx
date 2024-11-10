import type { Meta, StoryObj } from "@storybook/react";
import { Link } from "~/components/link";
import { Breadcrumbs, Breadcrumb } from ".";

const meta = {
  title: "Components/Breadcrumbs",
  render: (args) => (
    <Breadcrumbs {...args}>
      <Breadcrumb>
        <Link href="/">Home</Link>
      </Breadcrumb>
      <Breadcrumb>
        <Link href="/products">Products</Link>
      </Breadcrumb>
      <Breadcrumb>
        <Link href="/products/123">Product 123</Link>
      </Breadcrumb>
    </Breadcrumbs>
  ),
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { isDisabled: false },
};
