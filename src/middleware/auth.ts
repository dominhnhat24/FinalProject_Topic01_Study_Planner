import type { RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Bạn cần đăng nhập"));
  }

  try {
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) throw new Error("Missing token");
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch {
    next(new ApiError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};
