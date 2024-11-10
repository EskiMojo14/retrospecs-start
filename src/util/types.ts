export type Compute<T> = { [K in keyof T]: T[K] } & unknown;

export type Overwrite<T, U> = Compute<Omit<T, keyof U> & U>;

export type PickRequired<T, K extends keyof T> = Compute<
  Omit<T, K> & Required<Pick<T, K>>
>;

export type PickPartial<T, K extends keyof T> = Compute<
  Omit<T, K> & Partial<Pick<T, K>>
>;

export type MaybePromise<T> = T | Promise<T>;

export type AtLeastOneKey<T> = {
  [K in keyof T]: PickRequired<T, K>;
}[keyof T];

export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
type LastOf<T> =
  UnionToIntersection<T extends any ? () => T : never> extends () => infer R
    ? R
    : never;

type Push<T extends Array<any>, V> = [...T, V];

export type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false,
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

export type KeyofUnion<T> = T extends any ? keyof T : never;

export type OneOf<
  Union extends object,
  // stored here to avoid distribution - don't provide this parameter yourself
  AllKeys extends KeyofUnion<Union> = KeyofUnion<Union>,
> = Union extends infer Item
  ? Compute<Item & Partial<Record<Exclude<AllKeys, keyof Item>, never>>>
  : never;

export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

export type Nullish<T> = T | null | undefined;

export type KeysMatchingValue<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
