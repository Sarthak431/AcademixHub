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

router.use(protect);

router.post("/", restrictTo("admin"),createCourse);

router.patch("/:id", restrictTo("admin"),updateCourse);

router.delete("/:id",restrictTo("admin"), deleteCourse);

export default router;
