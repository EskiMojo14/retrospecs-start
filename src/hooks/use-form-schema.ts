import type { ValidationErrors } from "@react-types/shared";
import { useCallback, useState } from "react";
import type {
  BaseIssue,
  BaseSchema,
  FlatErrors,
  InferIssue,
  SafeParseResult,
} from "valibot";
import { flatten, safeParse } from "valibot";

export interface FormErrors<
  TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
> extends FlatErrors<TSchema> {
  issues: [InferIssue<TSchema>, ...Array<InferIssue<TSchema>>];
  validationErrors: ValidationErrors;
}

export const useFormSchema = <
  const TSchema extends BaseSchema<unknown, unknown, BaseIssue<unknown>>,
>(
  schema: TSchema,
): [
  FormErrors<TSchema> | undefined,
  (data: unknown) => SafeParseResult<TSchema>,
  () => void,
] => {
  const [validationErrors, setValidationErrors] =
    useState<FormErrors<TSchema>>();
  const validate = useCallback(
    (data: unknown) => {
      const parsed = safeParse(schema, data);
      if (parsed.success) {
        setValidationErrors(undefined);
      } else {
        const flattened = flatten(parsed.issues);
        const errors: ValidationErrors = {};
        for (const [key, issues] of Object.entries(flattened.nested ?? {})) {
          if (issues) {
            errors[key] = issues;
          }
        }
        setValidationErrors({
          ...(flattened as FlatErrors<TSchema>),
          issues: parsed.issues,
          validationErrors: errors,
        });
      }

      return parsed;
    },
    [schema],
  );
  const reset = useCallback(() => {
    setValidationErrors(undefined);
  }, []);
  return [validationErrors, validate, reset];
};
