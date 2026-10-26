import { Router } from "express";
import * as controller from "../controllers/course.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateBody, validateParams } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { courseIdParamsSchema } from "../validators/common.validator.js";
import { createCourseSchema, updateCourseSchema } from "../validators/course.validator.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(controller.list));
router.post("/", validateBody(createCourseSchema), asyncHandler(controller.create));
router.get("/:courseId", validateParams(courseIdParamsSchema), asyncHandler(controller.get));
router.patch(
  "/:courseId",
  validate({ params: courseIdParamsSchema, body: updateCourseSchema }),
  asyncHandler(controller.update),
);
router.delete("/:courseId", validateParams(courseIdParamsSchema), asyncHandler(controller.remove));

export default router;
