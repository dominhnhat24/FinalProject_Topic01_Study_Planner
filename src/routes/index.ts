import { Router } from "express";
import assignmentRoutes from "./assignment.routes.js";
import authRoutes from "./auth.routes.js";
import courseRoutes from "./course.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/assignments", assignmentRoutes);

export default router;
