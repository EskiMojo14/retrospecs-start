import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardSection } from "~/components/card";
import { ConfirmationDialog } from "~/components/dialog/confirmation";
import { Divider } from "~/components/divider";
import { EmptyState } from "~/components/empty";
import { Grid, GridCell, GridInner } from "~/components/grid";
import { IconButton } from "~/components/icon-button";
import { List, ListItem, ListItemText } from "~/components/list";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Time, Typography } from "~/components/typography";
import {
  deleteSprint,
  getSprintsForTeam,
  selectSprintById,
} from "~/features/sprints";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { useCurrentUserPermissions } from "~/hooks/use-user-permissions";
import { Permission } from "~/util/permissions";
import { EditSprint } from "./edit-sprint";
import styles from "./sprint-list.module.scss";

interface SprintItem {
  orgId: number;
  teamId: number;
  id: number;
}

function SprintListItem({ orgId, teamId, id: sprintId }: SprintItem) {
  const { data: sprint } = useQuery({
    ...useOptionsCreator(getSprintsForTeam, teamId),
    select: (sprints) => selectSprintById(sprints, sprintId),
  });
  const { mutate: deleteSprintFn, isPending } = useMutation(
    useOptionsCreator(deleteSprint),
  );
  const permission = useCurrentUserPermissions(orgId);
  if (!sprint) return null;
  return (
    <>
      <ListItem
        textValue={sprint.name}
        href={`/orgs/${orgId}/teams/${teamId}/sprints/${sprintId}`}
      >
        <Symbol slot="icon">view_kanban</Symbol>
        <ListItemText
          headline={sprint.name}
          overline={
            <Time dateTime={sprint.created_at}>
              {(date) =>
                date.toLocaleDateString(undefined, { dateStyle: "medium" })
              }
            </Time>
          }
        />
        {permission >= Permission.Admin && (
          <Toolbar align="end" className={styles.toolbar}>
            <EditSprint
              {...{ teamId, sprintId }}
              trigger={
                <IconButton color="inherit" variant="outlined" tooltip="Edit">
                  <Symbol>edit</Symbol>
                </IconButton>
              }
            />
            <ConfirmationDialog
              trigger={
                <IconButton color="red" variant="outlined" tooltip="Delete">
                  <Symbol>delete</Symbol>
                </IconButton>
              }
              title="Delete sprint"
              description={
                <>
                  Are you sure you want to delete the sprint{" "}
                  <b>{sprint.name}</b>?
                </>
              }
              confirmButtonProps={{
                color: "red",
                children: "Delete",
                progressLabel: "Deleting sprint",
                isIndeterminate: isPending,
              }}
              onConfirm={(close) => {
                deleteSprintFn(sprintId, {
                  onSuccess: close,
                });
              }}
            />
          </Toolbar>
        )}
      </ListItem>
      <Divider variant="inset" />
    </>
  );
}

export interface SprintListProps {
  orgId: number;
  teamId: number;
  sprintIds: Array<number>;
}

export function SprintList({ orgId, teamId, sprintIds }: SprintListProps) {
  return (
    <Grid as="section" className={styles.section}>
      <GridInner>
        <GridCell
          breakpoints={{
            phone: { span: "full" },
            "tablet-s": { span: "full" },
            "tablet-l": { span: 8, start: 3 },
            laptop: { span: 8, start: 3 },
            desktop: { span: 8, start: 3 },
          }}
          className={styles.container}
        >
          <Typography
            variant="headline5"
            className={styles.title}
            id="sprint-list-title"
          >
            Sprints ({sprintIds.length})
          </Typography>
          <Card>
            <CardSection>
              <List
                variant="two-line"
                aria-labelledby="sprint-list-title"
                renderEmptyState={() => (
                  <EmptyState
                    title="No sprints"
                    description="Create a sprint to get started"
                  />
                )}
              >
                {sprintIds.map((sprintId) => (
                  <SprintListItem
                    key={sprintId}
                    {...{ orgId, teamId }}
                    id={sprintId}
                  />
                ))}
              </List>
            </CardSection>
          </Card>
        </GridCell>
      </GridInner>
    </Grid>
  );
}
