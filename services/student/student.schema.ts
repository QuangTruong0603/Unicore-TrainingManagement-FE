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
});

export const studentSchema = z.object({
  id: z.string(),
  accumulateCredits: z.number().min(0).default(0),
  accumulateScore: z.number().min(0).default(0),
  accumulateActivityScore: z.number().min(0).default(0),
  studentCode: z.string().min(1, "Student code is required"),
  majorId: z.string().min(1, "Major is required"),
  batchId: z.string().min(1, "Batch is required"),
  applicationUserId: z.string(),
  applicationUser: applicationUserSchema,
});

export const studentQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  pageSize: z.number().min(1).default(10),
  total: z.number().default(0),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  majorId: z.string().optional(),
  batchId: z.string().optional(),
  by: z.string().optional(),
  isDesc: z.boolean().default(false),
});

// Define FileList type for Zod
const FileListSchema = z.custom<FileList>((val) => val instanceof FileList, {
  message: "Invalid file input",
});

export const studentImportSchema = z.object({
  file: FileListSchema.refine((files) => files.length > 0, "File is required"),
  batchId: z.string().min(1, "Batch is required"),
  majorId: z.string().min(1, "Major is required"),
});

// Types
export type ApplicationUser = z.infer<typeof applicationUserSchema>;
export type Student = z.infer<typeof studentSchema>;
export type StudentQuery = z.infer<typeof studentQuerySchema>;
export type StudentImport = z.infer<typeof studentImportSchema>;
