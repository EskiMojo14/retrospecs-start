import { useMemo, type ReactNode } from "react";
import { SymbolContext } from "~/components/symbol";
import { Heading, Typography } from "~/components/typography";
import type {
  HeadingVariant,
  TypographyVariant,
} from "~/components/typography/constants";
import { bemHelper } from "~/util";
import "./index.scss";

const cls = bemHelper("empty-state");

type EmptySize = "small" | "medium" | "large" | "x-large";

const sizeMapping = {
  small: {
    title: "subtitle1",
    description: "body2",
    icon: 36,
  },
  medium: {
    title: "headline6",
    description: "body1",
    icon: 48,
  },
  large: {
    title: "headline5",
    description: "body1",
    icon: 64,
  },
  "x-large": {
    title: "headline4",
    description: "subtitle1",
    icon: 72,
  },
} satisfies Record<
  EmptySize,
  { title: HeadingVariant; description: TypographyVariant; icon: number }
>;

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  size?: EmptySize;
}

export function EmptyState({
  icon,
  title,
  description,
  size = "medium",
}: EmptyStateProps) {
  const symbolContextValue = useMemo(
    () => ({
      size: sizeMapping[size].icon,
      className: cls("icon"),
    }),
    [size],
  );
  return (
    <div className={cls()}>
      {icon && (
        <SymbolContext value={symbolContextValue}>
          {icon}
        </SymbolContext>
      )}
      <Heading variant={sizeMapping[size].title} className={cls("title")}>
        {title}
      </Heading>
      <Typography
        variant={sizeMapping[size].description}
        className={cls("description")}
      >
        {description}
      </Typography>
    </div>
  );
}
