// registry.ts
import { SelectedLessonsSettings } from "./tabs/SelectedLessonsSettings";
import { LessonsSettings } from "./tabs/LessonsSettings";
import { DatasetBackup } from "./tabs/DatasetBackup";
import { SelectedGamesSettings } from "./tabs/SelectedGamesSettings";
import {BookPagesUpload} from "./tabs/BookPagesUpload"

export type SettingsTab = {
  id: string;
  label: string;
  icon?: string;
  Component: React.ComponentType;
};

export const SETTINGS_TABS: SettingsTab[] = [
    {
      id: "selected_lessons",
      label: "Leçons Sélectionnées",
      icon: "bookmarks    ",
      Component: SelectedLessonsSettings,
    },
  {
    id: "lessons",
    label: "Leçons",
    icon: "person",
    Component: LessonsSettings,
  },
    {
      id: "games",
      label: "Jeux",
      icon: "gamepad",
      Component: SelectedGamesSettings,
    },
  {
    id: "dataset_backup",
    label: "Backup de leçons",
    icon: "backup",
    Component: DatasetBackup,
  },
  {
    id: "book",
    label: "Livre",
    icon: "book",
    Component: BookPagesUpload,

  }
];