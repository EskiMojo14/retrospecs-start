import type { Meta, StoryObj } from "@storybook/react";
import { Grid, GridInner, GridCell, BreakpointDisplay } from ".";
import styles from "./story.module.scss";

const meta = {
  title: "Components/Grid",
  component: Grid,
  argTypes: {
    gutter: {
      control: {
        type: "number",
        step: 8,
      },
    },
    children: { table: { disable: true } },
  },
  args: {
    gutter: 16,
    children: null,
  },
} satisfies Meta<typeof Grid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  render: (args) => (
    <Grid {...args}>
      <GridCell span={4} className={styles.cell}>
        1
      </GridCell>
      <GridCell span={4} className={styles.cell}>
        2
      </GridCell>
      <GridCell span={4} className={styles.cell}>
        3
      </GridCell>
      <BreakpointDisplay />
    </Grid>
  ),
  args: {},
};

export const SubGrids: Story = {
  render: (args) => (
    <Grid {...args}>
      <GridInner>
        <GridCell span={6} className={styles.cell}>
          1
        </GridCell>
        <GridCell span={6} className={styles.cell}>
          <GridInner>
            <GridCell span={6} className={styles.cell}>
              a
            </GridCell>
            <GridCell span={6} className={styles.cell}>
              b
            </GridCell>
          </GridInner>
        </GridCell>
      </GridInner>
      <BreakpointDisplay />
    </Grid>
  ),
  args: {},
};
