import express from 'express';
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from '../controllers/courseController.js';
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to create a new course (POST)
router.post("/", protect, restrictTo("admin"), createCourse);

// Route to update a course (PATCH)
router.patch("/:id",  protect, restrictTo("admin"), updateCourse);

// Route to delete a course (DELETE)
router.delete("/:id",  protect, restrictTo("admin"), deleteCourse);

// Route to get all courses with filtering and pagination (GET)
router.get("/", getCourses);

// Route to get a single course by ID (GET)
router.get("/:id", getCourseById);

export default router;
