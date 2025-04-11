import { Course, CourseQuery } from "./course.schema";

interface CourseResponse {
  success: boolean;
  data: {
    data: Course[];
    total: number;
    pageSize: number;
    pageIndex: number;
  };
  errors?: string[];
}

interface CreateCourseData {
  code: string;
  name: string;
  description: string;
  price: number;
  isOpening: boolean;
  credit: number;
  isHavePracticeClass: boolean;
  isUseForCalculateScore: boolean;
  minCreditCanApply: number;
  majorId: string;
  compulsoryCourseId?: string;
  parallelCourseId?: string;
}

export const courseService = {
  getCourses: async (query: CourseQuery): Promise<CourseResponse> => {
    const params = new URLSearchParams({
      'Pagination.PageNumber': query.pageNumber.toString(),
      'Pagination.ItemsPerpage': query.itemsPerpage.toString(),
      ...(query.searchQuery && { 'Filter.SearchQuery': query.searchQuery }),
      ...(query.isDesc && { 'Order.IsDesc': query.isDesc.toString() })
    });

    const response = await fetch(`https://localhost:6001/api/c/Courses/page?${params}`, {
      method: 'GET',
      headers: {
        'accept': 'text/plain'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  },

  createCourse: async (data: CreateCourseData): Promise<Course> => {
    const response = await fetch('https://localhost:6001/api/c/Courses', {
      method: 'POST',
      headers: {
        // 'accept': 'text/plain',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    return response.json();
  }
}; 