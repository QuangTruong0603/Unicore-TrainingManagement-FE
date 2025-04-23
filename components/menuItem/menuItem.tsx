import { Button, Tooltip } from "@heroui/react";
import "./menuItem.scss";
interface BadgeInfo {
  content: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger" | "default";
}
interface MenuItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  badge?: BadgeInfo;
  className?: string;
}
interface MenuItemProps {
  item: MenuItem;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
}

export const MenuItem = ({
  item,
  collapsed,
  active,
  onClick,
}: MenuItemProps) => {
  return (
    <Tooltip
      content={collapsed ? item.title : ""}
      isDisabled={!collapsed}
      placement="right"
    >
      <Button
        className={`menu-item-btn ${collapsed ? "flex justify-center" : "justify-start w-full"}  mb-2 ${active ? "active" : ""}`}
        isIconOnly={collapsed}
        startContent={item.icon}
        variant="light"
        onClick={onClick}
      >
        {!collapsed && item.title}
      </Button>
    </Tooltip>
  );
};
