import { Router } from "express";
import * as controller from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();
router.post("/register", validate({ body: registerSchema }), asyncHandler(controller.register));
router.post("/login", validate({ body: loginSchema }), asyncHandler(controller.login));
router.get("/me", requireAuth, asyncHandler(controller.me));
router.post("/logout", requireAuth, asyncHandler(controller.logout));
export default router;
