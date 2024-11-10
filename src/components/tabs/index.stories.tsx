import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "~/components/divider";
import { Symbol } from "~/components/symbol";
import type { Color } from "~/theme/colors";
import { colors } from "~/theme/colors";
import { Tabs, TabList, Tab, TabPanel } from ".";

interface StoryProps {
  isDisabled: boolean;
  icons: boolean | "inline";
  keyboardActivation: "manual" | "automatic";
  color: Color;
  variant: "filled" | "outlined";
}

const meta = {
  title: "Components/Tabs",
  render: ({ icons, color, variant, ...props }) => (
    <Tabs
      {...props}
      style={{
        width: "75vw",
      }}
    >
      <TabList
        inlineIcons={icons === "inline"}
        {...{ color, variant }}
        aria-label="Tab options"
      >
        <Tab id="flights" icon={icons && <Symbol>flight</Symbol>}>
          Flights
        </Tab>
        <Tab id="trips" icon={icons && <Symbol>trip</Symbol>}>
          Trips
        </Tab>
        <Tab id="explore" icon={icons && <Symbol>explore</Symbol>}>
          Explore
        </Tab>
      </TabList>
      <Divider variant="middle" />
      <TabPanel id="flights">
        Arma virumque cano, Troiae qui primus ab oris.
      </TabPanel>
      <TabPanel id="trips">Senatus Populusque Romanus.</TabPanel>
      <TabPanel id="explore">Alea jacta est.</TabPanel>
    </Tabs>
  ),
  argTypes: {
    icons: {
      control: "inline-radio",
      options: [false, true, "inline"],
    },
    keyboardActivation: {
      control: "inline-radio",
      options: ["manual", "automatic"],
    },
    color: {
      control: "select",
      options: colors,
    },
    variant: {
      control: "inline-radio",
      options: ["filled", "outlined"],
    },
  },
  args: {
    isDisabled: false,
    icons: true,
    keyboardActivation: "automatic",
    color: "gold",
    variant: "filled",
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
