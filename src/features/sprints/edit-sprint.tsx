import { createSelector } from "@reduxjs/toolkit";
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
import { DividerContainer } from "~/components/divider";
import { Select, SelectItem } from "~/components/input/select";
import { TextField } from "~/components/input/text-field";
import type { TablesUpdate } from "~/db/supabase";
import type { Sprint } from "~/features/sprints";
import {
  getSprintsForTeam,
  selectAllSprints,
  selectSprintById,
  updateSprint,
} from "~/features/sprints";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

const editSprintSchema = object({
  name: pipe(string(), nonEmpty()),
  team_id: coerceNumber(),
  id: coerceNumber(),
  follows_id: pipe(
    string(),
    // special case - empty string means no follows
    transform((v) => (v === "" ? null : parseInt(v))),
    union([number(), null_()]),
  ),
}) satisfies GenericSchema<any, TablesUpdate<"sprints">>;

const selectPreviousSprints = createSelector(
  [
    selectAllSprints,
    (_: unknown, sprint: Pick<Sprint, "created_at" | "id"> | undefined) =>
      sprint,
  ],
  (sprints, sprint) =>
    sprint &&
    sprints.filter(
      (s) => s.created_at <= sprint.created_at && s.id !== sprint.id,
    ),
);

export interface EditSprintProps extends Omit<DialogProps, "children"> {
  teamId: number;
  sprintId: number;
}

export function EditSprint({ teamId, sprintId, ...props }: EditSprintProps) {
  const { data: sprint } = useQuery({
    ...useOptionsCreator(getSprintsForTeam, teamId),
    select: (sprints) => selectSprintById(sprints, sprintId),
  });
  const { data: sprints = [] } = useQuery({
    ...useOptionsCreator(getSprintsForTeam, teamId),
    select: (sprints) => selectPreviousSprints(sprints, sprint),
  });
  const {
    mutate: updateSprintFn,
    isError,
    isPending,
    reset,
  } = useMutation(useOptionsCreator(updateSprint));
  return (
    <FormDialog
      {...props}
      title="Edit sprint"
      formId="edit-sprint-form"
      schema={editSprintSchema}
      onSubmit={(output, close) => {
        updateSprintFn(output, {
          onSuccess: close,
        });
      }}
      submitButtonProps={{
        children: "Update",
        progressLabel: "Updating sprint",
        isIndeterminate: isPending,
        color: isError ? "red" : undefined,
      }}
      onReset={reset}
    >
      <input type="hidden" name="team_id" value={teamId} />
      <input type="hidden" name="id" value={sprintId} />
      <TextField
        label="Name"
        name="name"
        defaultValue={sprint?.name}
        isRequired
      />
      <Select
        label="Follows"
        description="Carry over actions from a previous sprint"
        name="follows_id"
        defaultSelectedKey={sprint?.follows_id ?? ""}
        items={[{ name: "None", id: "" }, ...sprints]}
      >
        {(item) => {
          if (item.id === "") {
            return (
              <DividerContainer id={item.id}>
                <SelectItem id={item.id} textValue={item.name}>
                  {item.name}
                </SelectItem>
              </DividerContainer>
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
