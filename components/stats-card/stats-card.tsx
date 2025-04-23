import React from "react";
import { Card } from "@heroui/react";

import styles from "./stats-card.module.scss";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value }) => {
  return (
    <Card className={styles.statsCard}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div className={styles.statsValue}>{value}</div>
      <div className={styles.statsLabel}>{title}</div>
    </Card>
  );
};
