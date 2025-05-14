/**
 * API configuration constants
 */

// Base API URLs for different services
export const API_URLS = {
  COURSE: "https://localhost:6001/api",
  AUTH: "https://localhost:5001/api",
  MAJOR: "https://localhost:7001/api",
  BATCH: "https://localhost:8001/api",
};

// Default request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// API endpoints
export const API_ENDPOINTS = {
  COURSES: "/c/Courses",
  TRAINING_ROADMAPS: "/c/TrainingRoadmaps", // Added training roadmap endpoint
  COURSES_GROUP: "/c/CoursesGroup",
  AUTH: "/u/Auth",
  MAJORS: "/m/Major",
  BATCHES: "/u/Batch",
  STUDENTS: "/u/Student",
  MAJOR_GROUPS: "/m/MajorGroup",
  DEPARTMENTS: "/m/Department",
};

// Common headers
export const COMMON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
