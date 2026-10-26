import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";

export const exposeCurrentUser: RequestHandler = (req, res, next) => {
  if (!req.userId) {
    next(new ApiError(401, "Bạn cần đăng nhập"));
    return;
  }

  res.locals.userId = req.userId;
  next();
};
