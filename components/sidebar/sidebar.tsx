import React, { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
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
  GraduationCap,
  Book,
  Map,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/router";

import "./sidebar.scss";
import { MenuItem } from "../menuItem/menuItem";
import { Logo } from "../icons/icons";

import { ISidebarProps, IMenuItem } from "./type";

const Sidebar: React.FC<ISidebarProps> = ({
  defaultCollapsed = false,
  onToggle,
  className = "",
}) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);
  const [activeKey, setActiveKey] = useState<string>(router.pathname);

  // Update active key when route changes
  useEffect(() => {
    setActiveKey(router.pathname);
  }, [router.pathname]);

  const handleToggle = (): void => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };
  // Menu items data
  const mainMenuItems: IMenuItem[] = [
    { key: "/students", title: "Students", icon: <Users size={20} /> },
    { key: "/analytics", title: "Analytics", icon: <BarChart size={20} /> },
    { key: "/lectures", title: "Lectures", icon: <User size={20} /> },
    {
      key: "/facilities",
      title: "Facilities",
      icon: <MapPin size={20} />,
      isExpanded: false,
      children: [
        {
          key: "/facilities/locations",
          title: "Locations",
          icon: <MapPin size={20} />,
        },
        // More facility related items can be added here in the future
      ],
    },
    {
      key: "/training",
      title: "Training",
      icon: <Book size={20} />,
      isExpanded: true,
      children: [
        {
          key: "/training/courses",
          title: "Courses",
          icon: <BookOpen size={20} />,
        },
        {
          key: "/training/class-schedule",
          title: "Class schedule",
          icon: <Calendar size={20} />,
        },
        {
          key: "/training/exam-schedule",
          title: "Exam schedule",
          icon: <CalendarRange size={20} />,
        },
        {
          key: "/training/documents",
          title: "Documents",
          icon: <FileText size={20} />,
        },
        {
          key: "/training/training-roadmap",
          title: "Training Roadmaps",
          icon: <Map size={20} />,
        },        {
          key: "/training/majors",
          title: "Majors",
          icon: <GraduationCap size={20} />,
        },
      ],
    },
    {
      key: "/messages",
      title: "Messages",
      icon: <Mail size={20} />,
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
    setActiveKey(key);
    router.push(key);
  };

  return (
    <Card
      className={`sidebar-container h-screen rounded-none shadow-lg ${collapsed ? "w-18" : "w-64"} transition-all duration-300 ${className}`}
    >
      <CardBody className="p-0 flex flex-col h-full sidebar-content">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 ${!collapsed ? "pl-8 p-4" : ""}"`}
        >
          {!collapsed ? <Logo /> : null}

          <Button
            isIconOnly
            className={collapsed ? "mx-auto" : "ml-auto"}
            size="sm"
            variant="light"
            onClick={handleToggle}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        <div className="p-4 menu-item">
          {mainMenuItems.map((item) => (
            <MenuItem
              key={item.key}
              active={activeKey === item.key}
              activeKey={activeKey}
              collapsed={collapsed}
              item={item}
              onChildClick={(key) => handleItemClick(key)}
              onClick={() => !item.children && handleItemClick(item.key)}
            />
          ))}
        </div>
        <div className="p-3 mt-auto">
          {bottomMenuItems.map((item) => (
            <MenuItem
              key={item.key}
              activeKey={activeKey}
              collapsed={collapsed}
              item={item}
              onClick={() => item.key !== "logout" && handleItemClick(item.key)}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Sidebar;
