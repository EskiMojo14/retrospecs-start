import type { Meta, StoryObj } from "@storybook/react";
import { Image } from ".";

const meta = {
  title: "Components/Image",
  component: (args) => (
    <div style={{ width: 300 }}>
      <Image {...args} src={"https://picsum.photos/500/300"} />
    </div>
  ),
  argTypes: {
    aspectRatio: {
      control: "select",
      options: [undefined, "square", "sixteen-nine", "[4, 3]"],
      mapping: {
        "[4, 3]": [4, 3],
      },
    },
    src: { table: { disable: true } },
  },
  args: {
    src: "",
  },
} satisfies Meta<typeof Image>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
