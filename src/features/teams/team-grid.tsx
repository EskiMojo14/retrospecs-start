import { useMutation, useQuery } from "@tanstack/react-query";
import { GridList, GridListItem, Link } from "react-aria-components";
import { LinkButton } from "~/components/button";
import { Card, CardActions, CardPrimaryAction } from "~/components/card";
import { ConfirmationDialog } from "~/components/dialog/confirmation";
import { Divider } from "~/components/divider";
import { withNewDefault } from "~/components/generic";
import { Grid, GridCell, GridInner } from "~/components/grid";
import { IconButton } from "~/components/icon-button";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Typography } from "~/components/typography";
import { ensureCurrentUserPermissions } from "~/db/auth";
import { getDisplayName } from "~/features/profiles";
import { getSprintCountForTeam } from "~/features/sprints";
import type { Team } from "~/features/teams";
import {
  getTeamMemberCount,
  deleteTeam,
  getTeamsByOrg,
  selectTeamById,
} from "~/features/teams";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import { useCurrentUserPermissions } from "~/hooks/use-user-permissions";
import { pluralize } from "~/util";
import { Permission } from "~/util/permissions";
import type { AppContext } from "~/util/supabase-query";
import { EditTeam } from "./edit-team";
import styles from "./team-grid.module.scss";

export function prefetchTeamCardData(team: Team, context: AppContext) {
  const { queryClient } = context;
  return Promise.all([
    queryClient.prefetchQuery(getTeamMemberCount(context, team.id)),
    queryClient.prefetchQuery(getSprintCountForTeam(context, team.id)),
    queryClient.prefetchQuery(getDisplayName(context, team.created_by)),
    ensureCurrentUserPermissions(context, team.org_id, "getOrgs"),
  ]);
}

export interface TeamCardProps {
  orgId: number;
  id: number;
}

const GridCellItem = withNewDefault("GridCellItem", GridCell, GridListItem);

function TeamCard({ orgId, id: teamId }: TeamCardProps) {
  const { data: team } = useQuery({
    ...useOptionsCreator(getTeamsByOrg, orgId),
    select: (data) => selectTeamById(data, teamId),
  });
  const { data: memberCount = 0 } = useQuery(
    useOptionsCreator(getTeamMemberCount, teamId),
  );
  const { data: sprintCount = 0 } = useQuery(
    useOptionsCreator(getSprintCountForTeam, teamId),
  );
  const { data: creator } = useQuery(
    useOptionsCreator(getDisplayName, team?.created_by),
  );
  const { mutate: deleteTeamFn, isPending } = useMutation(
    useOptionsCreator(deleteTeam),
  );
  const permissions = useCurrentUserPermissions(orgId);
  if (!team) return null;
  return (
    <Card
      as={GridCellItem}
      textValue={team.name}
      span="half"
      breakpoints={{
        phone: { span: "full" },
        "tablet-s": { span: "full" },
      }}
      className={styles.teamCard}
    >
      <CardPrimaryAction
        as={Link}
        href={`/orgs/${orgId}/teams/${teamId}`}
        className={styles.primaryAction}
      >
        <Typography variant="overline" className={styles.sprintCount}>
          {pluralize`${sprintCount} ${[sprintCount, "sprint"]}`}
        </Typography>
        <Typography variant="headline6" className={styles.title}>
          {team.name}
        </Typography>
        {creator && (
          <Typography variant="subtitle2" className={styles.creator}>
            Created by {creator}
          </Typography>
        )}
      </CardPrimaryAction>
      <Divider />
      <CardActions>
        <Toolbar slot="buttons">
          <LinkButton
            variant="outlined"
            href={`/orgs/${orgId}/teams/${teamId}/members`}
            slot="action"
          >
            <Symbol slot="leading">people</Symbol>
            {pluralize`${memberCount} ${[memberCount, "member"]}`}
          </LinkButton>
        </Toolbar>
        {permissions >= Permission.Admin && (
          <Toolbar slot="icons">
            <EditTeam
              trigger={
                <IconButton tooltip="Edit" slot="action">
                  <Symbol>edit</Symbol>
                </IconButton>
              }
              {...{ orgId, teamId }}
            />
            <ConfirmationDialog
              trigger={
                <IconButton tooltip="Delete" slot="action">
                  <Symbol>delete</Symbol>
                </IconButton>
              }
              title="Delete team"
              description={`Are you sure you want to delete ${team.name}?`}
              onConfirm={(close) => {
                deleteTeamFn(teamId, {
                  onSuccess: close,
                });
              }}
              confirmButtonProps={{
                children: "Delete",
                progressLabel: "Deleting team",
                isIndeterminate: isPending,
                color: "red",
              }}
            />
          </Toolbar>
        )}
      </CardActions>
    </Card>
  );
}

interface TeamGridProps {
  orgId: number;
  teamIds: Array<number>;
}

export function TeamGrid({ orgId, teamIds }: TeamGridProps) {
  return (
    <Grid as="section">
      <GridInner>
        <GridCell as="header" span="full">
          <Typography variant="headline5" id="teams-list-heading">
            Teams ({teamIds.length})
          </Typography>
        </GridCell>
      </GridInner>
      <GridInner as={GridList} aria-labelledby="teams-list-heading">
        {teamIds.map((teamId) => (
          <TeamCard key={teamId} orgId={orgId} id={teamId} />
        ))}
      </GridInner>
    </Grid>
  );
}
