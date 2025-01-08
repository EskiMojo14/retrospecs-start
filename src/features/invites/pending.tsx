import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "~/components/card";
import { ConfirmationDialog } from "~/components/dialog/confirmation";
import { DividerContainer } from "~/components/divider";
import { EmptyState } from "~/components/empty";
import { IconButton } from "~/components/icon-button";
import { List, ListItem, ListItemText } from "~/components/list";
import { Symbol } from "~/components/symbol";
import { toastQueue } from "~/components/toast";
import { Heading, Time } from "~/components/typography";
import type { InviteWithInviter } from "~/features/invites";
import {
  deleteInvite,
  getInvitesByOrgId,
  selectAllInvites,
} from "~/features/invites";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import SvgDeclineInvite from "~/icons/decline-invite";
import styles from "./pending.module.scss";

function InviteRow({ invite }: { invite: InviteWithInviter }) {
  const { mutate: revokeInvite, isPending } = useMutation(
    useOptionsCreator(deleteInvite),
  );
  return (
    <ListItem textValue={invite.email}>
      <ListItemText
        overline={
          <>
            Created{" "}
            <Time dateTime={invite.created_at}>
              {(date) =>
                date.toLocaleDateString(undefined, { dateStyle: "medium" })
              }
            </Time>
          </>
        }
        headline={invite.email}
        supporting={`Invited by ${invite.inviter?.display_name ?? "Unknown"}`}
      />
      <ConfirmationDialog
        trigger={
          <IconButton color="red" variant="filled" tooltip="Revoke invite">
            <Symbol>
              <SvgDeclineInvite />
            </Symbol>
          </IconButton>
        }
        title="Revoke invite"
        description={
          <>
            Are you sure you want to revoke the invite for <b>{invite.email}</b>
            ?
          </>
        }
        confirmButtonProps={{
          color: "red",
          children: "Revoke",
          progressLabel: "Revoking invite",
          isIndeterminate: isPending,
        }}
        onConfirm={(close) => {
          revokeInvite(invite, {
            onError(error) {
              toastQueue.add({
                type: "error",
                title: "Failed to revoke invite",
                description: error.message,
              });
            },
            onSuccess() {
              close();
              toastQueue.add(
                {
                  type: "success",
                  title: "Invite revoked",
                  description: `The invite to ${invite.email} has been revoked.`,
                },
                {
                  timeout: 5000,
                },
              );
            },
          });
        }}
      />
    </ListItem>
  );
}

export interface PendingInvitesProps {
  orgId: number;
}

export function PendingInvites({ orgId }: PendingInvitesProps) {
  const { data: invites = [] } = useQuery({
    ...useOptionsCreator(getInvitesByOrgId, orgId),
    select: selectAllInvites,
  });
  return (
    <section className={styles.pendingContainer}>
      <Heading variant="headline5" id="pending-invite-title">
        Pending invites ({invites.length})
      </Heading>
      <Card variant="raised" className={styles.pendingCard}>
        <List
          variant="two-line"
          aria-labelledby="member-list-title"
          className={styles.memberList}
          renderEmptyState={() => (
            <EmptyState
              icon={<Symbol>inbox</Symbol>}
              title="No pending invites"
            />
          )}
          items={invites}
        >
          {(invite) => (
            <DividerContainer id={invite.email}>
              <InviteRow invite={invite} />
            </DividerContainer>
          )}
        </List>
      </Card>
    </section>
  );
}
