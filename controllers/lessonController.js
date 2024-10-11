import Lesson from "../models/Lesson.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js"; // Import Enrollment model

// @desc Create a new lesson
// @route POST /api/v1/lessons
export const createLesson = catchAsync(async (req, res, next) => {
  const { title, content, duration, course: courseId } = req.body;

  const newLesson = await Lesson.create({
    title,
    content,
    duration,
    course: courseId,
  });

  const course = await Course.findByIdAndUpdate(
    courseId,
    { $addToSet: { lessons: newLesson._id } },
    { new: true, runValidators: true }
  );

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

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
  const lesson = await Lesson.findById(req.params.id).populate({
    path: "course",
    select: "title instructor",  // Specify the fields you want to select
  });
  
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

  const course = await Course.findByIdAndUpdate(
    lesson.course,
    { $pull: { lessons: lesson._id } },
    { new: true, runValidators: true }
  );

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(204).json({
    success: true,
    data: null,
  });
});


// @desc Mark a lesson as completed
// @route PATCH /api/v1/lessons/:id/complete
export const completeLesson = catchAsync(async (req, res, next) => {
  const lessonId = req.params.id; // Get lesson ID from the route parameters

  // Find the lesson by ID
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Get the course ID from the lesson
  const courseId = lesson.course; // Get course ID directly from the lesson

  // Find the enrollment for the student in the specified course
  const enrollment = await Enrollment.findOne({
    student: req.user.id,
    course: courseId,
  });

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  // Check if the lesson is already marked as completed
  if (enrollment.completed_lessons.includes(lessonId)) {
    return next(new AppError("Lesson already marked as completed", 400));
  }

  // Add the lesson to the completed lessons array
  enrollment.completed_lessons.push(lessonId);
  
  // Save the enrollment document
  await enrollment.save();

  // Respond with the updated enrollment data
  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

