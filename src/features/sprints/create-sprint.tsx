import { useMutation, useQuery } from "@tanstack/react-query";
import type { GenericSchema } from "valibot";
import {
  nonEmpty,
  null_,
  number,
  object,
  pipe,
  string,
  transform,
  union,
} from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { Divider } from "~/components/divider";
import { IdFragment } from "~/components/fragment";
import { Select, SelectItem } from "~/components/input/select";
import { TextField } from "~/components/input/text-field";
import type { TablesInsert } from "~/db/supabase";
import {
  addSprint,
  getSprintsForTeam,
  selectAllSprints,
} from "~/features/sprints";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

const createSprintSchema = object({
  name: pipe(string(), nonEmpty()),
  team_id: coerceNumber(),
  follows_id: pipe(
    string(),
    transform((followsId) => (followsId ? parseInt(followsId, 10) : null)),
    union([number(), null_()]),
  ),
}) satisfies GenericSchema<any, TablesInsert<"sprints">>;

export interface CreateSprintProps extends Omit<DialogProps, "children"> {
  teamId: number;
}

export function CreateSprint({ teamId, ...props }: CreateSprintProps) {
  const { data: sprints = [] } = useQuery({
    ...useOptionsCreator(getSprintsForTeam, teamId),
    select: selectAllSprints,
  });
  const {
    mutate: addSprintFn,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(addSprint));
  return (
    <FormDialog
      {...props}
      title="Create sprint"
      formId="create-sprint-form"
      schema={createSprintSchema}
      onSubmit={(output, close) => {
        addSprintFn(output, {
          onSuccess: close,
        });
      }}
      submitButtonProps={{
        children: "Create",
        progressLabel: "Creating sprint",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <input type="hidden" name="team_id" value={teamId} />
      <TextField label="Name" name="name" isRequired />
      <Select
        label="Follows"
        description="Carry over actions from a previous sprint"
        name="follows_id"
        defaultSelectedKey={sprints[0]?.id ?? ""}
        items={[{ name: "None", id: "" }, ...sprints]}
      >
        {(item) => {
          if (item.id === "") {
            return (
              <IdFragment id={item.id}>
                <SelectItem id={item.id} textValue={item.name}>
                  {item.name}
                </SelectItem>
                <Divider />
              </IdFragment>
            );
          }
          return (
            <SelectItem id={item.id} textValue={item.name}>
              {item.name}
            </SelectItem>
          );
        }}
      </Select>
    </FormDialog>
  );
}
