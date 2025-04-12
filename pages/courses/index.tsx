import { useState, useEffect } from "react";
import DefaultLayout from "@/layouts/default";
import {
  Input,
  Button,
  Pagination,
  Modal,
  Checkbox,
  useDisclosure,
  ModalFooter,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@heroui/react";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/table/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseService } from "@/services/course/course.service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setCourses,
  setQuery,
  setTotal,
  setLoading,
  setError,
} from "@/store/slices/courseSlice";
import { Course } from "@/services/course/course.schema";
import { majorService } from "@/services/major/major.service";
import { Major } from "@/services/major/major.schema";

export default function CoursesPage() {
  const dispatch = useAppDispatch();
  const { courses, query, total, isLoading } = useAppSelector(
    (state) => state.course
  );
  const [majors, setMajors] = useState<Major[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Create modal
  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onOpenChange: onCreateOpenChange,
  } = useDisclosure();
  // Update modal
  const {
    isOpen: isUpdateOpen,
    onOpen: onUpdateOpen,
    onOpenChange: onUpdateOpenChange,
  } = useDisclosure();

  // Create form
  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    formState: { errors: createErrors, isSubmitting: isCreateSubmitting },
  } = useForm({
    defaultValues: {
      code: "",
      name: "",
      description: "",
      price: 0,
      credit: 0,
      minCreditCanApply: 0,
      majorId: "",
      isOpening: true,
      isHavePracticeClass: false,
      isUseForCalculateScore: true,
    },
  });

  // Update form
  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    setValue: updateSetValue,
    formState: { errors: updateErrors, isSubmitting: isUpdateSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      majorId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await majorService.getMajors();
        setMajors(response.data);
      } catch (error) {
        console.error("Failed to fetch majors:", error);
      }
    };

    fetchMajors();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        dispatch(setLoading(true));
        const response = await courseService.getCourses(query);
        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        dispatch(
          setError(error instanceof Error ? error.message : "An error occurred")
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchCourses();
  }, [query, dispatch]);

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    updateSetValue("name", course.name);
    updateSetValue("description", course.description);
    updateSetValue("price", course.price);
    updateSetValue("majorId", course.majorId);
    updateSetValue("isActive", course.isOpening);
    onUpdateOpen();
  };

  const animals = [
    { key: "cat", label: "Cat" },
    { key: "dog", label: "Dog" },
    { key: "elephant", label: "Elephant" },
    { key: "lion", label: "Lion" },
    { key: "tiger", label: "Tiger" },
    { key: "giraffe", label: "Giraffe" },
    { key: "dolphin", label: "Dolphin" },
    { key: "penguin", label: "Penguin" },
    { key: "zebra", label: "Zebra" },
    { key: "shark", label: "Shark" },
    { key: "whale", label: "Whale" },
    { key: "otter", label: "Otter" },
    { key: "crocodile", label: "Crocodile" },
  ];

  const handleDelete = async (course: Course) => {
    if (window.confirm(`Are you sure you want to delete ${course.name}?`)) {
      try {
        await courseService.deleteCourse(course.id);
        // Refetch courses after deleting
        const response = await courseService.getCourses(query);
        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  const onCreateSubmit = async (data: any) => {
    try {
      await courseService.createCourse(data);
      onCreateOpenChange();
      createReset();
      // Refetch courses after creating
      const response = await courseService.getCourses(query);
      dispatch(setCourses(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  const onUpdateSubmit = async (data: any) => {
    try {
      if (selectedCourse) {
        await courseService.updateCourse(selectedCourse.id, data);
        onUpdateOpenChange();
        updateReset();
        setSelectedCourse(null);
        // Refetch courses after updating
        const response = await courseService.getCourses(query);
        dispatch(setCourses(response.data.data));
        dispatch(setTotal(response.data.total));
      }
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleSearch = (value: string) => {
    dispatch(setQuery({ ...query, searchQuery: value, pageNumber: 1 }));
  };

  const handleSort = (key: string) => {
    dispatch(
      setQuery({
        ...query,
        orderBy: key,
        isDesc: query.orderBy === key ? !query.isDesc : false,
      })
    );
  };

  const handlePageChange = (page: number) => {
    dispatch(setQuery({ ...query, pageNumber: page }));
  };

  const columns = [
    {
      key: "code",
      title: "Code",
      sortable: true,
      render: (course: Course) => course.code,
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (course: Course) => course.name,
    },
    {
      key: "credit",
      title: "Credit",
      sortable: true,
      render: (course: Course) => course.credit,
    },
    {
      key: "price",
      title: "Price",
      sortable: true,
      render: (course: Course) => `$${course.price}`,
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (course: Course) => (
        <span
          className={`px-2 py-1 rounded text-sm ${course.isOpening ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {course.isOpening ? "Opening" : "Closed"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (course: Course) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="bordered"
            onPress={() => handleEdit(course)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            onPress={() => handleDelete(course)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <Button variant="solid" color="primary" onPress={onCreateOpen}>
            Add Course
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Search courses..."
              value={query.searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <DataTable
            data={courses}
            columns={columns}
            isLoading={isLoading}
            sortKey={query.orderBy}
            sortDirection={query.isDesc ? "desc" : "asc"}
            onSort={handleSort}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <Pagination
            total={Math.ceil(total / query.itemsPerpage)}
            page={query.pageNumber}
            onChange={handlePageChange}
          />
        </div>

        {/* Create Course Modal */}
        <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Add New Course
                </ModalHeader>
                <ModalBody>
                  <form
                    onSubmit={createHandleSubmit(onCreateSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code
                        </label>
                        <Input
                          {...createRegister("code")}
                          errorMessage={createErrors.code?.message}
                          placeholder="Enter course code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <Input
                          {...createRegister("name")}
                          errorMessage={createErrors.name?.message}
                          placeholder="Enter course name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Input
                        {...createRegister("description")}
                        errorMessage={createErrors.description?.message}
                        placeholder="Enter course description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Price
                        </label>
                        <Input
                          type="number"
                          {...createRegister("price")}
                          errorMessage={createErrors.price?.message}
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Credit
                        </label>
                        <Input
                          type="number"
                          {...createRegister("credit")}
                          errorMessage={createErrors.credit?.message}
                          placeholder="Enter credits"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Major
                      </label>
                      <Select
                        {...createRegister("majorId")}
                        placeholder="Select a major"
                        items={majors}
                        className="w-full"
                        selectionMode="single"
                      >
                        {majors.map((major) => (
                          <SelectItem key={major.id}>
                            {`${major.name} (${major.code})`}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Min Credits to Apply
                        </label>
                        <Input
                          type="number"
                          {...createRegister("minCreditCanApply")}
                          errorMessage={createErrors.minCreditCanApply?.message}
                          placeholder="Enter minimum credits"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Checkbox {...createRegister("isOpening")}>
                        Is Opening
                      </Checkbox>
                      <Checkbox {...createRegister("isHavePracticeClass")}>
                        Has Practice Class
                      </Checkbox>
                      <Checkbox {...createRegister("isUseForCalculateScore")}>
                        Use for Score Calculation
                      </Checkbox>
                    </div>
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={createHandleSubmit(onCreateSubmit)}
                    disabled={isCreateSubmitting}
                  >
                    {isCreateSubmitting ? "Creating..." : "Create Course"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>

        {/* Update Course Modal */}
        <Modal isOpen={isUpdateOpen} onOpenChange={onUpdateOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Edit Course
                </ModalHeader>
                <ModalBody>
                  <form
                    onSubmit={updateHandleSubmit(onUpdateSubmit)}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <Input
                        {...updateRegister("name")}
                        errorMessage={updateErrors.name?.message}
                        placeholder="Enter course name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Input
                        {...updateRegister("description")}
                        errorMessage={updateErrors.description?.message}
                        placeholder="Enter course description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Price
                      </label>
                      <Input
                        type="number"
                        {...updateRegister("price")}
                        errorMessage={updateErrors.price?.message}
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Major
                      </label>
                      <Select
                        placeholder="Select a major"
                        items={majors}
                        className="w-full"
                        selectionMode="single"
                      >
                        {majors.map((major) => (
                          <SelectItem key={major.id}>
                            {`${major.name} (${major.code})`}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Checkbox {...updateRegister("isActive")}>
                        Is Active
                      </Checkbox>
                    </div>
                  </form>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={updateHandleSubmit(onUpdateSubmit)}
                    disabled={isUpdateSubmitting}
                  >
                    {isUpdateSubmitting ? "Updating..." : "Update Course"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}
