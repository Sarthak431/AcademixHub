import Review from "../models/Review.js";
import Course from "../models/Course.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// @desc Create a new review
// @route POST /api/v1/courses/:courseId/reviews or /api/v1/reviews
export const createReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  // Ensure the course exists
  const filter = {
    _id: req.params.courseId ? req.params.courseId : req.body.course,
  };
  const course = await Course.findById(filter._id);
  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Create a review
  const newReview = await Review.create({
    review,
    rating,
    course: filter._id,
    user: req.user.id, // Assuming `req.user` contains the authenticated user's ID
  });

  res.status(201).json({
    success: true,
    data: newReview,
  });
});

// @desc Get all reviews for a course
// @route GET /api/v1/courses/:courseId/reviews or /api/v1/reviews
export const getReviews = catchAsync(async (req, res, next) => {
  const filter = req.params.courseId ? { course: req.params.courseId } : {};
  
  const reviews = await Review.find(filter);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc Get a review by ID
// @route GET /api/v1/courses/:courseId/reviews/:id or /api/v1/reviews/:id
export const getReviewById = catchAsync(async (req, res, next) => {
  const filter = {
    _id: req.params.id,
  };

  const review = await Review.findById(filter._id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc Update a review
// @route PATCH /api/v1/courses/:courseId/reviews/:id or /api/v1/reviews/:id
export const updateReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;
  const reviewId = req.params.id;

  // Check if the review exists
  const existingReview = await Review.findById(reviewId);
  if (!existingReview) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is allowed to update the review
  const isAdmin = req.user.role === "admin"; // Assuming `req.user.role` is set for authenticated users
  const isCreator = existingReview.user.toString() === req.user.id;

  if (!isAdmin && !isCreator) {
    return next(new AppError("You are not authorized to update this review", 403));
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { rating, review },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

// @desc Delete a review
// @route DELETE /api/v1/courses/:courseId/reviews/:id or /api/v1/reviews/:id
export const deleteReview = catchAsync(async (req, res, next) => {
  const reviewId = req.params.id;

  // Check if the review exists
  const existingReview = await Review.findById(reviewId);
  if (!existingReview) {
    return next(new AppError("Review not found", 404));
  }

  // Check if the user is allowed to delete the review
  const isAdmin = req.user.role === "admin";
  const isCreator = existingReview.user.toString() === req.user.id;

  if (!isAdmin && !isCreator) {
    return next(new AppError("You are not authorized to delete this review", 403));
  }

  await Review.findByIdAndDelete(reviewId);

  res.status(204).json({
    success: true,
    data: null,
  });
});
