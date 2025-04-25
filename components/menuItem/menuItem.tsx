import React, { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  children?: MenuItem[];
  isExpanded?: boolean;
}
interface MenuItemProps {
  item: MenuItem;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
  depth?: number;
  onChildClick?: (key: string) => void;
  activeKey?: string;
}

export const MenuItem = ({
  item,
  collapsed,
  active,
  onClick,
  depth = 0,
  onChildClick,
  activeKey,
}: MenuItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(item.isExpanded || false);

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="menu-item-container w-full">
      <Tooltip
        className="w-full"
        content={collapsed ? item.title : ""}
        isDisabled={!collapsed}
        placement="right"
      >
        <Button
          className={`menu-item-btn text-left w-full ${
            collapsed ? "justify-center" : "justify-start"
          } mb-2 ${active ? "active" : ""} ${item.className || ""}`}
          endContent={
            !collapsed && hasChildren ? (
              expanded ? (
                <ChevronDown className="ml-auto" size={16} />
              ) : (
                <ChevronRight className="ml-auto" size={16} />
              )
            ) : null
          }
          fullWidth={!collapsed}
          isIconOnly={collapsed}
          startContent={item.icon}
          variant="light"
          onClick={handleClick}
        >
          {!collapsed && item.title}
        </Button>
      </Tooltip>

      {hasChildren && expanded && !collapsed && (
        <div className={`pl-${depth + 4} ml-3 border-l border-gray-200 w-full`}>
          {item.children?.map((child) => (
            <MenuItem
              key={child.key}
              active={activeKey === child.key}
              activeKey={activeKey}
              collapsed={collapsed}
              depth={depth + 1}
              item={child}
              onClick={() => {
                if (onChildClick) onChildClick(child.key);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
