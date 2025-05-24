/**
 * API configuration constants
 */

// Base API URLs for different services
export const API_URLS = {
  COURSE: "https://localhost:6001/api",
  AUTH: "https://localhost:5001/api",
  MAJOR: "https://localhost:7001/api",
  BATCH: "https://localhost:5001/api",
  LOCATION: "https://localhost:7001/api", // Added location service URL
};

// Default request timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000;

// API endpoints
export const API_ENDPOINTS = {
  COURSES: "/c/Courses",
  TRAINING_ROADMAPS: "/c/TrainingRoadmaps", // Added training roadmap endpoint
  COURSES_GROUP: "/c/CoursesGroup",
  SEMESTERS: "/c/Semesters", // Added semester endpoint
  AUTH: "/u/Auth",
  MAJORS: "/m/Major",
  BATCHES: "/s/Batch",
  STUDENTS: "/u/Student",
  MAJOR_GROUPS: "/m/MajorGroup",
  DEPARTMENTS: "/m/Department",
  LOCATIONS: "/m/Location", // Added location endpoint
  BUILDINGS: "/m/Building", // Added building endpoint
  FLOORS: "/m/Floor", // Added floor endpoint
  ROOMS: "/m/Room", // Added room endpoint
};

// Common headers
export const COMMON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};
