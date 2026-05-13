// registry.ts
import { SelectedLessonsSettings } from "./tabs/SelectedLessonsSettings";
import { LessonsSettings } from "./tabs/LessonsSettings";
import { DatasetBackup } from "./tabs/DatasetBackup";

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
    id: "dataset_backup",
    label: "Backup de leçons",
    icon: "backup",
    Component: DatasetBackup,
  },
];