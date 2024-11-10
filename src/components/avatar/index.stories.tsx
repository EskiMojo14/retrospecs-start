import type { Meta, StoryObj } from "@storybook/react";
import {
  useState,
  type ComponentPropsWithoutRef,
  type ComponentType,
} from "react";
import { Dialog, DialogTrigger } from "react-aria-components";
import { Button, ButtonGroup, ToggleButton } from "~/components/button";
import { List, ListItem, ListItemText } from "~/components/list";
import { Popover } from "~/components/popover";
import { Symbol } from "~/components/symbol";
import { Tooltip, TooltipTrigger } from "~/components/tooltip";
import { Heading } from "~/components/typography";
import type { Color } from "~/theme/colors";
import { colors } from "~/theme/colors";
import { pluralize } from "~/util";
import type { AvatarGroupProps } from ".";
import { Avatar, AvatarGroup } from ".";
import styles from "./story.module.scss";

export interface StoryProps
  extends ComponentPropsWithoutRef<typeof Avatar>,
    Pick<AvatarGroupProps<any>, "spacing" | "max"> {}

const meta = {
  title: "Components/Avatar",
  component: Avatar as ComponentType<StoryProps>,
  argTypes: {
    size: {
      control: "select",
      options: ["x-small", "small", "medium", "large"],
    },
    color: {
      control: "select",
      options: colors,
    },
    children: {
      control: "text",
    },
    font: {
      control: "inline-radio",
      options: ["standard", "funky"],
    },
    spacing: { table: { disable: true } },
  },
  args: {
    color: "blue",
    name: "John Smith",
    src: "https://avatars.githubusercontent.com/u/18308300?v=4",
    size: "medium",
    children: undefined,
    font: "funky",
  },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

const examples: Array<{ name: string; color: Color; src?: string }> = [
  {
    name: "Tom",
    color: "blue",
    src: "https://avatars.githubusercontent.com/u/18308300?v=4",
  },
  {
    name: "Dick",
    color: "pink",
    src: "https://avatars.githubusercontent.com/u/176902558?v=4",
  },
  { name: "Harry", color: "green" },
];

function LikeButton(props: StoryProps) {
  const [liked, setLiked] = useState(false);
  const likedBy = liked ? examples : examples.slice(1);
  return (
    <ButtonGroup id="like-button" variant="outlined">
      <ToggleButton
        onChange={(liked) => {
          setLiked(liked);
        }}
      >
        <Symbol slot="trailing">thumb_up</Symbol>
        {pluralize`${likedBy.length} ${[likedBy.length, "like"]}`}
      </ToggleButton>
      <TooltipTrigger>
        <DialogTrigger>
          <Button>
            <AvatarGroup {...props} items={likedBy}>
              {(props) => <Avatar id={props.name} {...props} />}
            </AvatarGroup>
          </Button>
          <Popover placement="bottom" className={styles.popover}>
            <Dialog className={styles.dialog}>
              <Heading variant="subtitle1" slot="title">
                Reactions
              </Heading>
              <List variant="one-line" items={likedBy} className={styles.list}>
                {(props) => (
                  <ListItem id={props.name}>
                    <Avatar {...props} />
                    <ListItemText headline={props.name} />
                  </ListItem>
                )}
              </List>
            </Dialog>
          </Popover>
        </DialogTrigger>
        <Tooltip>Reactions from {liked ? "Tom, " : ""}Dick, and 4 more</Tooltip>
      </TooltipTrigger>
    </ButtonGroup>
  );
}

export const Group: Story = {
  argTypes: {
    name: { table: { disable: true } },
    src: { table: { disable: true } },
    children: { table: { disable: true } },
    max: {
      control: {
        type: "range",
        min: 2,
        max: examples.length,
      },
    },
    spacing: {
      control: "inline-radio",
      options: ["small", "medium", "large"],
      table: { disable: false },
    },
    size: { table: { disable: true } },
    color: { table: { disable: true } },
  },
  render: (props) => <LikeButton {...props} />,
  args: {
    spacing: "medium",
    size: "x-small",
    max: 3,
  },
};
