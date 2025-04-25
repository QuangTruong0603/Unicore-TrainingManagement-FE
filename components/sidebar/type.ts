export interface IBadgeInfo {
  content: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
}
export interface IMenuItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  badge?: IBadgeInfo;
  className?: string;
  children?: IMenuItem[];
  isExpanded?: boolean;
}

export interface ISidebarProps {
  defaultCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}
