import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import lowerCase from "lodash/lowerCase";
import upperFirst from "lodash/upperFirst";
import type { ComponentPropsWithoutRef } from "react";
import { Symbol } from "~/components/symbol";
import { colors } from "~/theme/colors";
import { Select, SelectItem } from "./select";

interface StoryProps
  extends Omit<ComponentPropsWithoutRef<typeof Select>, "icon" | "children"> {
  icon: boolean | "dynamic";
}

const moodIcons: Record<string, string> = {
  very_satisfied: "sentiment_very_satisfied",
  satisfied: "sentiment_satisfied",
  neutral: "sentiment_neutral",
  dissatisfied: "sentiment_dissatisfied",
  very_dissatisfied: "sentiment_very_dissatisfied",
};

const meta = {
  title: "Components/Select",
  render: ({ icon, ...args }) => (
    <Select
      {...args}
      icon={icon === true ? <Symbol>mood</Symbol> : undefined}
      items={Object.entries(moodIcons)}
      placeholder="Select your mood"
      renderSelected={({ isPlaceholder, defaultChildren }) =>
        isPlaceholder && icon === "dynamic" ? (
          <>
            <Symbol>mood</Symbol>
            {defaultChildren}
          </>
        ) : (
          defaultChildren
        )
      }
    >
      {([mood, iconName]) => (
        <SelectItem
          key={mood}
          id={mood}
          textValue={upperFirst(lowerCase(mood))}
        >
          {icon === "dynamic" && <Symbol>{iconName}</Symbol>}
          {upperFirst(lowerCase(mood))}
        </SelectItem>
      )}
    </Select>
  ),
  argTypes: {
    icon: {
      control: "select",
      options: [false, true, "dynamic"],
    },
    color: {
      control: "select",
      options: colors,
    },
  },
  args: {
    onSelectionChange: fn(),
    isDisabled: false,
    icon: true,
    label: "Mood",
    description: "How do you feel?",
    color: "gold",
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
