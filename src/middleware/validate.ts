import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

export interface ValidationSchemas {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, res, next) => {
    try {
      const validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,
        params: schemas.params ? schemas.params.parse(req.params) : undefined,
        query: schemas.query ? schemas.query.parse(req.query) : undefined,
      };

      if (schemas.body) req.body = validated.body;
      if (schemas.params) req.params = validated.params as typeof req.params;
      res.locals.validated = validated;

      next();
    } catch (error) {
      next(new ApiError(400, "Dữ liệu đầu vào không hợp lệ", error));
    }
  };
}

export function validateBody(schema: ZodType): RequestHandler {
  return validate({ body: schema });
}

export function validateParams(schema: ZodType): RequestHandler {
  return validate({ params: schema });
}

export function validateQuery(schema: ZodType): RequestHandler {
  return validate({ query: schema });
}
