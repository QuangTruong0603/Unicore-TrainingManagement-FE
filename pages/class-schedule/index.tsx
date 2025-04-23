import type { ScheduleData } from "@/components/class-schedule/schedule-table";

import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import { ScheduleTable } from "@/components/class-schedule/schedule-table";
import { ScheduleForm } from "@/components/class-schedule/schedule-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog/confirm-dialog";

// Mock data - replace with actual API calls
const mockSchedules: ScheduleData[] = [
  {
    id: "1",
    className: "Class A",
    subject: "Mathematics",
    teacher: "John Doe",
    room: "Room 101",
    startTime: "08:00",
    endTime: "09:30",
    dayOfWeek: "monday",
    status: "active" as const,
  },
  {
    id: "2",
    className: "Class B",
    subject: "Physics",
    teacher: "Jane Smith",
    room: "Room 102",
    startTime: "10:00",
    endTime: "11:30",
    dayOfWeek: "tuesday",
    status: "active" as const,
  },
];

export default function ClassSchedulePage() {
  const [schedules, setSchedules] = useState(mockSchedules);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [deleteSchedule, setDeleteSchedule] = useState<ScheduleData | null>(
    null
  );

  const handleAdd = () => {
    setEditingSchedule(null);
    setIsFormOpen(true);
  };

  const handleEdit = (id: string) => {
    const schedule = schedules.find((s) => s.id === id);

    setEditingSchedule(schedule);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    const schedule = schedules.find((s) => s.id === id);

    if (schedule) {
      setDeleteSchedule(schedule);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteSchedule) {
      setSchedules(schedules.filter((s) => s.id !== deleteSchedule.id));
      setDeleteSchedule(null);
    }
  };

  const handleSubmit = (data: any) => {
    if (editingSchedule) {
      // Update existing schedule
      setSchedules(
        schedules.map((s) =>
          s.id === editingSchedule.id ? { ...data, id: s.id } : s
        )
      );
    } else {
      // Add new schedule
      setSchedules([...schedules, { ...data, id: Date.now().toString() }]);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-6">
        <ScheduleTable
          data={schedules}
          onAdd={handleAdd}
          onDelete={handleDeleteClick}
          onEdit={handleEdit}
        />

        <ScheduleForm
          initialData={editingSchedule}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleSubmit}
        />

        <ConfirmDialog
          confirmColor="danger"
          confirmText="Delete"
          isOpen={!!deleteSchedule}
          message={`Are you sure you want to delete the schedule for ${deleteSchedule?.className}?`}
          title="Delete Schedule"
          onClose={() => setDeleteSchedule(null)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </DefaultLayout>
  );
}
