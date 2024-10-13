import express from "express";
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewById
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router.post("/", restrictTo("student"), createReview);

router.get("/", getReviews);

router.get("/:id", getReviewById);

router.use(restrictTo("admin","student"));

router
  .route("/:id")
  .patch( updateReview)
  .delete(deleteReview);

export default router;
