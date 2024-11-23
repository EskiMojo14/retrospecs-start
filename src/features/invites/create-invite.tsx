import { useMutation } from "@tanstack/react-query";
import { nonEmpty, object, pipe, string } from "valibot";
import type { DialogProps } from "~/components/dialog";
import { FormDialog } from "~/components/dialog/form";
import { TextField } from "~/components/input/text-field";
import { addInvite } from "~/features/invites";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { coerceNumber } from "~/util/valibot";

export interface CreateInviteProps extends Omit<DialogProps, "children"> {
  orgId: number;
}

const addMemberFormSchema = object({
  email: pipe(string(), nonEmpty("Please enter your email.")),
  org_id: coerceNumber(),
});

export function CreateInvite({ orgId, ...props }: CreateInviteProps) {
  const {
    mutate: createInvite,
    isPending,
    isError,
    reset,
  } = useMutation(useOptionsCreator(addInvite));
  return (
    <FormDialog
      {...props}
      title="Invite member"
      formId="invite-member-form"
      schema={addMemberFormSchema}
      onSubmit={(output, close) => {
        createInvite(output, {
          onSuccess() {
            close();
          },
        });
      }}
      submitButtonProps={{
        children: "Invite",
        progressLabel: "Inviting member",
        isIndeterminate: isPending,
        color: isError ? "red" : "green",
      }}
      onReset={reset}
    >
      <input type="hidden" name="org_id" value={orgId} />
      <TextField label="Email" name="email" type="email" isRequired />
    </FormDialog>
  );
}
