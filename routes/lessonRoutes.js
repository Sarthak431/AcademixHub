import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", restrictTo("admin", "instructor"), createLesson);

router.get("/course/:courseId", getLessonsByCourse);

router.get("/:id", getLessonById);

router.use(restrictTo("admin", "instructor"));

router.patch("/:id", updateLesson);

router.delete("/:id", deleteLesson);

export default router;
