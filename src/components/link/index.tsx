import { forwardRef } from "react";
import type { LinkProps } from "react-aria-components";
import { Link } from "react-aria-components";
import { bemHelper } from "~/util";
import "./index.scss";

export interface ExternalLinkProps extends Omit<LinkProps, "className"> {
  className?: string;
}

const cls = bemHelper("link");

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ className, ...props }, ref) => (
    <Link
      ref={ref}
      {...props}
      className={cls({
        extra: className,
      })}
    />
  ),
);

ExternalLink.displayName = "ExternalLink";
