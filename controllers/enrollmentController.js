import Enrollment from "../models/Enrollment.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import { sendEnrollmentEmail } from "../utils/emailService.js";

// @desc Enroll a student in a course
// @route POST /api/v1/enrollments
export const enrollInCourse = catchAsync(async (req, res, next) => {
  const { course,student } = req.body;
  
  // Check if the student is already enrolled in the course
  const existingEnrollment = await Enrollment.findOne({
    course,
    student
  });

  if (existingEnrollment) {
    return next(
      new AppError("Student is already enrolled in this course", 400)
    );
  }

  const enrollment = await Enrollment.create({
    course,
    student
  });

  const curCourse = await Course.findById(course); 
  const curUser = await User.findById(student); 

  await sendEnrollmentEmail(curUser.email, curCourse.title,curCourse.id, curUser.name);
  
  res.status(201).json({
    success: true,
    data: enrollment,
  });
});

// @desc Get enrollment by ID
// @route GET /api/v1/enrollments/:id
export const getEnrollmentById = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate("student", "name email")
    .populate("course", "title description");

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

// @desc Get all enrollments by student ID
// @route GET /api/v1/enrollments/student/:studentId
export const getEnrollmentsByStudent = catchAsync(async (req, res, next) => {
  const enrollments = await Enrollment.find({ student: req.params.studentId })
    .populate("course", "title description")
    .populate("student", "name email");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// @desc Get all enrollments for a course
// @route GET /api/v1/enrollments/course/:courseId
export const getEnrollmentsByCourse = catchAsync(async (req, res, next) => {
  const enrollments = await Enrollment.find({ course: req.params.courseId })
    .populate("course", "title description")
    .populate("student", "name email");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// @desc Delete an enrollment
// @route DELETE /api/v1/enrollments/:id
export const deleteEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Enrollment deleted successfully",
  });
});
