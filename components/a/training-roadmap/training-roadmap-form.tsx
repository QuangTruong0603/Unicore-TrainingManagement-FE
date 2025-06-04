import React from "react";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Select, SelectItem, Textarea } from "@heroui/react";

import { Major } from "@/services/major/major.schema";
import { Batch } from "@/services/batch/batch.schema";

// Create a schema for form validation
export const trainingRoadmapFormSchema = z.object({
  majorId: z.string({
    required_error: "Major is required",
  }),
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(1, "Name is required"),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(1, "Description is required"),
  startYear: z.preprocess(
    (val) => {
      const parsed = Number(val);

      return isNaN(parsed) ? new Date().getFullYear() : parsed;
    },
    z
      .number({
        required_error: "Start Year is required",
        invalid_type_error: "Start Year must be a number",
      })
      .min(2000, "Start Year must be 2000 or later")
  ) as unknown as z.ZodNumber,
  batchIds: z.array(z.string()),
});

export type TrainingRoadmapFormData = z.infer<typeof trainingRoadmapFormSchema>;

interface TrainingRoadmapFormProps {
  majors: Major[];
  batches: Batch[];
  onSubmit: (data: TrainingRoadmapFormData) => void;
  isSubmitting?: boolean;
  mode: "create"; // Only create mode is supported
}

export const TrainingRoadmapForm: React.FC<TrainingRoadmapFormProps> = ({
  majors,
  batches,
  onSubmit,
  isSubmitting = false,
  mode: _mode = "create",
}) => {
  // Get current year for the start year field
  const currentYear = new Date().getFullYear();

  // React Hook Form setup with zod validation
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TrainingRoadmapFormData>({
    resolver: zodResolver(trainingRoadmapFormSchema),
    defaultValues: {
      majorId: "",
      name: "",
      description: "",
      startYear: currentYear,
      batchIds: [],
    },
  });

  return (
    <form
      className="space-y-4"
      id="roadmap-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Major Selection */}
      <div className="form-group">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="majorId"
        >
          Major <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="majorId"
          render={({ field }) => (
            <Select
              className="w-full"
              defaultSelectedKeys={field.value ? [field.value] : []}
              errorMessage={errors.majorId?.message}
              id="majorId"
              isDisabled={isSubmitting}
              isInvalid={!!errors.majorId}
              placeholder="Select a major"
              selectedKeys={field.value ? [field.value] : []}
              selectionMode="single"
              onChange={(e) => field.onChange(e.target.value)}
            >
              {majors.map((major) => (
                <SelectItem
                  key={major.id}
                  textValue={`${major.name} (${major.code})`}
                >
                  {major.name} ({major.code})
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </div>

      {/* Name */}
      <div className="form-group">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="name"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              className="w-full"
              errorMessage={errors.name?.message}
              id="name"
              isDisabled={isSubmitting}
              isInvalid={!!errors.name}
              placeholder="Enter roadmap name"
              type="text"
              {...field}
            />
          )}
        />
      </div>

      {/* Description */}
      <div className="form-group">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="description"
        >
          Description <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              className="w-full min-h-[100px]"
              errorMessage={errors.description?.message}
              id="description"
              isDisabled={isSubmitting}
              isInvalid={!!errors.description}
              placeholder="Enter roadmap description"
              {...field}
            />
          )}
        />
      </div>

      {/* Start Year */}
      <div className="form-group">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="startYear"
        >
          Start Year <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="startYear"
          render={({ field: { onChange, value, ...rest } }) => (
            <Input
              className="w-full"
              errorMessage={errors.startYear?.message}
              id="startYear"
              isDisabled={isSubmitting}
              isInvalid={!!errors.startYear}
              max={currentYear + 10}
              min={2000}
              placeholder="Enter start year"
              type="number"
              value={value?.toString()}
              onChange={(e) => onChange(e.target.value)}
              {...rest}
            />
          )}
        />
      </div>

      {/* Batch Selection */}
      <div className="form-group">
        <label
          className="block text-sm font-medium text-gray-700 mb-1"
          htmlFor="batchIds"
        >
          Batches
        </label>
        <Controller
          control={control}
          name="batchIds"
          render={({ field }) => (
            <Select
              className="w-full"
              errorMessage={errors.batchIds?.message}
              id="batchIds"
              isDisabled={isSubmitting}
              isInvalid={!!errors.batchIds}
              placeholder="Select batches"
              selectedKeys={field.value}
              selectionMode="multiple"
              onSelectionChange={(keys) => {
                const selectedArray = Array.from(keys as Set<string>);

                field.onChange(selectedArray);
              }}
            >
              {batches.map((batch) => (
                <SelectItem
                  key={batch.id}
                  textValue={`${batch.title} (${batch.startYear})`}
                >
                  {batch.title} ({batch.startYear})
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </div>
    </form>
  );
};
