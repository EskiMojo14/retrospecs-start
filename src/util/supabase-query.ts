import type {
  PostgrestError,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import type {
  MutationFunction,
  QueryFunction,
  DataTag,
  DefinedInitialDataOptions,
  QueryFunctionContext,
  QueryKey,
  QueryOptions,
  UndefinedInitialDataOptions,
  MutationOptions,
  QueryClient,
} from "@tanstack/react-query";
import type { AppSupabaseClient } from "~/db";

export interface PostgrestMeta {
  count: number | null;
  status: number;
  statusText: string;
}

export interface PostgrestErrorWithMeta extends PostgrestError {
  meta: PostgrestMeta;
}

export function supabaseFn<
  QueryFnData,
  TQueryKey extends QueryKey,
  TData = QueryFnData,
>(
  queryFn: (
    context: QueryFunctionContext<TQueryKey>,
  ) => PromiseLike<PostgrestSingleResponse<QueryFnData>>,
  transformResponse?: (data: QueryFnData, meta: PostgrestMeta) => TData,
): QueryFunction<TData, TQueryKey>;
export function supabaseFn<MutationFnData, TVariables, TData = MutationFnData>(
  mutationFn: (
    variables: TVariables,
  ) => PromiseLike<PostgrestSingleResponse<MutationFnData>>,
  transformResponse?: (data: MutationFnData, meta: PostgrestMeta) => TData,
): MutationFunction<TData, TVariables>;
export function supabaseFn<FnData, TData = FnData, TVariables = void>(
  queryFn: (
    variables: TVariables,
  ) => PromiseLike<PostgrestSingleResponse<FnData>>,
  transformResponse: (data: FnData, meta: PostgrestMeta) => TData = (data) =>
    data as unknown as TData,
) {
  return async (context: TVariables) => {
    const { data, error, count, status, statusText } = await queryFn(context);
    const meta: PostgrestMeta = { count, status, statusText };
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    if (error) throw { ...error, meta };
    return transformResponse(data, meta);
  };
}

export interface AppContext {
  supabase: AppSupabaseClient;
  queryClient: QueryClient;
}

export function supabaseQueryOptions<
  QueryFnData,
  const TQueryKey extends QueryKey,
  Args extends Array<any> = [],
>(
  getOptions: (
    context: AppContext,
    ...args: Args
  ) => UndefinedInitialDataOptions<
    QueryFnData,
    PostgrestErrorWithMeta,
    QueryFnData,
    TQueryKey
  >,
): (
  context: AppContext,
  ...args: Args
) => UndefinedInitialDataOptions<
  QueryFnData,
  PostgrestErrorWithMeta,
  QueryFnData,
  TQueryKey
> & {
  queryKey: DataTag<TQueryKey, QueryFnData>;
};
export function supabaseQueryOptions<
  QueryFnData,
  const TQueryKey extends QueryKey,
  Args extends Array<any> = [],
>(
  getOptions: (
    context: AppContext,
    ...args: Args
  ) => DefinedInitialDataOptions<
    QueryFnData,
    PostgrestErrorWithMeta,
    QueryFnData,
    TQueryKey
  >,
): (
  context: AppContext,
  ...args: Args
) => DefinedInitialDataOptions<
  QueryFnData,
  PostgrestErrorWithMeta,
  QueryFnData,
  TQueryKey
> & {
  queryKey: DataTag<TQueryKey, QueryFnData>;
};
export function supabaseQueryOptions<
  QueryFnData,
  const TQueryKey extends QueryKey,
  Args extends Array<any> = [],
>(
  getOptions: (
    context: AppContext,
    ...args: Args
  ) => QueryOptions<
    QueryFnData,
    PostgrestErrorWithMeta,
    QueryFnData,
    TQueryKey
  >,
): typeof getOptions {
  return getOptions;
}

export function supabaseMutationOptions<
  MutationFnData,
  TVariables,
  TContext,
  Args extends Array<any> = [],
>(
  getOptions: (
    context: AppContext,
    ...args: Args
  ) => MutationOptions<
    MutationFnData,
    PostgrestErrorWithMeta,
    TVariables,
    TContext
  >,
) {
  return getOptions;
}

export const compoundKey =
  <T>() =>
  <K extends keyof T>(...keys: Array<K>) =>
  (obj: Pick<T, K>) =>
    keys.map((key) => obj[key]).join("---");
