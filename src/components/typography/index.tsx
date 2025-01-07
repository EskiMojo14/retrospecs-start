import type {
  HTMLAttributes,
  ReactNode,
  RefAttributes,
  TimeHTMLAttributes,
} from "react";
import { useMemo } from "react";
import type { HeadingProps as AriaHeadingProps } from "react-aria-components";
import {
  Heading as AriaHeading,
  Header as AriaHeader,
} from "react-aria-components";
import { ClientOnly } from "remix-utils/client-only";
import { createGenericComponent } from "~/components/generic";
import { bemHelper } from "~/util";
import type { Overwrite, PickRequired } from "~/util/types";
import type { HeadingVariant, TypographyVariant } from "./constants";
import { levelMapping, variantMapping } from "./constants";
import "./index.scss";

export interface TypographyProps {
  variant: TypographyVariant;
  noMargin?: boolean;
  className?: string;
}

const cls = bemHelper("typography");

export const Typography = createGenericComponent<
  (typeof variantMapping)[keyof typeof variantMapping],
  TypographyProps,
  {
    className: string;
  }
>(
  "Typography",
  { getComponent: ({ variant }) => variantMapping[variant] },
  ({ variant, noMargin = true, className, as: As, ...props }) => (
    <As
      {...props}
      className={cls({
        modifier: {
          "no-margin": noMargin,
          [variant]: true,
        },
        extra: className,
      })}
    />
  ),
);

type HeadingProps = Overwrite<
  AriaHeadingProps,
  Overwrite<TypographyProps, { variant: HeadingVariant }>
> &
  RefAttributes<HTMLHeadingElement>;

export const Heading = (props: HeadingProps) => (
  <Typography as={AriaHeading} level={levelMapping[props.variant]} {...props} />
);

type HeaderProps = Overwrite<
  HTMLAttributes<HTMLElement>,
  Overwrite<TypographyProps, { variant: HeadingVariant }>
> &
  RefAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => (
  <Typography as={AriaHeader} {...props} />
);

type TimeProps = Overwrite<
  PickRequired<TimeHTMLAttributes<HTMLTimeElement>, "dateTime">,
  { children: (date: Date) => ReactNode }
> &
  RefAttributes<HTMLTimeElement>;

export const Time = ({ dateTime, children, ...rest }: TimeProps) => {
  const dateObj = useMemo(() => new Date(dateTime), [dateTime]);
  return (
    <time dateTime={dateTime} {...rest}>
      <ClientOnly fallback={dateTime}>{() => children(dateObj)}</ClientOnly>
    </time>
  );
};
