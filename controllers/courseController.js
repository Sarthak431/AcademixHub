import Course from "../models/Course.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import Lesson from "../models/Lesson.js";

// @desc Create a new course
// @route POST /api/v1/courses
export const createCourse = catchAsync(async (req, res, next) => {
  const { title, description, instructors, category, lessons } = req.body;

  // Map instructor IDs to objects with _id (required by schema)
  const instructorsWithId = instructors.map((instructorId) => ({
    _id: instructorId,
  }));

  // Create the course with mapped instructor objects
  const newCourse = await Course.create({
    title,
    description,
    instructors: instructorsWithId,  // Now it's an array of objects with _id.
    category,
    lessons: lessons || [],
  });

  res.status(201).json({
    success: true,
    data: newCourse,
  });
});

// @desc Update course details
// @route PATCH /api/v1/courses/:id
export const updateCourse = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "title",
    "description",
    "lessons",
    "category",
    "instructors",
  ];

  // Filter out only the allowed fields from the request body
  const updateFields = Object.keys(req.body)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

  // Find the course by ID first
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Update course fields manually
  Object.keys(updateFields).forEach((field) => {
    course[field] = updateFields[field];
  });

  // If instructors are being updated, map them to the correct structure
  if (updateFields.instructors) {
    course.instructors = updateFields.instructors.map((instructorId) => ({
      _id: instructorId,
    }));
  }

  // Save the updated course
  const updatedCourse = await course.save();

  res.status(200).json({
    success: true,
    data: updatedCourse,
  });
});

// @desc Delete a course
// @route DELETE /api/v1/courses/:id
export const deleteCourse = catchAsync(async (req, res, next) => {
  const deletedCourse = await Course.findByIdAndDelete(req.params.id);

  if (!deletedCourse) {
    return next(new AppError("Course not found", 404));
  }

  await Lesson.deleteMany({ course: req.params.id });
  await Review.deleteMany({ course: req.params.id });
  await Enrollment.deleteMany({ course: req.params.id });

  res.status(200).json({
    success: true,
    message:
      "Course, associated lessons, reviews, and enrollments deleted successfully",
  });
});

// @desc Get all courses with filtering and pagination
// @route GET /api/v1/courses
export const getCourses = catchAsync(async (req, res, next) => {
  const { category, page = 1, limit = 10 } = req.query;
  const query = category ? { category } : {};

  const courses = await Course.find(query)
    .limit(parseInt(limit))
    .skip((page - 1) * limit)
    .populate("instructors._id", "name email") // Populate instructors
    .populate("lessons", "title duration"); // Populate lessons

  // Format instructors to match desired structure
  const formattedCourses = courses.map(course => ({
    _id: course._id,
    title: course.title,
    description: course.description,
    instructors: course.instructors.map(instructor => ({
      _id: instructor._id._id, // Access the instructor's _id from the populated _id
      name: instructor.name || instructor._id.name, // Ensure name is included
      email: instructor._id.email, // Access the email from the populated _id
    })),
    category: course.category,
    lessons: course.lessons,
    rating: course.rating,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  }));

  res.status(200).json({
    success: true,
    count: formattedCourses.length,
    data: formattedCourses,
  });
});

// @desc Get a single course by ID
// @route GET /api/v1/courses/:id
export const getCourseById = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("instructors._id", "name email") // Populate instructors
    .populate("lessons", "title duration");

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Format instructors correctly
  const formattedInstructors = course.instructors.map(instructor => ({
    _id: instructor._id._id, // Access the instructor's _id from the populated _id
    name: instructor.name || instructor._id.name, // Ensure name is included
    email: instructor._id.email,
  }));

  const responseData = {
    _id: course._id,
    title: course.title,
    description: course.description,
    instructors: formattedInstructors,
    category: course.category,
    lessons: course.lessons,
    rating: course.rating,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  res.status(200).json({
    success: true,
    data: responseData,
  });
});
