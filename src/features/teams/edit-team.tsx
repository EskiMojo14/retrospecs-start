import { useMutation, useQuery } from "@tanstack/react-query";
import type { GenericSchema } from "valibot";
import { nonEmpty, object, pipe, string } from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { TextField } from "~/components/input/text-field";
import type { TablesUpdate } from "~/db/supabase";
import { getTeamsByOrg, selectTeamById, updateTeam } from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

export interface EditTeamProps extends Omit<DialogProps, "children"> {
  orgId: number;
  teamId: number;
}

const editTeamSchema = object({
  name: pipe(string(), nonEmpty()),
  org_id: coerceNumber(),
  id: coerceNumber(),
}) satisfies GenericSchema<any, TablesUpdate<"teams">>;

export function EditTeam({ orgId, teamId, ...props }: EditTeamProps) {
  const { data: team } = useQuery({
    ...useOptionsCreator(getTeamsByOrg, orgId),
    select: (teams) => selectTeamById(teams, teamId),
  });
  const {
    mutate: addTeamFn,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(updateTeam));
  return (
    <FormDialog
      {...props}
      title="Edit team"
      formId="edit-team-form"
      schema={editTeamSchema}
      onSubmit={(output, close) => {
        addTeamFn(output, {
          onSuccess: close,
        });
      }}
      submitButtonProps={{
        children: "Update",
        progressLabel: "Updating team",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <input type="hidden" name="org_id" value={orgId} />
      <input type="hidden" name="id" value={teamId} />
      <TextField
        label="Name"
        name="name"
        defaultValue={team?.name}
        isRequired
      />
    </FormDialog>
  );
}
