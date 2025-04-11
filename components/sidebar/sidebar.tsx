import React, { useState } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  Home,
  Users,
  Settings,
  BarChart,
  Mail,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  CalendarRange,
  FileText,
  User,
  Share2,
  LucideIcon,
} from "lucide-react";
import "./sidebar.scss";
import { MenuItem } from "../menuItem/menuItem";
import { ISidebarProps, IMenuItem } from "./type";
import { useRouter } from "next/router";
import { Logo } from "../icons/icons";

const Sidebar: React.FC<ISidebarProps> = ({
  defaultCollapsed = false,
  onToggle,
  className = "",
}) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const [activeKey, setActiveKey] = useState<string>(router.pathname);
  const handleToggle = (): void => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };

  // Menu items data
  const mainMenuItems: IMenuItem[] = [
    { key: "/dashboard", title: "Dashboard", icon: <Home size={20} /> },
    { key: "/students", title: "Students", icon: <Users size={20} /> },
    { key: "/analytics", title: "Analytics", icon: <BarChart size={20} /> },
    { key: "/lectures", title: "Lectures", icon: <User size={20} /> },
    {
      key: "/class-schedule",
      title: "Class schedule",
      icon: <Calendar size={20} />,
    },
    {
      key: "/exam-schedule",
      title: "Exam schedule",
      icon: <CalendarRange size={20} />,
    },
    { key: "/documents", title: "Documents", icon: <FileText size={20} /> },
    {
      key: "/program-specification",
      title: "Program specification",
      icon: <Share2 size={20} />,
    },
    {
      key: "/messages",
      title: "Messages",
      icon: <Mail size={20} />,
    },
    {
      key: "/courses",
      title: "Courses",
      icon: <BookOpen size={20} />,
    },
  ];

  const bottomMenuItems: IMenuItem[] = [
    { key: "settings", title: "Settings", icon: <Settings size={20} /> },
    { key: "help", title: "Help", icon: <HelpCircle size={20} /> },
    {
      key: "logout",
      title: "Logout",
      icon: <LogOut size={20} />,
      className: "text-danger",
    },
  ];

  const handleItemClick = (key: string) => {
    setActiveKey(() => {
      return key;
    });
    router.push(`${key}`);
  };
  return (
    <Card
      className={`sidebar-container h-screen rounded-none shadow-lg ${collapsed ? "w-18" : "w-64"} transition-all duration-300 ${className}`}
    >
      <CardBody className="p-0 flex flex-col h-full sidebar-content">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 ${!collapsed ? "pl-8 p-4": ""}"`}>
          {!collapsed?<Logo/>:null}
          
          
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={handleToggle}
            className={collapsed ? "mx-auto" : "ml-auto"}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
          
        </div>

        <div className="p-4 menu-item">
          {mainMenuItems.map((item) => (
            <MenuItem
              key={item.key}
              item={item}
              collapsed={collapsed}
              active={activeKey === item.key}
              onClick={() => handleItemClick(item.key)}
            />
          ))}
        </div>
        <div className="p-3 mt-auto">
          {bottomMenuItems.map((item) => (
            <MenuItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Sidebar;
