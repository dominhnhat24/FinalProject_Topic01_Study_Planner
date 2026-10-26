import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }

  interface Locals {
    validated?: {
      body?: unknown;
      params?: unknown;
      query?: unknown;
    };
    userId?: string;
  }
}
