import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "ID không hợp lệ");

export const courseIdParamsSchema = z.object({
  courseId: objectIdSchema,
}).strict();

export const assignmentIdParamsSchema = z.object({
  assignmentId: objectIdSchema,
}).strict();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();
