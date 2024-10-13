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

router.get("/:id", getLessonById);

router.patch("/:id/complete", restrictTo("student"), completeLesson);

router.use(restrictTo("admin", "instructor"));

router.post("/", createLesson);

router.patch("/:id", updateLesson);

router.delete("/:id", deleteLesson);

export default router;
