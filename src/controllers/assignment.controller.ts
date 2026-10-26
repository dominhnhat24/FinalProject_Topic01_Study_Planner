import type { Request, Response } from "express";
import * as assignmentService from "../services/assignment.service.js";

function userId(req: Request): string {
  return req.userId as string;
}

interface AssignmentQuery {
  courseId?: string;
  status?: "pending" | "completed";
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export async function list(req: Request, res: Response) {
  const filters = res.locals.validated?.query as AssignmentQuery;
  res.json({
    success: true,
    data: await assignmentService.listAssignments(userId(req), filters),
  });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({
    success: true,
    data: await assignmentService.createAssignment(userId(req), req.body),
  });
}

export async function get(req: Request, res: Response) {
  res.json({
    success: true,
    data: await assignmentService.getAssignment(userId(req), req.params.assignmentId),
  });
}

export async function update(req: Request, res: Response) {
  res.json({
    success: true,
    data: await assignmentService.updateAssignment(
      userId(req),
      req.params.assignmentId,
      req.body,
    ),
  });
}

export async function remove(req: Request, res: Response) {
  res.json({
    success: true,
    data: await assignmentService.deleteAssignment(userId(req), req.params.assignmentId),
  });
}

export async function progress(req: Request, res: Response) {
  res.json({
    success: true,
    data: await assignmentService.getProgress(userId(req)),
  });
}
