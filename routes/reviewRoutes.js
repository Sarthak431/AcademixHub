import express from "express";
import {
  createReview,
  getReviewsForCourse,
  updateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/", restrictTo("student"), createReview);

router.get("/", getReviewsForCourse);

router.use(restrictTo("admin","student"));

router
  .route("/:id")
  .patch( updateReview)
  .delete(deleteReview);

export default router;
