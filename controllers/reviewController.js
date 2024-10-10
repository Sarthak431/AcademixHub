import Review from "../models/Review.js";
import Course from "../models/Course.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";

// @desc Create a new review
// @route POST /api/v1/courses/:courseId/reviews
export const createReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  // Ensure the course exists
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Create a review
  const newReview = await Review.create({
    review,
    rating,
    course: req.params.courseId,
    user: req.user.id, // Assuming `req.user` contains the authenticated user's ID
  });

  res.status(201).json({
    success: true,
    data: newReview,
  });
});

// @desc Get all reviews for a course
// @route GET /api/v1/courses/:courseId/reviews
export const getReviewsForCourse = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ course: req.params.courseId });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

// @desc Update a review
// @route PATCH /api/v1/reviews/:id
export const updateReview = catchAsync(async (req, res, next) => {
  const { rating, review } = req.body;

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    { rating, review },
    { new: true, runValidators: true }
  );

  if (!updatedReview) {
    return next(new AppError("Review not found", 404));
  }

  res.status(200).json({
    success: true,
    data: updatedReview,
  });
});

// @desc Delete a review
// @route DELETE /api/v1/reviews/:id
export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError("Review not found", 404));
  }

  res.status(204).json({
    success: true,
    data: null,
  });
});
