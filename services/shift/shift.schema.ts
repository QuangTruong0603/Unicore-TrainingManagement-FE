import { z } from "zod";

const timeSpanSchema = z.string().refine(
  (value) => {
    const parts = value.split(":");

    return parts.length === 3 && parts.every((p) => !isNaN(parseInt(p)));
  },
  {
    message: "TimeSpan must be in HH:mm:ss format",
  }
);

export const shiftSchema = z.object({
  id: z.string(),
  name: z.string(),
  startTime: timeSpanSchema,
  endTime: timeSpanSchema,
});

export type Shift = z.infer<typeof shiftSchema>;
