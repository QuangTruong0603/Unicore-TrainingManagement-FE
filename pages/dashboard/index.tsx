import {
  Home,
  Users,
  BarChart,
  Calendar,
  CalendarRange,
  FileText,
  User,
  Share2,
  Mail,
} from "lucide-react";
import { Button } from "@heroui/react";
import { useEffect, useRef } from "react";

import DefaultLayout from "@/layouts/default";
import styles from "@/styles/pages/Dashboard.module.scss";
import { StatsCard } from "@/components/stats-card/stats-card";
import { ActivityTable, TableData } from "@/components/ui/table/table";

const statsData = [
  {
    key: "dashboard",
    title: "Total Dashboard Views",
    icon: <Home size={24} />,
    value: "1,234",
  },
  {
    key: "students",
    title: "Total Students",
    icon: <Users size={24} />,
    value: "856",
  },
  {
    key: "analytics",
    title: "Course Analytics",
    icon: <BarChart size={24} />,
    value: "92%",
  },
  {
    key: "lectures",
    title: "Active Lectures",
    icon: <User size={24} />,
    value: "45",
  },
  {
    key: "class",
    title: "Classes Today",
    icon: <Calendar size={24} />,
    value: "12",
  },
  {
    key: "exams",
    title: "Upcoming Exams",
    icon: <CalendarRange size={24} />,
    value: "8",
  },
  {
    key: "documents",
    title: "Total Documents",
    icon: <FileText size={24} />,
    value: "534",
  },
  {
    key: "programs",
    title: "Active Programs",
    icon: <Share2 size={24} />,
    value: "15",
  },
  {
    key: "messages",
    title: "New Messages",
    icon: <Mail size={24} />,
    value: "28",
  },
];

const activityData: TableData[] = [
  {
    id: "1",
    activity: "Submitted Assignment #123",
    date: "2024-03-15",
    status: "Completed",
  },
  {
    id: "2",
    activity: "Joined Class: Mathematics",
    date: "2024-03-14",
    status: "Active",
  },
  {
    id: "3",
    activity: "Started Quiz #45",
    date: "2024-03-13",
    status: "Progress",
  },
];

export default function DashboardPage() {
  const statsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = statsGridRef.current;

    if (!scrollContainer) return;

    let scrollPosition = 0;
    const cardWidth = scrollContainer.offsetWidth;
    const maxScroll = scrollContainer.scrollWidth - cardWidth;

    const autoScroll = () => {
      if (!scrollContainer) return;

      scrollPosition += cardWidth / 4;
      if (scrollPosition > maxScroll) {
        scrollPosition = 0;
      }

      scrollContainer.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    };

    const intervalId = setInterval(autoScroll, 3000);

    const handleScroll = () => {
      scrollPosition = scrollContainer.scrollLeft;
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(intervalId);
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleViewAll = () => {
    console.log("View all activities");
  };

  return (
    <DefaultLayout>
      <div className={styles.dashboardContainer}>
        <div className={styles.statsGridWrapper}>
          <div ref={statsGridRef} className={styles.statsGrid}>
            {statsData.map((stat) => (
              <StatsCard
                key={stat.key}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          <ActivityTable data={activityData} onViewAll={handleViewAll} />

          <div>
            <div className={styles.sectionTitle}>
              Notifications
              <Button size="sm" variant="light">
                Clear All
              </Button>
            </div>
            <div className={styles.notificationItem}>
              <div>New assignment posted in Mathematics</div>
              <div className={styles.notificationDate}>2 hours ago</div>
            </div>
            <div className={styles.notificationItem}>
              <div>Upcoming exam reminder: Physics</div>
              <div className={styles.notificationDate}>5 hours ago</div>
            </div>
            <div className={styles.notificationItem}>
              <div>Your assignment was graded</div>
              <div className={styles.notificationDate}>1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
