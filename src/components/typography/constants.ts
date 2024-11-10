export const typographyVariants = [
  "headline1",
  "headline2",
  "headline3",
  "headline4",
  "headline5",
  "headline6",
  "body1",
  "body2",
  "subtitle1",
  "subtitle2",
  "button",
  "overline",
  "caption",
] as const;

export type TypographyVariant = (typeof typographyVariants)[number];

export const variantMapping = {
  headline1: "h1",
  headline2: "h2",
  headline3: "h3",
  headline4: "h4",
  headline5: "h5",
  headline6: "h6",
  body1: "p",
  body2: "p",
  subtitle1: "h6",
  subtitle2: "h6",
  button: "span",
  overline: "p",
  caption: "p",
} satisfies Record<TypographyVariant, keyof JSX.IntrinsicElements>;

export const levelMapping: {
  [K in TypographyVariant as (typeof variantMapping)[K] extends `h${number}`
    ? K
    : never]: (typeof variantMapping)[K] extends `h${infer N extends number}`
    ? N
    : never;
} = {
  headline1: 1,
  headline2: 2,
  headline3: 3,
  headline4: 4,
  headline5: 5,
  headline6: 6,
  subtitle1: 6,
  subtitle2: 6,
};

export type HeadingVariant = keyof typeof levelMapping;
