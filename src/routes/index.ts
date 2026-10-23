import { Router } from "express";
import authRoutes from "./auth.routes";
import courseRoutes from "./course.routes";
import assignmentRoutes from "./assignment.routes";

const router = Router();
router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/assignments", assignmentRoutes);
export default router;
