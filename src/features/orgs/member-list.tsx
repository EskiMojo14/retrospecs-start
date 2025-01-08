import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar } from "~/components/avatar";
import { Card } from "~/components/card";
import { ConfirmationDialog } from "~/components/dialog/confirmation";
import { DividerContainer } from "~/components/divider";
import { EmptyState } from "~/components/empty";
import { IconButton } from "~/components/icon-button";
import { List, ListItem, ListItemText } from "~/components/list";
import { Switch } from "~/components/switch";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Heading } from "~/components/typography";
import { useSession } from "~/db/provider";
import {
  deleteOrgMember,
  getOrgMembers,
  selectOrgMemberById,
  updateOrgMember,
} from "~/features/orgs";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import {
  useCurrentUserPermissions,
  useUserPermissions,
} from "~/hooks/use-user-permissions";
import { Permission } from "~/util/permissions";
import styles from "./member-list.module.scss";

export interface MemberRowProps {
  id: string;
  orgId: number;
}

const permissionLabels: Partial<Record<Permission, string>> = {
  [Permission.Owner]: "Owner",
  [Permission.Admin]: "Admin",
};

function MemberRow({ id, orgId }: MemberRowProps) {
  const session = useSession();
  const { data: member } = useQuery({
    ...useOptionsCreator(getOrgMembers, orgId),
    select: (members) => selectOrgMemberById(members, id),
  });
  const { mutate: updateMember, isPending: updatePending } = useMutation(
    useOptionsCreator(updateOrgMember),
  );
  const { mutate: deleteMember, isPending: deletePending } = useMutation(
    useOptionsCreator(deleteOrgMember),
  );
  const userPermissions = useUserPermissions(orgId, id);
  const currentUserPermissions = useCurrentUserPermissions(orgId);
  if (!member?.profile) return null;
  const userId = member.user_id;
  return (
    <ListItem textValue={member.profile.display_name}>
      <Avatar
        src={member.profile.avatar_url}
        name={member.profile.display_name}
        color={member.profile.color}
      />
      <ListItemText
        overline={permissionLabels[userPermissions]}
        headline={member.profile.display_name}
        supporting={member.profile.email}
      />
      {userId !== session?.user.id &&
      userPermissions !== Permission.Owner &&
      currentUserPermissions >= Permission.Admin ? (
        <Toolbar align="end" aria-label="Actions" className={styles.actions}>
          <ConfirmationDialog
            trigger={
              <Switch
                isSelected={member.role === "admin"}
                isDisabled={
                  currentUserPermissions <
                  (member.role === "admin"
                    ? Permission.Owner
                    : Permission.Admin)
                }
                color="teal"
                icon={({ isSelected }) => (
                  <Symbol>{isSelected ? "check" : "close"}</Symbol>
                )}
              >
                Admin
              </Switch>
            }
            title={member.role === "admin" ? "Demote admin" : "Promote admin"}
            description={
              member.role === "admin"
                ? `Are you sure you want to demote "${member.profile.display_name}" from admin?`
                : `Are you sure you want to promote "${member.profile.display_name}" to admin?\nOnce promoted, only the owner can demote them.`
            }
            confirmButtonProps={
              member.role === "admin"
                ? {
                    children: "Demote",
                    progressLabel: "Demoting member",
                    color: "red",
                    isIndeterminate: updatePending,
                  }
                : {
                    children: "Promote",
                    progressLabel: "Promoting member",
                    color: "green",
                    isIndeterminate: updatePending,
                  }
            }
            onConfirm={(close) => {
              updateMember(
                {
                  org_id: orgId,
                  user_id: userId,
                  role: member.role === "admin" ? "member" : "admin",
                },
                {
                  onSuccess() {
                    close();
                  },
                },
              );
            }}
          />
          <ConfirmationDialog
            trigger={
              <IconButton
                color="red"
                tooltip="Remove from organisation"
                variant="filled"
              >
                <Symbol>group_remove</Symbol>
              </IconButton>
            }
            title="Remove member"
            description={
              <>
                Are you sure you want to remove{" "}
                <b>{member.profile.display_name}</b> from the organisation?
              </>
            }
            confirmButtonProps={{
              children: "Remove",
              progressLabel: "Removing member",
              color: "red",
              isIndeterminate: deletePending,
            }}
            onConfirm={(close) => {
              deleteMember(
                { org_id: orgId, user_id: userId },
                {
                  onSuccess() {
                    close();
                  },
                },
              );
            }}
          />
        </Toolbar>
      ) : null}
    </ListItem>
  );
}

export interface MemberListProps {
  orgId: number;
  memberIds: Array<string>;
}

export function MemberList({ orgId, memberIds }: MemberListProps) {
  return (
    <section className={styles.memberListContainer}>
      <Heading variant="headline5" id="member-list-title">
        Members ({memberIds.length})
      </Heading>
      <Card variant="raised" className={styles.memberListCard}>
        <List
          variant="two-line"
          aria-labelledby="member-list-title"
          className={styles.memberList}
          renderEmptyState={() => (
            <EmptyState
              title="No members"
              description="Invite members to collaborate on your projects."
            />
          )}
          nonInteractive
        >
          {memberIds.map((id) => (
            <DividerContainer key={id} id={id} variant="inset">
              <MemberRow id={id} orgId={orgId} />
            </DividerContainer>
          ))}
        </List>
      </Card>
    </section>
  );
}
