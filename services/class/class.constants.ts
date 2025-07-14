export const ACADEMIC_CLASS_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  STARTED: 3,
  REJECTED: 6,
  ENDED: 7,
} as const;

export const ACADEMIC_CLASS_STATUS_LABELS = {
  [ACADEMIC_CLASS_STATUS.PENDING]: "Pending",
  [ACADEMIC_CLASS_STATUS.APPROVED]: "Approved",
  [ACADEMIC_CLASS_STATUS.STARTED]: "Started",
  [ACADEMIC_CLASS_STATUS.REJECTED]: "Rejected",
  [ACADEMIC_CLASS_STATUS.ENDED]: "Ended",
} as const;

export const getStatusLabel = (status: number): string => {
  return (
    ACADEMIC_CLASS_STATUS_LABELS[
      status as keyof typeof ACADEMIC_CLASS_STATUS_LABELS
    ] || "Unknown"
  );
};

export const getStatusColor = (status: number): string => {
  switch (status) {
    case ACADEMIC_CLASS_STATUS.PENDING:
      return "warning"; // yellow/orange
    case ACADEMIC_CLASS_STATUS.APPROVED:
      return "info"; // blue
    case ACADEMIC_CLASS_STATUS.STARTED:
      return "success"; // green
    case ACADEMIC_CLASS_STATUS.REJECTED:
      return "danger"; // red
    case ACADEMIC_CLASS_STATUS.ENDED:
      return "secondary"; // gray
    default:
      return "default";
  }
};
