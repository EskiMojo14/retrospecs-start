import type { ReactNode } from "react";
import { Fragment } from "react";
import type { Key } from "react-aria-components";

export const IdFragment = ({ children }: { id: Key; children: ReactNode }) => (
  <Fragment>{children}</Fragment>
);
