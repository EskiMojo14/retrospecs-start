import { useMutation, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import debounce from "lodash/debounce";
import startCase from "lodash/startCase";
import { useCallback, useMemo } from "react";
import { Avatar } from "~/components/avatar";
import { Button, ButtonGroup, ToggleButton } from "~/components/button";
import { Dialog, DialogContent } from "~/components/dialog";
import { IconButton } from "~/components/icon-button";
import { Select, SelectItem } from "~/components/input/select";
import { TextField } from "~/components/input/text-field";
import { Symbol } from "~/components/symbol";
import { Toolbar } from "~/components/toolbar";
import { Heading, Typography } from "~/components/typography";
import { useSession } from "~/db/provider";
import type { Profile } from "~/features/profiles";
import { updateProfile } from "~/features/profiles";
import { useCurrentProfile } from "~/hooks/use-current-profile";
import { useOptionsCreator } from "~/hooks/use-options-creator";
import type { Color } from "~/theme/colors";
import { colors } from "~/theme/colors";
import type { Groove, Theme, UserConfig } from ".";
import { getUserConfig, updateUserConfig } from ".";
import styles from "./dialog.module.scss";

const themeSymbols: Record<Theme, string> = {
  system: "brightness_auto",
  light: "light_mode",
  dark: "dark_mode",
};

const themeEntries = Object.entries(themeSymbols);

const grooveSymbols: Record<Groove, string> = {
  none: "volume_off",
  low_volume: "volume_down",
  heavy: "volume_up",
};

const grooveEntries = Object.entries(grooveSymbols);

export function PreferencesDialog() {
  const profile = useCurrentProfile();
  const session = useSession();
  const userId = session?.user.id;
  const { data: config } = useQuery(useOptionsCreator(getUserConfig, userId));
  const { mutate: updateProfileFn } = useMutation(
    useOptionsCreator(updateProfile),
  );
  const handleProfileChange = useCallback(
    (update: Partial<Profile>) => {
      if (userId) updateProfileFn({ ...update, user_id: userId });
    },
    [userId, updateProfileFn],
  );
  const debouncedProfileChange = useMemo(
    () => debounce(handleProfileChange, 1000),
    [handleProfileChange],
  );
  const { mutate: updateConfig } = useMutation(
    useOptionsCreator(updateUserConfig),
  );
  const handleConfigChange = (update: Partial<UserConfig>) => {
    if (userId) updateConfig({ ...update, user_id: userId });
  };
  const theme = config?.theme ?? "system";
  const groove = config?.groove ?? "heavy";
  return (
    <Dialog
      trigger={
        <IconButton slot="action" tooltip="User preferences">
          <Symbol>settings_account_box</Symbol>
        </IconButton>
      }
      isDismissable
    >
      {({ close }) => (
        <>
          <Heading variant="headline6" level={5} slot="title">
            User Preferences
          </Heading>
          <DialogContent>
            {profile && (
              <section className={styles.section}>
                <Heading variant="subtitle1">Profile</Heading>
                <div className={styles.profile}>
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.display_name}
                    color={profile.color}
                  />
                  <div className={styles.profileInfo}>
                    <TextField
                      label="Display name"
                      defaultValue={profile.display_name}
                      onChange={(value) => {
                        debouncedProfileChange({ display_name: value });
                      }}
                    />
                    <Typography variant="caption" className={styles.email}>
                      {profile.email}
                    </Typography>
                  </div>
                </div>
                <Select
                  id="color-group"
                  label="Profile color"
                  description="The color used for, or around, your profile picture."
                  selectedKey={profile.color}
                  onSelectionChange={(color) => {
                    handleProfileChange({ color: color as Color });
                  }}
                  renderSelected={({ defaultChildren }) => (
                    <span
                      className={clsx(
                        styles.selectValue,
                        "color-" + profile.color,
                      )}
                    >
                      {defaultChildren}
                    </span>
                  )}
                >
                  {colors.map((color) => (
                    <SelectItem
                      key={color}
                      id={color}
                      className={clsx(styles.selectItem, "color-" + color)}
                      textValue={startCase(color)}
                    >
                      <Symbol fill>circle</Symbol>
                      {startCase(color)}
                    </SelectItem>
                  ))}
                </Select>
              </section>
            )}
            <section className={styles.section}>
              <Heading variant="subtitle1">Appearance</Heading>
              <ButtonGroup
                id="theme-group"
                label="Theme"
                description="The color scheme to use."
                variant="elevated"
                color="blue"
                items={themeEntries}
                dependencies={[theme]}
              >
                {([themeName, symbol]) => (
                  <ToggleButton
                    id={themeName}
                    isSelected={theme === themeName}
                    onPress={() => {
                      handleConfigChange({ theme: themeName as Theme });
                    }}
                  >
                    <Symbol slot="leading">{symbol}</Symbol>
                    {startCase(themeName)}
                  </ToggleButton>
                )}
              </ButtonGroup>
              <ButtonGroup
                id="groove-group"
                label="Groove"
                description={
                  'Whether to use loud backgrounds or not.\n"Low volume" removes the loudest backgrounds, and "None" removes all patterned backgrounds.'
                }
                variant="elevated"
                color="amber"
                items={grooveEntries}
                dependencies={[groove]}
              >
                {([grooveName, symbol]) => (
                  <ToggleButton
                    id={grooveName}
                    isSelected={groove === grooveName}
                    onPress={() => {
                      handleConfigChange({ groove: grooveName as Groove });
                    }}
                  >
                    <Symbol slot="leading">{symbol}</Symbol>
                    {startCase(grooveName)}
                  </ToggleButton>
                )}
              </ButtonGroup>
            </section>
          </DialogContent>
          <Toolbar slot="actions">
            <Button onPress={close}>Close</Button>
          </Toolbar>
        </>
      )}
    </Dialog>
  );
}
