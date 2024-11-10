import type { Meta, StoryObj } from "@storybook/react";
import { startCase } from "lodash";
import { Button } from "~/components/button";
import { Symbol } from "~/components/symbol";
import { typographyVariants } from "./constants";
import { Typography } from ".";
import styles from "./story.module.scss";

interface StoryProps {
  dark?: boolean;
  children?: string;
}

function DemoLayout({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <div data-theme={theme} className={styles.demo}>
      <Typography variant="overline">Overline</Typography>
      <Typography variant="headline2">Headline</Typography>
      <Typography variant="subtitle1">Subtitle</Typography>
      <Typography variant="body2">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
        convallis interdum laoreet. Sed semper velit erat, eget tincidunt nulla
        rhoncus porta. Mauris porta accumsan convallis. Curabitur convallis eget
        ante eu ultrices. Nulla facilisi. Pellentesque pharetra felis non tempus
        dictum. Aliquam ultrices erat ut turpis consectetur, vitae venenatis
        tortor faucibus. Phasellus non est a nibh sodales porta at quis eros.
        Cras purus dolor, mollis ac dictum eu, commodo in ipsum. Orci varius
        natoque penatibus et magnis dis parturient montes, nascetur ridiculus
        mus.
        {"\n\n"}Aliquam quis venenatis massa. Nulla a auctor enim. Cras feugiat
        imperdiet enim, vitae porta dolor rhoncus eu. Etiam velit mi, pretium et
        mi ut, scelerisque molestie enim. Nulla quis consequat nulla. Proin
        porttitor eleifend volutpat. Mauris blandit consectetur commodo. Vivamus
        bibendum massa non est bibendum porta. Cras sit amet nibh libero.
        Vivamus quam est, placerat et malesuada quis, tincidunt eget lectus.
        Fusce id fringilla purus, placerat finibus magna. Aliquam enim mi,
        feugiat at lacinia et, finibus a est. Phasellus et leo bibendum,
        dignissim urna eu, condimentum tellus. Suspendisse eu scelerisque urna.
      </Typography>
      <img
        src="https://picsum.photos/300/200"
        width={300}
        height={200}
        alt="placeholder"
      />
      <Typography variant="caption">Caption</Typography>
      <Typography variant="subtitle1">Subtitle</Typography>
      <Typography variant="body2">
        Integer ultricies non lacus non laoreet. Donec faucibus ullamcorper
        ante, vel suscipit tellus feugiat in. Quisque in nisi nec arcu ornare
        commodo eget ac massa. Donec mattis accumsan quam vel rutrum. Nullam
        vitae pharetra dui. Aenean ex enim, pharetra sed orci id, tristique
        fringilla urna. Proin porttitor consequat nisi vitae ornare. Nam ac
        auctor nibh. Proin nec viverra tortor. Aenean lacus libero, vulputate a
        luctus ut, tempor quis metus. Sed eget ex nec purus imperdiet
        ullamcorper. Aenean id malesuada enim.
      </Typography>
      <div className={styles.buttonContainer}>
        <Button variant="outlined">
          <Symbol>share</Symbol>
          Button
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Typography",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: (_args) => (
    <div className={styles.sideBySide}>
      <DemoLayout />
      <DemoLayout theme="dark" />
    </div>
  ),
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    dark: { table: { disable: true } },
  },
  args: { dark: false },
} satisfies Meta<StoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

function Variants({
  theme = "light",
  children,
}: {
  theme?: "light" | "dark";
  children?: string;
}) {
  return (
    <div className={styles.all} data-theme={theme}>
      {typographyVariants.map((variant) => (
        <Typography key={variant} variant={variant}>
          {
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            children || startCase(variant)
          }
        </Typography>
      ))}
    </div>
  );
}
export const AllVariants: Story = {
  args: {},
  argTypes: {},
  render: ({ children }) => (
    <div className={styles.sideBySide}>
      <Variants>{children}</Variants>
      <Variants theme="dark">{children}</Variants>
    </div>
  ),
};
