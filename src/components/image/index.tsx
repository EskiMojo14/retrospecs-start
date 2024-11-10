import type { ComponentPropsWithoutRef } from "react";
import { bemHelper } from "~/util";
import "./index.scss";

const aspectRatios = {
  square: [1, 1],
  "sixteen-nine": [16, 9],
};

export interface ImageProps extends ComponentPropsWithoutRef<"img"> {
  containerProps?: ComponentPropsWithoutRef<"div">;
  aspectRatio?: keyof typeof aspectRatios | [w: number, h: number];
}

const cls = bemHelper("image");

export const Image = ({
  containerProps,
  aspectRatio,
  className,
  ...props
}: ImageProps) => {
  const [width, height] = Array.isArray(aspectRatio)
    ? aspectRatio
    : aspectRatio
      ? aspectRatios[aspectRatio]
      : [];
  return (
    <div
      {...containerProps}
      className={cls({
        modifier: typeof aspectRatio === "string" ? aspectRatio : undefined,
        extra: containerProps?.className,
      })}
      style={{
        "--aspect-h": height,
        "--aspect-w": width,
      }}
    >
      <img
        className={cls({
          element: "image",
          extra: className,
        })}
        {...props}
      />
    </div>
  );
};
