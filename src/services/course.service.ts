import mongoose from "mongoose";
import { Course } from "../models/Course";
import { Assignment } from "../models/Assignment";
import { ApiError } from "../utils/ApiError";

export async function listCourses(userId: string) {
  return Course.find({ userId }).sort({ name: 1 }).lean();
}

export async function createCourse(userId: string, input: { code: string; name: string; color?: string }) {
  const normalizedCode = input.code.trim().toUpperCase();
  const exists = await Course.exists({ userId, code: normalizedCode });
  if (exists) throw new ApiError(409, "Mã học phần đã tồn tại");
  return Course.create({ ...input, code: normalizedCode, userId });
}

export async function getCourse(userId: string, courseId: string) {
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError(400, "courseId không hợp lệ");
  const course = await Course.findOne({ _id: courseId, userId }).lean();
  if (!course) throw new ApiError(404, "Không tìm thấy học phần");
  return course;
}

export async function updateCourse(
  userId: string, courseId: string, input: { code?: string; name?: string; color?: string }
) {
  await getCourse(userId, courseId);
  const update = { ...input };
  if (update.code) update.code = update.code.trim().toUpperCase();
  if (update.code) {
    const duplicate = await Course.exists({ userId, code: update.code, _id: { $ne: courseId } });
    if (duplicate) throw new ApiError(409, "Mã học phần đã tồn tại");
  }
  const course = await Course.findOneAndUpdate(
    { _id: courseId, userId }, { $set: update }, { new: true, runValidators: true }
  ).lean();
  if (!course) throw new ApiError(404, "Không tìm thấy học phần");
  return course;
}

export async function deleteCourse(userId: string, courseId: string) {
  const course = await getCourse(userId, courseId);
  // Delete children first. For strict atomicity across collections, use a MongoDB transaction.
  await Assignment.deleteMany({ courseId: course._id });
  await Course.deleteOne({ _id: course._id, userId });
  return { id: courseId };
}
