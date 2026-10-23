import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export function validate(
  schemas: { body?: ZodType; params?: ZodType; query?: ZodType }
): RequestHandler {
  return (req, _res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        // Express 5 query is getter-backed; store validated query separately.
        resQuery.set(req, parsed);
      }
      next();
    } catch (error) {
      next(new ApiError(400, "Dữ liệu đầu vào không hợp lệ", error));
    }
  };
}

const resQuery = new WeakMap<object, unknown>();
export function getValidatedQuery<T>(req: object): T {
  return resQuery.get(req) as T;
}
