import course from "../models/course.js";
import AppError from '../utils/AppError.js';
import catchAsync from "../utils/catchAsync.js";

// @desc Create a new course
// @route POST /api/v1/courses
export const createCourse = catchAsync(async (req, res, next) => {
  const { title, description, instructor, category } = req.body;

  const newCourse = await course.create({
    title,
    description,
    instructor,
    category,
  });

  res.status(201).json({
    success: true,
    data: newCourse,
  });
});

// @desc Update course details
// @route PATCH /api/v1/courses/:id
export const updateCourse = catchAsync(async (req, res, next) => {
  const allowedFields = ["title", "description", "rating", "lessons", "category", "instruction"];

  const updateFields = Object.keys(req.body)
    .filter(key => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  const updatedCourse = await course.findByIdAndUpdate(
    req.params.id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    return next(new AppError("Course not found", 404));
  }
  res.status(200).json({
    success: true,
    data: updatedCourse,
  });
});

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
export const deleteCourse = catchAsync(async (req, res, next) => {
  const deletedCourse = await course.findByIdAndDelete(req.params.id);c
  if (!deletedCourse) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

// @desc Get all courses with filtering and pagination
// @route GET /api/v1/courses
export const getCourses = catchAsync(async (req, res, next) => {
  const { category, page = 1, limit = 10 } = req.query;
  const query = category ? { category } : {};

  const courses = await course.find(query)
    .limit(parseInt(limit))
    .skip((page - 1) * limit);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// @desc Get a single course by ID
// @route GET /api/v1/courses/:id
export const getCourseById = catchAsync(async (req, res, next) => {
  const Course = await course.findById(req.params.id);//.populate("instructor lessons")

  if (!Course) {
    return next(new AppError("Course not found", 404));
  }

  res.status(200).json({
    success: true,
    data: Course,
  });
});
