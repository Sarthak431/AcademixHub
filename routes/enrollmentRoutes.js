import express from "express";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import {
  enrollInCourse,
  getEnrollmentsByCourse,
  deleteEnrollment,
  getEnrollmentById,
  getEnrollmentsByStudent,
} from "../controllers/enrollmentController.js";

const router = express.Router();

router.use(protect);

router.post("/", enrollInCourse);

router.get(
  "/course/:courseId",
  restrictTo("admin", "instructor"),
  getEnrollmentsByCourse
);

router.use(restrictTo("admin"));

router.get("/student/:studentId", getEnrollmentsByStudent);
router.delete("/:id", deleteEnrollment);
router.get("/:id", getEnrollmentById);

export default router;
