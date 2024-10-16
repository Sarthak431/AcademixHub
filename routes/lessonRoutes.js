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
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.use(protect);

router.get("/course/:courseId", getLessonsByCourse);

router.get("/:id", getLessonById);

router.patch("/:id/complete", restrictTo("student"), completeLesson);

router.use(restrictTo("admin", "instructor"));

router.post("/", upload.single("video"), createLesson);

router.patch('/:id', upload.single("video"), updateLesson); 

router.delete("/:id", deleteLesson);

export default router;
