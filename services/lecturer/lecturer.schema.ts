import { z } from "zod";

export const applicationUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  personId: z.string().min(1, "Person ID is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  status: z.number().min(0).max(1),
  imageUrl: z.string().optional(),
});

export const lecturerSchema = z.object({
  id: z.string(),
  lecturerCode: z.string().min(1, "Lecturer code is required"),
  degree: z.string().min(1, "Degree is required"),
  salary: z.number().min(0).default(0),
  departmentId: z.string().min(1, "Department is required"),
  workingStatus: z.number().min(0).max(1),
  joinDate: z.string().min(1, "Join date is required"),
  mainMajor: z.string().min(1, "Main major is required"),
  applicationUser: applicationUserSchema,
});

export const lecturerQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(10),
  total: z.number().default(0),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  departmentId: z.string().optional(),
  by: z.string().optional(),
  isDesc: z.boolean().default(false),
});

// Define FileList type for Zod
const FileListSchema = z.custom<FileList>((val) => val instanceof FileList, {
  message: "Invalid file input",
});

export const lecturerImportSchema = z.object({
  file: FileListSchema.refine((files) => files.length > 0, "File is required"),
  departmentId: z.string().min(1, "Department is required"),
});

// Types
export type ApplicationUser = z.infer<typeof applicationUserSchema>;
export type Lecturer = z.infer<typeof lecturerSchema>;
export type LecturerQuery = z.infer<typeof lecturerQuerySchema>;
export type LecturerImport = z.infer<typeof lecturerImportSchema>; 