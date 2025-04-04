import {
  use,
  useMemo,
  type Context,
  type Provider,
  type ReactNode,
} from "react";
import type { ContextValue } from "react-aria-components";
import { mergeSlottedContext } from "~/util";

type ProviderTuple<T> = [Context<T>, T];

/**
 * A component that wraps a tree of components with multiple context providers.
 */
export function Provider<ContextValues extends Array<any>>({
  children,
  values,
}: {
  children: ReactNode;
  values: {
    [I in keyof ContextValues]: ProviderTuple<ContextValues[I]>;
  };
}) {
  return values.reduceRight(
    (acc, [Context, value]) => <Context value={value}>{acc}</Context>,
    children,
  );
}

export const MergeProvider = <T, El extends HTMLElement>({
  children,
  context: Context,
  value,
}: {
  context: Context<ContextValue<T, El>>;
  value: ContextValue<T, El>;
  children: ReactNode;
}) => {
  const parentValue = use(Context);
  const merged = useMemo(
    () => mergeSlottedContext(parentValue, value),
    [parentValue, value],
  );
  return <Context value={merged}>{children}</Context>;
};
