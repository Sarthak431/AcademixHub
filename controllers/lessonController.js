import Lesson from "../models/Lesson.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";

// Helper function to check if the user is an instructor
const isInstructor = (course, userId) => {
  return course.instructors.some(instructor => instructor._id.toString() === userId.toString());
};

// Helper function to check if the user is the course creator
const isCourseCreator = (course, userId) => {
  return course.createdBy.toString() === userId.toString();
};

// Helper function to check if the user is an admin
const isAdmin = (user) => {
  return user.role === "admin"; // Assuming user role is stored in the user object
};

// @desc Create a new lesson
// @route POST /api/v1/lessons
export const createLesson = catchAsync(async (req, res, next) => {
  const { title, content, duration, course } = req.body;

  const Course = await Course.findById(course);
  if (!Course) {
    return next(new AppError("Course not found", 404));
  }

  // Check if the user is an admin, instructor, or course creator
  if (!isAdmin(req.user) && !isInstructor(Course, req.user.id) && !isCourseCreator(Course, req.user.id)) {
    return next(new AppError("You are not authorized to create lessons for this course", 403));
  }

  const newLesson = await Lesson.create({
    title,
    content,
    duration,
    course
  });

  // Update the course with the new lesson
  await Course.findByIdAndUpdate(
    course,
    { $addToSet: { lessons: newLesson._id } },
    { new: true, runValidators: true }
  );

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
    select: "title instructor",
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

  const lesson = await Lesson.findById(req.params.id).populate("course");
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Check if the user is an admin, instructor, or course creator
  if (!isAdmin(req.user) && !isInstructor(lesson.course, req.user.id) && !isCourseCreator(lesson.course, req.user.id)) {
    return next(new AppError("You are not authorized to update this lesson", 403));
  }

  const updatedLesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { title, content, duration },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedLesson,
  });
});

// @desc Delete a lesson
// @route DELETE /api/v1/lessons/:id
export const deleteLesson = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate("course");

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Check if the user is an admin, instructor, or course creator
  if (!isAdmin(req.user) && !isInstructor(lesson.course, req.user.id) && !isCourseCreator(lesson.course, req.user.id)) {
    return next(new AppError("You are not authorized to delete this lesson", 403));
  }

  await Lesson.findByIdAndDelete(req.params.id);

  await Course.findByIdAndUpdate(
    lesson.course,
    { $pull: { lessons: lesson._id } },
    { new: true, runValidators: true }
  );

  res.status(204).json({
    success: true,
    data: null,
  });
});

// @desc Mark a lesson as completed
// @route PATCH /api/v1/lessons/:id/complete
export const completeLesson = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  const courseId = lesson.course;

  const enrollment = await Enrollment.findOne({
    student: req.user.id,
    course: courseId,
  });

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  if (enrollment.completed_lessons.includes(req.params.id)) {
    return next(new AppError("Lesson already marked as completed", 400));
  }

  enrollment.completed_lessons.push(req.params.id);
  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});
