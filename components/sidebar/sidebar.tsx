import React, { useState, useEffect } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import {
  Users,
  Settings,
  BarChart,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  CalendarRange,
  User,
  GraduationCap,
  Book,
  Map,
  MapPin,
  School,
  UserPlus,
  DollarSign,
  ClipboardList,
  Bell,
} from "lucide-react";
import { useRouter } from "next/router";

import "./sidebar.scss";
import { MenuItem } from "../menuItem/menuItem";
import { Logo } from "../icons/icons";

import { ISidebarProps, IMenuItem } from "./type";

import { useAuth } from "@/hooks/useAuth";

const Sidebar: React.FC<ISidebarProps> = ({
  defaultCollapsed = false,
  onToggle,
  className = "",
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();
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

  // Training Manager menu items
  const adminMenuItems: IMenuItem[] = [
    { key: "/a/analytics", title: "Analytics", icon: <BarChart size={20} /> },
    { key: "/a/students", title: "Students", icon: <Users size={20} /> },
    { key: "/a/lecturers", title: "Lecturers", icon: <User size={20} /> },
    {
      key: "/a/facilities",
      title: "Facilities",
      icon: <MapPin size={20} />,
      isExpanded: false,
      children: [
        {
          key: "/a/facilities/locations",
          title: "Locations",
          icon: <MapPin size={20} />,
        },
      ],
    },
    {
      key: "/a/academic",
      title: "Academic",
      icon: <School size={20} />,
      isExpanded: true,
      children: [
        {
          key: "/a/academic/semesters",
          title: "Semesters",
          icon: <Calendar size={20} />,
        },
        {
          key: "/a/academic/courses",
          title: "Courses",
          icon: <BookOpen size={20} />,
        },
        {
          key: "/a/academic/majors",
          title: "Majors",
          icon: <GraduationCap size={20} />,
        },
        {
          key: "/a/academic/training-roadmap",
          title: "Roadmaps",
          icon: <Map size={20} />,
        },
      ],
    },
    {
      key: "/a/training",
      title: "Training",
      icon: <Book size={20} />,
      isExpanded: true,
      children: [
        {
          key: "/a/training/classes",
          title: "Classes",
          icon: <Calendar size={20} />,
        },
        {
          key: "/a/training/enrollments",
          title: "Enrollments",
          icon: <UserPlus size={20} />,
        },
        {
          key: "/a/training/exam",
          title: "Exam",
          icon: <CalendarRange size={20} />,
        },
      ],
    },
    {
      key: "/a/notifications",
      title: "Notifications",
      icon: <Bell size={20} />,
    },
  ];
  // Student menu items
  const studentMenuItems: IMenuItem[] = [
    {
      key: "/s/academic",
      title: "Academic",
      icon: <School size={20} />,
      isExpanded: true,
      children: [
        {
          key: "/s/academic/enrollment",
          title: "Enrollment",
          icon: <UserPlus size={20} />,
        },
        {
          key: "/s/academic/enrollment-result",
          title: "Enrollment Result",
          icon: <ClipboardList size={20} />,
        },
        {
          key: "/s/academic/roadmap",
          title: "My Roadmap",
          icon: <Map size={20} />,
        },
        {
          key: "/s/academic/tuition",
          title: "Tuition",
          icon: <DollarSign size={20} />,
        },
      ],
    },
    {
      key: "/s/training",
      title: "Training",
      icon: <Book size={20} />,
      isExpanded: true,
      children: [
        {
          key: "/s/training/class-schedule",
          title: "Class Schedule",
          icon: <Calendar size={20} />,
        },
        {
          key: "/s/training/exam-schedule",
          title: "Exam Schedule",
          icon: <CalendarRange size={20} />,
        },
        {
          key: "/s/training/class-result",
          title: "Class Result",
          icon: <ClipboardList size={20} />,
        },
      ],
    },
    {
      key: "/s/notifications",
      title: "Notifications",
      icon: <Bell size={20} />,
    },
  ];

  const trainingManagerMenuItems: IMenuItem[] = [
    { key: "/t", title: "Training", icon: <Book size={20} /> },
  ];

  const lecturerMenuItems: IMenuItem[] = [
    { key: "/l", title: "Lecturer", icon: <User size={20} /> },
    {
      key: "/l/class",
      title: "Class Mangement",
      icon: <ClipboardList size={20} />,
    },
  ];

  const bottomMenuItems: IMenuItem[] = [
    { key: "settings", title: "Settings", icon: <Settings size={20} /> },
    {
      key: "logout",
      title: "Logout",
      icon: <LogOut size={20} />,
      className: "text-danger",
    },
  ];

  const handleItemClick = (key: string) => {
    if (key === "logout") {
      logout();
      router.push("/login");

      return;
    }
    setActiveKey(key);
    router.push(key);
  };

  // Select menu items based on user role
  const mainMenuItems =
    user?.role === "Admin"
      ? adminMenuItems
      : user?.role === "TrainingManager"
        ? trainingManagerMenuItems
        : user?.role === "Lecturer"
          ? lecturerMenuItems
          : studentMenuItems;

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

        {/* Scrollable menu area */}
        <div className="flex-1 overflow-y-auto">
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
        </div>

        {/* Fixed bottom menu */}
        <div className="p-3 mt-auto">
          {bottomMenuItems.map((item) => (
            <MenuItem
              key={item.key}
              activeKey={activeKey}
              collapsed={collapsed}
              item={item}
              onClick={() => handleItemClick(item.key)}
            />
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default Sidebar;
