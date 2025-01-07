import type {
  ComponentPropsWithRef,
  ComponentType,
  ForwardedRef,
  JSXElementConstructor,
  ReactNode,
  Ref,
} from "react";
import { forwardRef } from "react";
import { composeRenderProps } from "react-aria-components";
import type { Overwrite } from "~/util/types";

const propSymbol = Symbol("prop");
const refSymbol = Symbol("ref");

type PlaceholderComponent<PassedProps> = ComponentType<
  Overwrite<PassedProps, { [propSymbol]: true; ref: Ref<typeof refSymbol> }>
>;

/** To make sure all props and the ref is passed through, we fake some types here */
type GenericRenderFunction<RecievedProps, PassedProps> = (
  props: RecievedProps & { as: PlaceholderComponent<PassedProps> } & {
    [propSymbol]: true;
  },
  ref: ForwardedRef<typeof refSymbol>,
) => React.JSX.Element;

type GenericComponentProps<Component extends ElementType, Acc extends {} = {}> =
  Component extends GenericComponentInternal<
    infer DefaultComponent,
    infer ReceivedProps
  >
    ? GenericComponentProps<DefaultComponent, ReceivedProps & Acc>
    : Overwrite<ComponentPropsWithRef<Component>, Acc>;

interface GenericComponentInternal<
  DefaultComponent extends ElementType<PassedProps>,
  ReceivedProps extends {},
  PassedProps extends {} = {},
> {
  /** These are fake properties for inference, they will never exist in runtime */
  __GenericComponentTypes?: {
    DefaultComponent: DefaultComponent;
    ReceivedProps: ReceivedProps;
    PassedProps: PassedProps;
  };
}

export interface GenericComponent<
  DefaultComponent extends ElementType<PassedProps>,
  ReceivedProps extends {},
  PassedProps extends {} = {},
> extends GenericComponentInternal<
    DefaultComponent,
    ReceivedProps,
    PassedProps
  > {
  /** Allow passing a placeholder component (i.e. we are inside a generic component's render func) */
  (
    props: { as: PlaceholderComponent<PassedProps> } & GenericComponentProps<
      PlaceholderComponent<PassedProps>
    >,
  ): React.JSX.Element;
  /** Use a specified element, and inherit its props */
  <Component extends ElementType<PassedProps>>(
    props: { as: Component } & Overwrite<
      GenericComponentProps<Component>,
      ReceivedProps
    >,
  ): React.JSX.Element;
  /** Use the default element, and inherit its props */
  (
    // eslint-disable-next-line @typescript-eslint/unified-signatures
    props: { as?: never } & Overwrite<
      GenericComponentProps<DefaultComponent>,
      ReceivedProps
    >,
  ): React.JSX.Element;
  displayName: string;
  readonly $$typeof: symbol;
}

type ElementType<
  P = any,
  Tag extends
    keyof React.JSX.IntrinsicElements = keyof React.JSX.IntrinsicElements,
> =
  | { [K in Tag]: P extends React.JSX.IntrinsicElements[K] ? K : never }[Tag]
  | JSXElementConstructor<P>;

export function createGenericComponent<
  DefaultComponent extends ElementType<PassedProps>,
  ReceivedProps extends {},
  PassedProps extends {} = {},
>(
  displayName: string,
  defaultComponent:
    | DefaultComponent
    | { getComponent: (props: ReceivedProps) => DefaultComponent },
  render: GenericRenderFunction<ReceivedProps, PassedProps>,
): GenericComponent<DefaultComponent, ReceivedProps, PassedProps> {
  const component = forwardRef<
    typeof refSymbol,
    { as?: ElementType } & ReceivedProps
  >(function intermediate({ as = defaultComponent, ...props }, ref) {
    if (typeof as === "object" && "getComponent" in as) {
      as = as.getComponent(props as never);
    }
    return render({ ...props, as } as never, ref);
  });
  component.displayName = displayName;
  return component as never;
}

/**
 * Handle React ARIA's callback children while allowing wrapping in more markup
 */
export const renderGenericPropChild = <RenderProps,>(
  {
    children,
  }: {
    [propSymbol]: true;
    children?: ((props: RenderProps) => ReactNode) | ReactNode;
  },
  render: (children: ReactNode, props?: RenderProps) => ReactNode,
) => {
  if (typeof children === "function") {
    // whatever made the children thinks it's fine to pass a function
    // so we'll do the same
    return composeRenderProps(children, render) as never;
  }
  return render(children);
};

export const withNewDefault = <
  NewComponent extends ElementType<PassedProps>,
  ReceivedProps extends {},
  PassedProps extends {} = {},
>(
  displayName: string,
  GenericComponent: GenericComponent<any, ReceivedProps, PassedProps>,
  as: NewComponent,
) => {
  const Component = (
    props: Overwrite<GenericComponentProps<NewComponent>, ReceivedProps>,
  ) => <GenericComponent as={as} {...props} />;
  Component.displayName = displayName;
  return Component as GenericComponent<
    NewComponent,
    ReceivedProps,
    PassedProps
  >;
};
