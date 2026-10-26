import mongoose from "mongoose";
import { Assignment } from "../models/assignment.model.js";
import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";

export interface CreateCourseInput {
  code: string;
  name: string;
  color: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

function toCoursePublic(course: { _id: unknown; code: string; name: string; color: string; userId: unknown; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: String(course._id),
    userId: String(course.userId),
    code: course.code,
    name: course.name,
    color: course.color,
    ...(course.createdAt ? { createdAt: course.createdAt } : {}),
    ...(course.updatedAt ? { updatedAt: course.updatedAt } : {}),
  };
}

function assertValidCourseId(courseId: string): void {
  if (!mongoose.isValidObjectId(courseId)) {
    throw new ApiError(400, "courseId không hợp lệ");
  }
}

export async function listCourses(userId: string) {
  const courses = await Course.find({ userId }).sort({ name: 1 }).lean();
  return courses.map(toCoursePublic);
}

export async function getCourse(userId: string, courseId: string) {
  assertValidCourseId(courseId);

  const course = await Course.findOne({ _id: courseId, userId }).lean();
  if (!course) {
    throw new ApiError(404, "Không tìm thấy học phần");
  }

  return toCoursePublic(course);
}

export async function createCourse(userId: string, input: CreateCourseInput) {
  const course = await Course.create({
    ...input,
    userId,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
  });

  return toCoursePublic(course);
}

export async function updateCourse(userId: string, courseId: string, input: UpdateCourseInput) {
  assertValidCourseId(courseId);

  const update = {
    ...input,
    ...(input.code ? { code: input.code.trim().toUpperCase() } : {}),
    ...(input.name ? { name: input.name.trim() } : {}),
  };

  const course = await Course.findOneAndUpdate(
    { _id: courseId, userId },
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!course) {
    throw new ApiError(404, "Không tìm thấy học phần");
  }

  return toCoursePublic(course);
}

export async function deleteCourse(userId: string, courseId: string) {
  assertValidCourseId(courseId);

  const course = await Course.findOne({ _id: courseId, userId }).select("_id").lean();
  if (!course) {
    throw new ApiError(404, "Không tìm thấy học phần");
  }

  const [assignmentResult] = await Promise.all([
    Assignment.deleteMany({ userId, courseId: course._id }),
    Course.deleteOne({ _id: course._id, userId }),
  ]);

  return {
    id: courseId,
    deletedAssignments: assignmentResult.deletedCount,
  };
}
