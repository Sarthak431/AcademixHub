import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  enrollInCourse,
  getEnrollmentsByCourse,
  getStudentEnrollment,
  updateEnrollmentProgress,
  deleteEnrollment,
  getEnrollmentById,
  getEnrollmentsByStudent
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.post("/", protect, enrollInCourse);

router.get(
  "/course/:courseId",
  protect,
  restrictTo("admin", "instructor"),
  getEnrollmentsByCourse
);
router.get('/student/:studentId', protect, getEnrollmentsByStudent); 

router.get(
  "/student/:studentId/course/:courseId",
  protect,
  getStudentEnrollment
);

router.patch("/:id/progress", protect, updateEnrollmentProgress);

router.delete("/:id", protect, restrictTo("admin"), deleteEnrollment);
router.get("/:id", protect, restrictTo("admin"), getEnrollmentById);

export default router;
