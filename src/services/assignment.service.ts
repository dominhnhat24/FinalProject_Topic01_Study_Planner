import mongoose, { type FilterQuery } from "mongoose";
import { Assignment, type AssignmentDocument } from "../models/Assignment";
import { Course } from "../models/Course";
import { ApiError } from "../utils/ApiError";
import { completionRate } from "../utils/progress";

interface AssignmentInput {
  courseId?: string;
  title?: string;
  dueAt?: Date;
  status?: "pending" | "completed";
  notes?: string;
  attachments?: { uri: string; fileName?: string }[];
}
interface AssignmentFilters {
  courseId?: string;
  status?: "pending" | "completed";
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

async function assertOwnedCourse(userId: string, courseId: string) {
  if (!mongoose.isValidObjectId(courseId)) throw new ApiError(400, "courseId không hợp lệ");
  const course = await Course.findOne({ _id: courseId, userId }).select("_id").lean();
  if (!course) throw new ApiError(404, "Không tìm thấy học phần");
  return course;
}

async function getOwnedAssignment(userId: string, assignmentId: string) {
  if (!mongoose.isValidObjectId(assignmentId)) throw new ApiError(400, "assignmentId không hợp lệ");
  const assignment = await Assignment.findById(assignmentId).lean();
  if (!assignment) throw new ApiError(404, "Không tìm thấy bài tập");
  const course = await Course.findOne({ _id: assignment.courseId, userId }).select("_id").lean();
  if (!course) throw new ApiError(404, "Không tìm thấy bài tập");
  return assignment;
}

export async function listAssignments(userId: string, filters: AssignmentFilters) {
  const courseFilter: Record<string, unknown> = {};
  if (filters.courseId) {
    const course = await assertOwnedCourse(userId, filters.courseId);
    courseFilter.courseId = course._id;
  } else {
    const courses = await Course.find({ userId }).select("_id").lean();
    courseFilter.courseId = { $in: courses.map((course) => course._id) };
  }

  const query: FilterQuery<AssignmentDocument> = { ...courseFilter };
  if (filters.status) query.status = filters.status;
  if (filters.from || filters.to) {
    query.dueAt = {};
    if (filters.from) query.dueAt.$gte = new Date(filters.from);
    if (filters.to) query.dueAt.$lte = new Date(filters.to);
  }

  const skip = (filters.page - 1) * filters.limit;
  const [items, total] = await Promise.all([
    Assignment.find(query).sort({ dueAt: 1 }).skip(skip).limit(filters.limit).lean(),
    Assignment.countDocuments(query),
  ]);

  return { items, pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } };
}

export async function createAssignment(userId: string, input: {
  courseId: string; title: string; dueAt: Date; status?: "pending" | "completed";
  notes?: string; attachments?: { uri: string; fileName?: string }[];
}) {
  const course = await assertOwnedCourse(userId, input.courseId);
  return Assignment.create({ ...input, courseId: course._id });
}

export async function getAssignment(userId: string, assignmentId: string) {
  const assignment = await getOwnedAssignment(userId, assignmentId);
  return assignment;
}

export async function updateAssignment(userId: string, assignmentId: string, input: AssignmentInput) {
  await getOwnedAssignment(userId, assignmentId);
  const update: Record<string, unknown> = { ...input };
  if (input.courseId) {
    const course = await assertOwnedCourse(userId, input.courseId);
    update.courseId = course._id;
  }
  const result = await Assignment.findByIdAndUpdate(
    assignmentId, { $set: update }, { new: true, runValidators: true }
  ).lean();
  if (!result) throw new ApiError(404, "Không tìm thấy bài tập");
  return result;
}

export async function deleteAssignment(userId: string, assignmentId: string) {
  await getOwnedAssignment(userId, assignmentId);
  await Assignment.findByIdAndDelete(assignmentId);
  return { id: assignmentId };
}

export async function getProgress(userId: string) {
  const courses = await Course.find({ userId }).select("_id code name color").lean();
  if (courses.length === 0) return [];

  const stats = await Assignment.aggregate([
    { $match: { courseId: { $in: courses.map((course) => course._id) } } },
    {
      $group: {
        _id: "$courseId",
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
      },
    },
  ]);

  const statsByCourse = new Map(stats.map((item) => [String(item._id), item]));
  return courses.map((course) => {
    const stat = statsByCourse.get(String(course._id));
    const total = stat?.total ?? 0;
    const completed = stat?.completed ?? 0;
    return {
      courseId: course._id,
      code: course.code,
      name: course.name,
      color: course.color,
      total,
      completed,
      pending: total - completed,
      completionRate: completionRate(completed, total),
    };
  });
}
