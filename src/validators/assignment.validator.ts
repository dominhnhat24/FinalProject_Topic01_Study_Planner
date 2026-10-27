import { z } from "zod";
import { objectIdSchema } from "./common.validator.js";

const attachmentSchema = z.object({
  // ID được API trả về khi đọc bài tập.
  // Chấp nhận ID đầu vào nhưng không dùng ID do client quyết định.
  id: objectIdSchema.optional(),

  uri: z.string().trim().min(1, "URI đính kèm là bắt buộc").max(2048),
  fileName: z.string().trim().max(255).optional(),
})
  .strict()
  .transform(({ id: _id, ...attachment }) => attachment);

const dueAtSchema = z
  .string()
  .datetime({ offset: true, message: "dueAt phải là ISO-8601 có timezone, ví dụ 2026-10-28T09:00:00+07:00" })
  .transform((value) => new Date(value));

export const createAssignmentSchema = z.object({
  courseId: objectIdSchema,
  title: z.string().trim().min(1, "Tiêu đề là bắt buộc").max(200),
  dueAt: dueAtSchema,
  status: z.enum(["pending", "completed"]).default("pending"),
  notes: z.string().trim().max(5000).optional(),
  attachments: z.array(attachmentSchema).max(10).default([]),
}).strict();

export const updateAssignmentSchema = z.object({
  courseId: objectIdSchema.optional(),
  title: z.string().trim().min(1).max(200).optional(),
  dueAt: dueAtSchema.optional(),
  status: z.enum(["pending", "completed"]).optional(),
  notes: z.string().trim().max(5000).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  "Phải cung cấp ít nhất một trường để cập nhật",
);

export const assignmentQuerySchema = z.object({
  courseId: objectIdSchema.optional(),
  status: z.enum(["pending", "completed"]).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict().refine(
  (value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to),
  { message: "from phải nhỏ hơn hoặc bằng to", path: ["to"] },
);
