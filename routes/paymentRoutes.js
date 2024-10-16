// routes/paymentRoutes.js
import express from 'express';
import { createCheckoutSession, enrollCourse } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js'; // Assuming you have a middleware for authentication

const router = express.Router();

router.use(protect);

// Route to create a checkout session
router.post('/checkout/:courseId', createCheckoutSession);

// Route to enroll in a course
router.post('/enroll/:courseId', restrictTo("student"), enrollCourse);

export default router;
