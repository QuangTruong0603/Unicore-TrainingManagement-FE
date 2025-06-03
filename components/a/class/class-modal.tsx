import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Checkbox,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";

import { Course } from "@/services/course/course.schema";
import { Semester } from "@/services/semester/semester.schema";
import { AcademicClass } from "@/services/class/class.schema";
import { Shift } from "@/services/shift/shift.schema";
import {
  AcademicClassCreateDto,
  ScheduleInDayCreateForClassDto,
} from "@/services/class/class.dto";
import { courseService } from "@/services/course/course.service";
import { semesterService } from "@/services/semester/semester.service";
import { roomService } from "@/services/room/room.service";
import { shiftService } from "@/services/shift/shift.service";
import { classService } from "@/services/class/class.service";

interface ClassModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onSubmit: (data: AcademicClassCreateDto) => Promise<void>;
  academicClass?: AcademicClass | null;
  isSubmitting: boolean;
  mode: "create" | "update";
}

interface Room {
  id: string;
  name: string;
  availableSeats: number;
  floorId?: string; // Make floorId optional to match the service response
}

export function ClassModal({
  isOpen,
  onOpenChange,
  onSubmit,
  academicClass,
  isSubmitting,
  mode,
}: ClassModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [theoryClasses, setTheoryClasses] = useState<AcademicClass[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]); // Empty by default

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AcademicClassCreateDto>({
    defaultValues:
      mode === "create"
        ? {
            name: "",
            groupNumber: 1,
            capacity: 30,
            listOfWeeks: [], // Empty by default
            isRegistrable: false,
            courseId: "",
            semesterId: "",
            parentTheoryAcademicClassId: null,
            scheduleInDays: [],
          }
        : {
            name: academicClass?.name || "",
            groupNumber: academicClass?.groupNumber || 1,
            capacity: academicClass?.capacity || 30,
            listOfWeeks: academicClass?.listOfWeeks || [],
            isRegistrable: academicClass?.isRegistrable || false,
            courseId: academicClass?.courseId || "",
            semesterId: academicClass?.semesterId || "",
            parentTheoryAcademicClassId:
              academicClass?.parentTheoryAcademicClassId || null,
            scheduleInDays:
              academicClass?.scheduleInDays.map(
                (s: ScheduleInDayCreateForClassDto) => ({
                  dayOfWeek: s.dayOfWeek,
                  roomId: s.roomId,
                  shiftId: s.shiftId,
                })
              ) || [],
          },
  });

  const selectedCourseId = watch("courseId");

  // Fetch necessary data when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setIsLoadingData(true);
        try {
          // Fetch courses
          const courseResponse = await courseService.getCourses({
            pageNumber: 1,
            itemsPerpage: 100,
            orderBy: "name",
            isDesc: false,
          });

          setCourses(courseResponse.data.data);

          // Fetch semesters
          const semesterResponse = await semesterService.getSemesters({
            pageNumber: 1,
            itemsPerpage: 100,
            orderBy: "year",
            isDesc: true,
          });

          setSemesters(semesterResponse.data.data);

          // Fetch actual rooms from room service
          const roomResponse = await roomService.getAllRooms();

          setRooms(
            roomResponse.map((room: any) => ({
              ...room,
              floorId: room.floorId ?? "", // Provide a default if missing
            }))
          );
          // Fetch shifts using our new service
          const shiftResponse = await shiftService.getAllShifts();

          setShifts(shiftResponse.data);
        } catch {
          // Error handling - silently fail but could be enhanced with toast notifications
          setIsLoadingData(false);
        } finally {
          setIsLoadingData(false);
        }
      }
    };

    fetchData();
  }, [isOpen]);

  // Update class name when course changes
  useEffect(() => {
    if (selectedCourseId && mode === "create") {
      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId
      );

      if (selectedCourse) {
        // If course selected and in create mode, auto-generate a name
        setValue(
          "name",
          `${selectedCourse.code} - Group ${watch("groupNumber") || 1}`
        );
      }
    }
  }, [selectedCourseId, courses, mode, setValue, watch]);

  // Update available weeks when semester changes
  const selectedSemesterId = watch("semesterId");

  useEffect(() => {
    if (selectedSemesterId) {
      const selectedSemester = semesters.find(
        (semester) => semester.id === selectedSemesterId
      );

      if (selectedSemester && selectedSemester.numberOfWeeks > 0) {
        // Update the available weeks based on the selected semester
        const numberOfWeeks = selectedSemester.numberOfWeeks;

        const weeksArray = Array.from(
          { length: numberOfWeeks },
          (_, i) => i + 1
        );

        setSelectedWeeks(weeksArray);
        // Don't auto-select weeks by default
      }
    }
  }, [selectedSemesterId, semesters]);

  // Fetch theory classes when course and semester are selected (for practice classes)
  useEffect(() => {
    const fetchTheoryClasses = async () => {
      if (selectedCourseId && selectedSemesterId) {
        const selectedCourse = courses.find(
          (course) => course.id === selectedCourseId
        );

        // Only fetch theory classes if the course has practice periods
        if (selectedCourse && selectedCourse.practicePeriod > 0) {
          try {
            // Fetch theory classes for the same course and semester
            const theoryClassResponse = await classService.getClasses({
              pageNumber: 1,
              itemsPerpage: 100,
              isDesc: false,
              filters: {
                courseId: selectedCourseId,
                semesterId: selectedSemesterId,
              },
            });

            // Filter to only get theory classes (where parentTheoryAcademicClassId is null)
            const theoryClasses = (theoryClassResponse.data.data || []).filter(
              (cls: AcademicClass) => cls.parentTheoryAcademicClassId === null
            );

            setTheoryClasses(theoryClasses);
          } catch {
            // Silently handle error
            setTheoryClasses([]);
          }
        } else {
          setTheoryClasses([]);
        }
      } else {
        setTheoryClasses([]);
      }
    };

    fetchTheoryClasses();
  }, [selectedCourseId, selectedSemesterId, courses]);

  const handleFormSubmit = async (data: AcademicClassCreateDto) => {
    await onSubmit(data);
    reset();
  };

  const toggleWeekSelection = (week: number) => {
    const currentWeeks = watch("listOfWeeks") || [];

    if (currentWeeks.includes(week)) {
      setValue(
        "listOfWeeks",
        currentWeeks.filter((w) => w !== week)
      );
    } else {
      setValue("listOfWeeks", [...currentWeeks, week]);
    }
  };

  // Add a schedule entry
  const addScheduleEntry = () => {
    const currentSchedule = watch("scheduleInDays") || [];
    const defaultRoom = rooms.length > 0 ? rooms[0].id : "";
    const defaultShift = shifts.length > 0 ? shifts[0].id : "";

    setValue("scheduleInDays", [
      ...currentSchedule,
      {
        dayOfWeek: "Monday",
        roomId: defaultRoom,
        shiftId: defaultShift,
      },
    ]);
  };

  // Remove a schedule entry
  const removeScheduleEntry = (index: number) => {
    const currentSchedule = watch("scheduleInDays") || [];

    setValue(
      "scheduleInDays",
      currentSchedule.filter((_, i) => i !== index)
    );
  };

  // Update a schedule entry
  const updateScheduleEntry = (index: number, field: string, value: string) => {
    const currentSchedule = [...(watch("scheduleInDays") || [])];

    currentSchedule[index] = {
      ...currentSchedule[index],
      [field]: value,
    };
    setValue("scheduleInDays", currentSchedule);
  };

  const dayOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <Modal isOpen={isOpen} size="4xl" onOpenChange={onOpenChange}>
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            {mode === "create" ? "Create New Class" : "Edit Class"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 mb-3">
                  {/* Class name in a single row */}
                  <Controller
                    control={control}
                    name="name"
                    render={({ field }) => (
                      <Input
                        isRequired
                        errorMessage={errors.name?.message}
                        isDisabled={isLoadingData}
                        label="Class Name"
                        placeholder="Enter class name"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {/* Group number and capacity in the same row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                      control={control}
                      name="groupNumber"
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.groupNumber?.message}
                          isDisabled={isLoadingData}
                          label="Group Number"
                          min={1}
                          placeholder="Enter group number"
                          type="number"
                          value={field.value?.toString()}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="capacity"
                      render={({ field }) => (
                        <Input
                          isRequired
                          errorMessage={errors.capacity?.message}
                          isDisabled={isLoadingData}
                          label="Capacity"
                          min={1}
                          placeholder="Enter maximum capacity"
                          type="number"
                          value={field.value?.toString()}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 30)
                          }
                        />
                      )}
                    />
                  </div>

                  {/* Registration status at the bottom */}
                </div>
              </div>

              {/* Course and Semester Selection */}
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Autocomplete
                    isRequired
                    defaultItems={courses}
                    errorMessage={errors.courseId?.message}
                    isLoading={isLoadingData}
                    label="Course"
                    placeholder="Select a course"
                    selectedKey={field.value}
                    onSelectionChange={field.onChange}
                  >
                    {(course) => (
                      <AutocompleteItem key={course.id} textValue={course.name}>
                        <div className="flex flex-col">
                          <span>{course.name}</span>
                          <span className="text-tiny text-default-400">
                            {course.code}
                          </span>
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
                rules={{ required: "Course is required" }}
              />

              <Controller
                control={control}
                name="semesterId"
                render={({ field }) => (
                  <Autocomplete
                    isRequired
                    defaultItems={semesters}
                    errorMessage={errors.semesterId?.message}
                    isLoading={isLoadingData}
                    label="Semester"
                    placeholder="Select a semester"
                    selectedKey={field.value}
                    onSelectionChange={field.onChange}
                  >
                    {(semester) => (
                      <AutocompleteItem
                        key={semester.id}
                        textValue={`Semester ${semester.semesterNumber}/${semester.year}`}
                      >
                        <div className="flex flex-col">
                          <span>
                            Semester {semester.semesterNumber}/{semester.year}
                          </span>
                          {semester.isActive && (
                            <span className="text-tiny text-success">
                              Active
                            </span>
                          )}
                        </div>
                      </AutocompleteItem>
                    )}
                  </Autocomplete>
                )}
                rules={{ required: "Semester is required" }}
              />

              {/* Parent Theory Class Selection - Only show if course has practice periods */}
              {(() => {
                const selectedCourse = courses.find(
                  (course) => course.id === selectedCourseId
                );

                return selectedCourse && selectedCourse.practicePeriod > 0 ? (
                  <Controller
                    control={control}
                    name="parentTheoryAcademicClassId"
                    render={({ field }) => (
                      <Autocomplete
                        allowsEmptyCollection
                        defaultItems={theoryClasses}
                        errorMessage={
                          errors.parentTheoryAcademicClassId?.message
                        }
                        isLoading={isLoadingData}
                        label="Parent Theory Class"
                        placeholder="Select a theory class (optional for practice class)"
                        selectedKey={field.value}
                        onSelectionChange={field.onChange}
                      >
                        {(theoryClass) => (
                          <AutocompleteItem
                            key={theoryClass.id}
                            textValue={theoryClass.name}
                          >
                            <div className="flex flex-col">
                              <span>{theoryClass.name}</span>
                              <span className="text-tiny text-default-400">
                                Group {theoryClass.groupNumber}
                              </span>
                            </div>
                          </AutocompleteItem>
                        )}
                      </Autocomplete>
                    )}
                  />
                ) : null;
              })()}

              <Controller
                control={control}
                name="isRegistrable"
                render={({ field }) => (
                  <div className="flex items-center">
                    <Checkbox
                      isDisabled={isLoadingData}
                      isSelected={field.value}
                      onValueChange={field.onChange}
                    >
                      Open for Registration
                    </Checkbox>
                  </div>
                )}
              />

              {/* Week Selection */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium mb-2">Week Selection</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {selectedSemesterId
                    ? "Select the weeks this class will be held"
                    : "Please select a semester first to see available weeks"}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedWeeks.map((week) => (
                    <Chip
                      key={week}
                      className="cursor-pointer"
                      color={
                        watch("listOfWeeks")?.includes(week)
                          ? "primary"
                          : "default"
                      }
                      variant={
                        watch("listOfWeeks")?.includes(week)
                          ? "solid"
                          : "bordered"
                      }
                      onClick={() => toggleWeekSelection(week)}
                    >
                      Week {week}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Schedule</h3>
                  <Button
                    color="primary"
                    isDisabled={isLoadingData}
                    size="sm"
                    type="button"
                    onClick={addScheduleEntry}
                  >
                    Add Schedule
                  </Button>
                </div>

                {watch("scheduleInDays")?.length === 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    No schedule entries added yet. Click &quot;Add
                    Schedule&quot; to create one.
                  </p>
                )}

                {watch("scheduleInDays")?.map((schedule, index) => (
                  <div
                    key={index}
                    className="border rounded p-3 mb-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        Schedule Entry {index + 1}
                      </h4>
                      <Button
                        isIconOnly
                        color="danger"
                        isDisabled={isLoadingData}
                        size="sm"
                        type="button"
                        onClick={() => removeScheduleEntry(index)}
                      >
                        &times;
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Select
                        isDisabled={isLoadingData}
                        label="Day of Week"
                        selectedKeys={[schedule.dayOfWeek]}
                        onChange={(e) =>
                          updateScheduleEntry(
                            index,
                            "dayOfWeek",
                            e.target.value
                          )
                        }
                      >
                        {dayOptions.map((day) => (
                          <SelectItem key={day}>{day}</SelectItem>
                        ))}
                      </Select>

                      <Select
                        isDisabled={isLoadingData}
                        label="Room"
                        selectedKeys={[schedule.roomId]}
                        onChange={(e) =>
                          updateScheduleEntry(index, "roomId", e.target.value)
                        }
                      >
                        {rooms.map((room) => (
                          <SelectItem key={room.id}>
                            {`${room.name} (Seats: ${room.availableSeats})`}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        isDisabled={isLoadingData}
                        label="Shift"
                        selectedKeys={[schedule.shiftId]}
                        onChange={(e) =>
                          updateScheduleEntry(index, "shiftId", e.target.value)
                        }
                      >
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id}>
                            {`${shift.name} (${shift.startTime.substring(0, 5)}-${shift.endTime.substring(0, 5)})`}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={isSubmitting}
              variant="bordered"
              onPress={() => {
                reset();
                onOpenChange();
              }}
            >
              Cancel
            </Button>
            <Button color="primary" isLoading={isSubmitting} type="submit">
              {mode === "create" ? "Create Class" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
