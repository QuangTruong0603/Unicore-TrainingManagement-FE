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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
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

  const onSubmit = async (data: any) => {
    try {
      await courseService.createCourse(data);
      setIsModalOpen(false);
      reset();
      // Refetch courses after creating a new one
      const response = await courseService.getCourses(query);
      dispatch(setCourses(response.data.data));
      dispatch(setTotal(response.data.total));
    } catch (error) {
      console.error("Failed to create course:", error);
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
          <Button size="sm" variant="bordered">
            Edit
          </Button>
          <Button size="sm" variant="flat" color="danger">
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <>abc</>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Courses</h1>
          <Button variant="solid" color="primary" onPress={onOpen}>
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

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Add New Course
                </ModalHeader>
                <ModalBody>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Code
                        </label>
                        <Input
                          {...register("code")}
                          errorMessage={errors.code?.message}
                          placeholder="Enter course code"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <Input
                          {...register("name")}
                          errorMessage={errors.name?.message}
                          placeholder="Enter course name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Input
                        {...register("description")}
                        errorMessage={errors.description?.message}
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
                          {...register("price")}
                          errorMessage={errors.price?.message}
                          placeholder="Enter price"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Credit
                        </label>
                        <Input
                          type="number"
                          {...register("credit")}
                          errorMessage={errors.credit?.message}
                          placeholder="Enter credits"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Major
                      </label>
                      <Select
                        {...register("majorId")}
                        placeholder="Select a major"
                        className="w-full"
                      >
                        {majors.map((major) => (
                          <SelectItem key={major.id} textValue={major.name}>
                            {major.name} ({major.code})
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
                          {...register("minCreditCanApply")}
                          errorMessage={errors.minCreditCanApply?.message}
                          placeholder="Enter minimum credits"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Checkbox {...register("isOpening")}>Is Opening</Checkbox>
                      <Checkbox {...register("isHavePracticeClass")}>
                        Has Practice Class
                      </Checkbox>
                      <Checkbox {...register("isUseForCalculateScore")}>
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
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Course"}
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
