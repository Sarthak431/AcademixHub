import Lesson from "../models/Lesson.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

// @desc Create a new lesson
// @route POST /api/v1/lessons
export const createLesson = catchAsync(async (req, res, next) => {
  const { title, content, duration, course } = req.body;

  const newLesson = await Lesson.create({
    title,
    content,
    duration,
    course,
  });

  res.status(201).json({
    success: true,
    data: newLesson,
  });
});

// @desc Get all lessons for a specific course
// @route GET /api/v1/lessons/course/:courseId
export const getLessonsByCourse = catchAsync(async (req, res, next) => {
  const lessons = await Lesson.find({ course: req.params.courseId });

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
  });
});

// @desc Get a single lesson by ID
// @route GET /api/v1/lessons/:id
export const getLessonById = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate("course");

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

// @desc Update a lesson
// @route PATCH /api/v1/lessons/:id
export const updateLesson = catchAsync(async (req, res, next) => {
  const { title, content, duration } = req.body;
  const updateFields = {};
  if (title) updateFields.title = title;
  if (content) updateFields.content = content;
  if (duration) updateFields.duration = duration;

  const updatedLesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedLesson) {
    return next(new AppError("Lesson not found", 404));
  }

  res.status(200).json({
    success: true,
    data: updatedLesson,
  });
});

// @desc Delete a lesson
// @route DELETE /api/v1/lessons/:id
export const deleteLesson = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  res.status(204).json({
    success: true,
    data: null,
  });
});
