import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCourse } from "../src/services/course.service.js";
import { getAssignment, createAssignment } from "../src/services/assignment.service.js";
import { Course } from "../src/models/course.model.js";
import { Assignment } from "../src/models/assignment.model.js";

vi.mock("../src/models/course.model.js", () => ({ Course: { findOne: vi.fn(), create: vi.fn() } }));
vi.mock("../src/models/assignment.model.js", () => ({ Assignment: { findOne: vi.fn(), create: vi.fn() } }));

const userA = "507f1f77bcf86cd799439011";
const userB = "507f1f77bcf86cd799439012";
const courseId = "507f1f77bcf86cd799439013";
const assignmentId = "507f1f77bcf86cd799439014";

function mockCourseFindOne(value: unknown) {
  const query = { lean: vi.fn().mockResolvedValue(value), select: vi.fn().mockReturnThis() };
  vi.mocked(Course.findOne).mockReturnValue(query as never);
  return query;
}

function mockAssignmentFindOne(value: unknown) {
  const query = { lean: vi.fn().mockResolvedValue(value), select: vi.fn().mockReturnThis() };
  vi.mocked(Assignment.findOne).mockReturnValue(query as never);
  return query;
}

describe("account data ownership boundaries", () => {
  beforeEach(() => vi.clearAllMocks());

  it("does not expose another user's course by ID", async () => {
    mockCourseFindOne(null);
    await expect(getCourse(userB, courseId)).rejects.toMatchObject({ statusCode: 404 });
    expect(Course.findOne).toHaveBeenCalledWith({ _id: courseId, userId: userB });
  });

  it("does not expose another user's assignment by ID", async () => {
    mockAssignmentFindOne(null);
    await expect(getAssignment(userB, assignmentId)).rejects.toMatchObject({ statusCode: 404 });
    expect(Assignment.findOne).toHaveBeenCalledWith({ _id: assignmentId, userId: userB });
  });

  it("refuses to create an assignment against a course owned by another account", async () => {
    mockCourseFindOne(null);
    await expect(createAssignment(userB, {
      courseId,
      title: "Cross-account attempt",
      dueAt: new Date("2026-10-28T09:00:00.000Z"),
      status: "pending",
      attachments: [],
    })).rejects.toMatchObject({ statusCode: 404 });
    expect(Course.findOne).toHaveBeenCalledWith({ _id: courseId, userId: userB });
    expect(Assignment.create).not.toHaveBeenCalled();
  });
});
