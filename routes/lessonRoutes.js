import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
  completeLesson,
} from "../controllers/lessonController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/course/:courseId", getLessonsByCourse);
router.patch("/:id/complete", completeLesson);
router.get("/:id", getLessonById);

router.use(restrictTo("admin", "instructor"));
router.post("/", createLesson);

router.patch("/:id", updateLesson);

router.delete("/:id", deleteLesson);

export default router;
