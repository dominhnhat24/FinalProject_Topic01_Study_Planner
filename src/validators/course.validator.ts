import { z } from "zod";

const courseFields = {
  code: z.string().trim().min(1, "Mã học phần là bắt buộc").max(30),
  name: z.string().trim().min(1, "Tên học phần là bắt buộc").max(150),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Màu phải có dạng #RRGGBB"),
};

export const createCourseSchema = z.object({
  ...courseFields,
  color: courseFields.color.default("#4F46E5"),
}).strict();

export const updateCourseSchema = z.object({
  code: courseFields.code.optional(),
  name: courseFields.name.optional(),
  color: courseFields.color.optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  "Phải cung cấp ít nhất một trường để cập nhật",
);
