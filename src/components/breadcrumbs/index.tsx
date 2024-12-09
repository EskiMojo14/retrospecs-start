import { clsx } from "clsx";
import type { BreadcrumbProps as AriaBreadcrumbProps } from "react-aria-components";
import {
  Breadcrumbs as AriaBreadcrumbs,
  Breadcrumb as AriaBreadcrumb,
  composeRenderProps,
} from "react-aria-components";
import { Symbol } from "~/components/symbol";
import { bemHelper } from "~/util";
import "./index.scss";

export const Breadcrumbs: typeof AriaBreadcrumbs = ({
  className,
  ...props
}) => <AriaBreadcrumbs {...props} className={clsx("breadcrumbs", className)} />;

const cls = bemHelper("breadcrumb");

interface BreadcrumbProps extends Omit<AriaBreadcrumbProps, "className"> {
  className?: string;
}

export const Breadcrumb = ({
  className,
  children,
  ...props
}: BreadcrumbProps) => (
  <AriaBreadcrumb
    {...props}
    className={cls({
      extra: className,
    })}
  >
    {composeRenderProps(children, (children) => (
      <>
        {children}
        <Symbol flipRtl className={cls("icon")}>
          chevron_right
        </Symbol>
      </>
    ))}
  </AriaBreadcrumb>
);
