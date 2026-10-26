import { Router } from "express";
import * as controller from "../controllers/assignment.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate, validateBody, validateParams, validateQuery } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { assignmentIdParamsSchema } from "../validators/common.validator.js";
import {
  assignmentQuerySchema,
  createAssignmentSchema,
  updateAssignmentSchema,
} from "../validators/assignment.validator.js";

const router = Router();

router.use(requireAuth);
router.get("/progress", asyncHandler(controller.progress));
router.get("/", validateQuery(assignmentQuerySchema), asyncHandler(controller.list));
router.post("/", validateBody(createAssignmentSchema), asyncHandler(controller.create));
router.get(
  "/:assignmentId",
  validateParams(assignmentIdParamsSchema),
  asyncHandler(controller.get),
);
router.patch(
  "/:assignmentId",
  validate({ params: assignmentIdParamsSchema, body: updateAssignmentSchema }),
  asyncHandler(controller.update),
);
router.delete(
  "/:assignmentId",
  validateParams(assignmentIdParamsSchema),
  asyncHandler(controller.remove),
);

export default router;
