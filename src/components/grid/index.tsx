import type { CSSProperties, ReactNode } from "react";
import { Children, isValidElement, useMemo } from "react";
import { createGenericComponent } from "~/components/generic";
import type { Breakpoint } from "~/theme/layout";
import { bemHelper } from "~/util";
import "./index.scss";

const cls = bemHelper("grid");

export interface GridProps {
  className?: string;
  gutter?: number;
  children: ReactNode;
}

export const Grid = createGenericComponent<
  "div",
  GridProps,
  { className: string; children: ReactNode; style: CSSProperties }
>("Grid", "div", ({ as: As, className, children, gutter, ...props }, ref) => {
  // eslint-disable-next-line @eslint-react/no-children-to-array
  const firstEl = Children.toArray(children)[0];
  const needsInner = !isValidElement(firstEl) || firstEl.type !== GridInner;
  return (
    <As
      {...props}
      ref={ref}
      className={cls({
        extra: className,
      })}
      style={{
        "--gutter": gutter ? `${gutter}px` : undefined,
      }}
    >
      {needsInner ? <GridInner>{children}</GridInner> : children}
    </As>
  );
});

export const GridInner = createGenericComponent<
  "div",
  { className?: string },
  { className: string }
>("GridInner", "div", ({ as: As, className, ...props }, ref) => (
  <As
    {...props}
    ref={ref}
    className={cls({
      element: "inner",
      extra: className,
    })}
  />
));

export interface GridCellProps {
  className?: string;
  start?: number;
  span?: number | "full" | "half";
  breakpoints?: Partial<
    Record<
      Breakpoint,
      {
        start?: number;
        span?: number | "full" | "half";
      }
    >
  >;
}

export const GridCell = createGenericComponent<
  "div",
  GridCellProps,
  { className: string; style: CSSProperties }
>(
  "GridCell",
  "div",
  ({ as: As, className, span, start, breakpoints, ...props }, ref) => {
    const { vars, classNames } = useMemo(() => {
      const classNames = [];
      const vars: Record<string, string | number | undefined> = {};
      for (const [bp, { span, start }] of Object.entries(breakpoints ?? {})) {
        if (start) vars[`--start-${bp}`] = start;
        if (span) {
          if (span === "full" || span === "half") {
            classNames.push(`span-${span}-${bp}`);
          } else {
            vars[`--span-${bp}`] = span;
          }
        }
      }
      return { vars, classNames };
    }, [breakpoints]);
    return (
      <As
        {...props}
        ref={ref}
        className={cls({
          element: "cell",
          modifiers: [
            typeof span === "string" ? "span-" + span : "",
            ...classNames,
          ],
          extra: className,
        })}
        style={{
          "--start": start,
          "--span": typeof span === "number" ? span : undefined,
          ...vars,
        }}
      />
    );
  },
);

export const BreakpointDisplay = () =>
  process.env.NODE_ENV === "development" ? (
    <div className="breakpoint-display" />
  ) : null;
