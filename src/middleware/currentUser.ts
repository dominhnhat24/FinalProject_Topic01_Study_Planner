import type { RequestHandler } from "express";

export const exposeCurrentUser: RequestHandler = (req, res, next) => {
  res.locals.userId = req.userId;
  next();
};
