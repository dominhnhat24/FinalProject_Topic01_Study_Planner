import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "../src/validators/auth.validator.js";
import { createCourseSchema } from "../src/validators/course.validator.js";
import { createAssignmentSchema } from "../src/validators/assignment.validator.js";

const validObjectId = "507f1f77bcf86cd799439011";


describe("request validators", () => {
  it("accepts a valid register request and supplies the default timezone", () => {
    const result = registerSchema.parse({
      name: "Nguyen Van A",
      email: "A@EXAMPLE.COM",
      password: "StrongPassword123",
    });

    expect(result.email).toBe("A@EXAMPLE.COM");
    expect(result.timezone).toBe("Asia/Ho_Chi_Minh");
  });

  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      name: "Nguyen Van A",
      email: "a@example.com",
      password: "1234567",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a course without color and applies the default", () => {
    const result = createCourseSchema.parse({
      code: "mob401",
      name: "Lap trinh Mobile",
    });

    expect(result.color).toBe("#4F46E5");
  });

  it("accepts assignment URI paths such as file:// or content://", () => {
    const result = createAssignmentSchema.parse({
      courseId: validObjectId,
      title: "Study Planner",
      dueAt: "2026-10-28T09:00:00+07:00",
      attachments: [{ uri: "file:///storage/emulated/0/document.pdf" }],
    });

    expect(result.status).toBe("pending");
    expect(result.attachments).toHaveLength(1);
  });

  it("rejects unknown request fields", () => {
    const result = loginSchema.safeParse({
      email: "a@example.com",
      password: "StrongPassword123",
      extra: true,
    });

    expect(result.success).toBe(false);
  });
});
