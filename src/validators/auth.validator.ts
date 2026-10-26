import { z } from "zod";

const timezoneSchema = z
  .string()
  .trim()
  .min(1, "Múi giờ không được để trống")
  .max(100)
  .refine((value) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
      return true;
    } catch {
      return false;
    }
  }, "Múi giờ không hợp lệ");

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Họ tên là bắt buộc").max(100),
  email: z.string().trim().email("Email không hợp lệ").max(254),
  password: z
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(72, "Mật khẩu không được vượt quá 72 ký tự"),
  timezone: timezoneSchema.optional().default("Asia/Ho_Chi_Minh"),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").max(254),
  password: z.string().min(1, "Mật khẩu là bắt buộc").max(72),
}).strict();
