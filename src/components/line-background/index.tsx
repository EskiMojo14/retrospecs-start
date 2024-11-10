import { clsx } from "clsx";
import type { ReactNode } from "react";
import { bemHelper } from "~/util";
import type { BackgroundColor } from "./constants";
import "./index.scss";

export interface LineBackgroundProps {
  scale?: number;
  color?: BackgroundColor;
  className?: string;
  children?: ReactNode;
  opacity?: number;
  contentProps?: {
    className?: string;
  };
}

const cls = bemHelper("line-background");

export function LineBackground({
  scale,
  color,
  className,
  children,
  opacity = 1,
  contentProps,
}: LineBackgroundProps) {
  return (
    <>
      <div
        aria-hidden
        className={cls({
          modifiers: { [color ?? ""]: !!color },
          extra: className,
        })}
        style={{
          "--scale": scale,
          opacity,
        }}
        dir="ltr"
      >
        <div className={cls("line", "vertical")} />
        <div className={cls("bottom-row")}>
          <div className={cls("corner")} />
          <div className={cls("line", "horizontal")} />
          <div className={cls("whorl")} />
          <div className={cls("line", "horizontal")} />
        </div>
      </div>
      <div className={clsx("line-background-content", contentProps?.className)}>
        {children}
      </div>
    </>
  );
}
