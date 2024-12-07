import { useMutation, useQuery } from "@tanstack/react-query";
import type { GenericSchema } from "valibot";
import { minLength, object, pipe, string } from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { TextField } from "~/components/input/text-field";
import { useSession } from "~/db/provider";
import type { TablesUpdate } from "~/db/supabase";
import { getOrgs, selectOrgById, updateOrg } from "~/features/orgs";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

export interface EditOrgProps extends Omit<DialogProps, "children"> {
  orgId: number;
}

const editSchema = object({
  id: coerceNumber(),
  name: pipe(string(), minLength(1)),
}) satisfies GenericSchema<any, TablesUpdate<"orgs">>;

export function EditOrg({ orgId, ...props }: EditOrgProps) {
  const session = useSession();
  const { data: org } = useQuery({
    ...useOptionsCreator(getOrgs, session?.user.id),
    select: (orgs) => selectOrgById(orgs, orgId),
  });
  const {
    mutate: editOrg,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(updateOrg));
  if (!org) return null;
  return (
    <FormDialog
      {...props}
      title="Edit organisation"
      formId="edit-org-form"
      schema={editSchema}
      onSubmit={(output, close) => {
        editOrg(output, {
          onSuccess() {
            close();
          },
        });
      }}
      submitButtonProps={{
        children: "Update",
        progressLabel: "Updating organisation",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <input type="hidden" name="id" value={orgId} />
      <TextField label="Name" name="name" defaultValue={org.name} isRequired />
    </FormDialog>
  );
}
