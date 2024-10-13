import express from "express";
import {
  createCourse,
  deleteCourse,
  getCourseById,
  getCourses,
  updateCourse,
} from "../controllers/courseController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import reviewRouter from "./reviewRoutes.js";

const router = express.Router();

router.use("/:courseId/reviews", reviewRouter);

router.get("/", getCourses);

router.get("/:id", getCourseById);

router.use(protect, restrictTo("admin", "instructor"));

router.post("/", createCourse);

router.patch("/:id", updateCourse);

router.delete("/:id", deleteCourse);

export default router;
