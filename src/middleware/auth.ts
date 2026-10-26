import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next(new ApiError(401, "Bạn cần đăng nhập"));
    return;
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    next(new ApiError(401, "Token không hợp lệ hoặc đã hết hạn"));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new ApiError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};
