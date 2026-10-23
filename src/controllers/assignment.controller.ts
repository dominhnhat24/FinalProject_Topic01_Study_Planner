import type { Request, Response } from "express";
import * as assignmentService from "../services/assignment.service";
import { getValidatedQuery } from "../middleware/validate";

interface AssignmentQuery {
  courseId?: string;
  status?: "pending" | "completed";
  from?: string;
  to?: string;
  page: number;
  limit: number;
}

export async function list(req: Request, res: Response) {
  const filters = getValidatedQuery<AssignmentQuery>(req);
  res.json({ success: true, data: await assignmentService.listAssignments(res.locals.userId, filters) });
}
export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await assignmentService.createAssignment(res.locals.userId, req.body) });
}
export async function get(req: Request, res: Response) {
  res.json({ success: true, data: await assignmentService.getAssignment(res.locals.userId, req.params.assignmentId) });
}
export async function update(req: Request, res: Response) {
  res.json({ success: true, data: await assignmentService.updateAssignment(res.locals.userId, req.params.assignmentId, req.body) });
}
export async function remove(req: Request, res: Response) {
  res.json({ success: true, data: await assignmentService.deleteAssignment(res.locals.userId, req.params.assignmentId) });
}
export async function progress(_req: Request, res: Response) {
  res.json({ success: true, data: await assignmentService.getProgress(res.locals.userId) });
}
