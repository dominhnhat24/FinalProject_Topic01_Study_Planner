import type { Request, Response } from "express";
import * as courseService from "../services/course.service.js";

function userId(req: Request): string {
  return req.userId as string;
}

export async function list(req: Request, res: Response) {
  res.json({ success: true, data: await courseService.listCourses(userId(req)) });
}

export async function create(req: Request, res: Response) {
  res.status(201).json({
    success: true,
    data: await courseService.createCourse(userId(req), req.body),
  });
}

export async function get(req: Request, res: Response) {
  res.json({
    success: true,
    data: await courseService.getCourse(userId(req), req.params.courseId),
  });
}

export async function update(req: Request, res: Response) {
  res.json({
    success: true,
    data: await courseService.updateCourse(userId(req), req.params.courseId, req.body),
  });
}

export async function remove(req: Request, res: Response) {
  res.json({
    success: true,
    data: await courseService.deleteCourse(userId(req), req.params.courseId),
  });
}
