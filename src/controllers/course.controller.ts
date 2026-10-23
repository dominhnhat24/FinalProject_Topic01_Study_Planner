import type { Request, Response } from "express";
import * as courseService from "../services/course.service";

export async function list(_req: Request, res: Response) {
  res.json({ success: true, data: await courseService.listCourses(res.locals.userId) });
}
export async function create(req: Request, res: Response) {
  res.status(201).json({ success: true, data: await courseService.createCourse(res.locals.userId, req.body) });
}
export async function get(req: Request, res: Response) {
  res.json({ success: true, data: await courseService.getCourse(res.locals.userId, req.params.courseId) });
}
export async function update(req: Request, res: Response) {
  res.json({ success: true, data: await courseService.updateCourse(res.locals.userId, req.params.courseId, req.body) });
}
export async function remove(req: Request, res: Response) {
  res.json({ success: true, data: await courseService.deleteCourse(res.locals.userId, req.params.courseId) });
}
