import { z } from "zod";

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
  district: z.string(),
  ward: z.string(),
  addressDetail: z.string(),
  imageURL: z.string(),
  isActive: z.boolean(),
  totalBuilding: z.number(),
  totalFloor: z.number(),
  totalRoom: z.number(),
});

export type Location = z.infer<typeof locationSchema>;

export const locationFilterSchema = z.object({
  name: z.string().optional(),
});

export type LocationFilter = z.infer<typeof locationFilterSchema>;

export const locationQuerySchema = z.object({
  pageNumber: z.number().min(1).default(1),
  itemsPerpage: z.number().min(1).default(10),
  searchQuery: z.string().optional(),
  orderBy: z.string().optional(),
  isDesc: z.boolean().default(false),
  filters: locationFilterSchema.optional(),
});

export type LocationQuery = z.infer<typeof locationQuerySchema>;
