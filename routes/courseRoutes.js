import express from 'express';
import { createCourse, deleteCourse, getCourseById, getCourses, updateCourse } from '../controllers/courseController.js';

const router = express.Router();

// Route to create a new course (POST)
router.post("/", createCourse);

// Route to update a course (PATCH)
router.patch("/:id", updateCourse);

// Route to delete a course (DELETE)
router.delete("/:id", deleteCourse);

// Route to get all courses with filtering and pagination (GET)
router.get("/", getCourses);

// Route to get a single course by ID (GET)
router.get("/:id", getCourseById);

export default router;
