import { useMutation } from "@tanstack/react-query";
import type { GenericSchema } from "valibot";
import { nonEmpty, object, pipe, string } from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { TextField } from "~/components/input/text-field";
import type { TablesInsert } from "~/db/supabase";
import { addOrg } from "~/features/orgs";
import { useOptionsCreator } from "~/hooks/use-options-creator";

const createOrgSchema = object({
  name: pipe(string(), nonEmpty()),
}) satisfies GenericSchema<any, TablesInsert<"orgs">>;

export function CreateOrg(props: Omit<DialogProps, "children">) {
  const {
    mutate: addOrgFn,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(addOrg));
  return (
    <FormDialog
      {...props}
      title="Create organisation"
      formId="create-org-form"
      schema={createOrgSchema}
      onSubmit={(output, close) => {
        addOrgFn(output, {
          onSuccess() {
            close();
          },
        });
      }}
      submitButtonProps={{
        children: "Create",
        progressLabel: "Creating organisation",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <TextField label="Name" name="name" isRequired />
    </FormDialog>
  );
}
