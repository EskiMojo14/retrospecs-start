import { useMutation } from "@tanstack/react-query";
import type { BaseSchema } from "valibot";
import { nonEmpty, object, pipe, string } from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { TextField } from "~/components/input/text-field";
import type { TablesInsert } from "~/db/supabase";
import { addTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

export interface CreateTeamProps extends Omit<DialogProps, "children"> {
  orgId: number;
}

const createTeamSchema = object({
  name: pipe(string(), nonEmpty()),
  org_id: coerceNumber(),
  created_by: string(),
}) satisfies BaseSchema<any, TablesInsert<"teams">, any>;

export function CreateTeam({ orgId, ...props }: CreateTeamProps) {
  const {
    mutate: addTeamFn,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(addTeam));
  return (
    <FormDialog
      {...props}
      title="Create team"
      formId="create-team-form"
      schema={createTeamSchema}
      onSubmit={(output, close) => {
        addTeamFn(output, {
          onSuccess: close,
        });
      }}
      submitButtonProps={{
        children: "Create",
        progressLabel: "Creating team",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <input type="hidden" name="org_id" value={orgId} />
      <TextField label="Name" name="name" isRequired />
    </FormDialog>
  );
}
