import { Router } from "express";
import * as controller from "../controllers/course.controller";
import { requireAuth } from "../middleware/auth";
import { exposeCurrentUser } from "../middleware/currentUser";
import { validate } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { createCourseSchema, updateCourseSchema } from "../validators/course.validator";
import { objectIdSchema } from "../validators/common.validator";
import { z } from "zod";

const router = Router();
const paramsSchema = z.object({ courseId: objectIdSchema });
router.use(requireAuth, exposeCurrentUser);
router.get("/", asyncHandler(controller.list));
router.post("/", validate({ body: createCourseSchema }), asyncHandler(controller.create));
router.get("/:courseId", validate({ params: paramsSchema }), asyncHandler(controller.get));
router.patch("/:courseId", validate({ params: paramsSchema, body: updateCourseSchema }), asyncHandler(controller.update));
router.delete("/:courseId", validate({ params: paramsSchema }), asyncHandler(controller.remove));
export default router;
