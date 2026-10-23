import { z } from "zod";
import { objectIdSchema } from "./common.validator";

const attachmentSchema = z.object({
  uri: z.string().trim().url().max(2048),
  fileName: z.string().trim().max(255).optional(),
});

const dueAtSchema = z.string().datetime({ offset: true }).transform((value) => new Date(value));

export const createAssignmentSchema = z.object({
  courseId: objectIdSchema,
  title: z.string().trim().min(1).max(200),
  dueAt: dueAtSchema,
  status: z.enum(["pending", "completed"]).optional(),
  notes: z.string().max(5000).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
});

export const updateAssignmentSchema = z.object({
  courseId: objectIdSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  dueAt: dueAtSchema.optional(),
  status: z.enum(["pending", "completed"]).optional(),
  notes: z.string().max(5000).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
}).refine((value) => Object.keys(value).length > 0, "Phải cung cấp ít nhất một trường để cập nhật");

export const assignmentQuerySchema = z.object({
  courseId: objectIdSchema.optional(),
  status: z.enum(["pending", "completed"]).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), {
  message: "'from' phải nhỏ hơn hoặc bằng 'to'",
});
