import axios from 'axios';
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

const API_URL = 'https://localhost:6001/api';

export const courseService = {
  getCourses: async (query: CourseQuery): Promise<CourseResponse> => {
    const params = {
      'Pagination.PageNumber': query.pageNumber.toString(),
      'Pagination.ItemsPerpage': query.itemsPerpage.toString(),
      ...(query.searchQuery && { 'Filter.SearchQuery': query.searchQuery }),
      ...(query.isDesc && { 'Order.IsDesc': query.isDesc.toString() })
    };

    const response = await axios.get(`${API_URL}/c/Courses/page`, {
      params,
      headers: {
        'accept': 'text/plain'
      }
    });

    return response.data;
  },

  createCourse: async (data: CreateCourseData): Promise<Course> => {
    const response = await axios.post(`${API_URL}/c/Courses`, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }
}; 