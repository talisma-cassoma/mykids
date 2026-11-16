import { SelectedGamesSettings } from "./tabs/SelectedGamesSettings";

export type SettingsTab = {
  id: string;
  label: string;
  icon?: string;
  Component: React.ComponentType;
};

export const SETTINGS_TABS: SettingsTab[] = [
    {
      id: "games",
      label: "Jeux",
      icon: "gamepad",
      Component: SelectedGamesSettings,
    },
];