import mongoose, { type FilterQuery } from "mongoose";
import { Assignment, type AssignmentDocument } from "../models/assignment.model.js";
import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { completionRate } from "../utils/progress.js";

export interface CreateAssignmentInput {
  courseId: string;
  title: string;
  dueAt: Date;
  status: "pending" | "completed";
  notes?: string;
  attachments: { uri: string; fileName?: string }[];
}

export interface UpdateAssignmentInput {
  courseId?: string;
  title?: string;
  dueAt?: Date;
  status?: "pending" | "completed";
  notes?: string;
  attachments?: { uri: string; fileName?: string }[];
}

function toAssignmentPublic(assignment: { _id: unknown; userId: unknown; courseId: unknown; title: string; dueAt: Date; status: "pending" | "completed"; notes?: string; attachments: { _id?: unknown; uri: string; fileName?: string }[]; createdAt?: Date; updatedAt?: Date }) {
  return {
    id: String(assignment._id),
    userId: String(assignment.userId),
    courseId: String(assignment.courseId),
    title: assignment.title,
    dueAt: assignment.dueAt,
    status: assignment.status,
    notes: assignment.notes ?? "",
    attachments: assignment.attachments.map((attachment) => ({
      ...(attachment._id ? { id: String(attachment._id) } : {}),
      uri: attachment.uri,
      ...(attachment.fileName ? { fileName: attachment.fileName } : {}),
    })),
    ...(assignment.createdAt ? { createdAt: assignment.createdAt } : {}),
    ...(assignment.updatedAt ? { updatedAt: assignment.updatedAt } : {}),
  };
}

export interface AssignmentFilters {
  courseId?: string;
  status?: "pending" | "completed";
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

async function assertOwnedCourse(userId: string, courseId: string) {
  if (!mongoose.isValidObjectId(courseId)) {
    throw new ApiError(400, "courseId không hợp lệ");
  }

  const course = await Course.findOne({ _id: courseId, userId }).select("_id").lean();
  if (!course) {
    throw new ApiError(404, "Không tìm thấy học phần");
  }

  return course;
}

async function getOwnedAssignment(userId: string, assignmentId: string) {
  if (!mongoose.isValidObjectId(assignmentId)) {
    throw new ApiError(400, "assignmentId không hợp lệ");
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, userId }).lean();
  if (!assignment) {
    throw new ApiError(404, "Không tìm thấy bài tập");
  }

  return assignment;
}

function buildAssignmentQuery(userId: string, filters: AssignmentFilters): FilterQuery<AssignmentDocument> {
  const query: FilterQuery<AssignmentDocument> = { userId };

  if (filters.courseId) query.courseId = filters.courseId;
  if (filters.status) query.status = filters.status;

  if (filters.from || filters.to) {
    query.dueAt = {};
    if (filters.from) query.dueAt.$gte = new Date(filters.from);
    if (filters.to) query.dueAt.$lte = new Date(filters.to);
  }

  return query;
}

export async function listAssignments(userId: string, filters: AssignmentFilters) {
  if (filters.courseId) {
    await assertOwnedCourse(userId, filters.courseId);
  }

  const query = buildAssignmentQuery(userId, filters);
  const skip = (filters.page - 1) * filters.limit;

  const [items, total] = await Promise.all([
    Assignment.find(query)
      .sort({ dueAt: 1, _id: 1 })
      .skip(skip)
      .limit(filters.limit)
      .lean(),
    Assignment.countDocuments(query),
  ]);

  return {
    items: items.map(toAssignmentPublic),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

export async function createAssignment(userId: string, input: CreateAssignmentInput) {
  await assertOwnedCourse(userId, input.courseId);

  const assignment = await Assignment.create({
    ...input,
    userId,
  });

  return toAssignmentPublic(assignment.toObject());
}

export async function getAssignment(userId: string, assignmentId: string) {
  const assignment = await getOwnedAssignment(userId, assignmentId);
  return toAssignmentPublic(assignment);
}

export async function updateAssignment(
  userId: string,
  assignmentId: string,
  input: UpdateAssignmentInput,
) {
  await getOwnedAssignment(userId, assignmentId);

  if (input.courseId) {
    await assertOwnedCourse(userId, input.courseId);
  }

  const update = {
    ...input,
    ...(input.title ? { title: input.title.trim() } : {}),
    ...(input.notes !== undefined ? { notes: input.notes.trim() } : {}),
  };

  const assignment = await Assignment.findOneAndUpdate(
    { _id: assignmentId, userId },
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  if (!assignment) {
    throw new ApiError(404, "Không tìm thấy bài tập");
  }

  return toAssignmentPublic(assignment);
}

export async function deleteAssignment(userId: string, assignmentId: string) {
  await getOwnedAssignment(userId, assignmentId);

  await Assignment.deleteOne({ _id: assignmentId, userId });
  return { id: assignmentId };
}

export async function getProgress(userId: string) {
  const courses = await Course.find({ userId }).select("_id code name color").sort({ name: 1 }).lean();
  if (courses.length === 0) return [];

  const stats = await Assignment.aggregate<{
    _id: mongoose.Types.ObjectId;
    total: number;
    completed: number;
  }>([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$courseId",
        total: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const statsByCourse = new Map(stats.map((item) => [String(item._id), item]));

  return courses.map((course) => {
    const stat = statsByCourse.get(String(course._id));
    const total = stat?.total ?? 0;
    const completed = stat?.completed ?? 0;

    return {
      courseId: String(course._id),
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
