import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`));
};

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "body",
    message: issue.message,
  }));
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu đầu vào không hợp lệ",
      details: formatZodError(error),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      details: Object.values(error.errors).map((item) => ({
        field: item.path,
        message: item.message,
      })),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: "ID hoặc dữ liệu không hợp lệ",
    });
    return;
  }

  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    res.status(409).json({
      success: false,
      message: "Dữ liệu đã tồn tại",
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.details && env.NODE_ENV !== "production" ? { details: error.details } : {}),
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: "Lỗi máy chủ nội bộ",
    ...(env.NODE_ENV !== "production" && error instanceof Error ? { details: error.message } : {}),
  });
};
