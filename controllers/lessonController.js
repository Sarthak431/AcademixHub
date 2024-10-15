import Lesson from "../models/Lesson.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { generateSignedUrl } from './../config/cloudinary.js';
import cloudinary from "./../config/cloudinary.js"; 

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

// Create a new lesson
export const createLesson = catchAsync(async (req, res, next) => {
  const { title, content, duration, course } = req.body;

  const foundCourse = await Course.findById(course);
  if (!foundCourse) {
    return next(new AppError("Course not found", 404));
  }

  // Check if the user is authorized (Admin, Instructor, or Course Creator)
  if (!isAdmin(req.user) && !isInstructor(foundCourse, req.user.id) && !isCourseCreator(foundCourse, req.user.id)) {
    return next(new AppError("You are not authorized to create lessons for this course", 403));
  }

  // Ensure the video is uploaded by multer middleware
  if (!req.file) {
    return next(new AppError("Please upload a video file", 400));
  }

  // Extract the video URL from the multer object
  const videoUrl = req.file.path;

  // Create the new lesson with the video URL
  const newLesson = await Lesson.create({
    title,
    content,
    duration,
    videoUrl,
    course,
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

// @desc Get a single lesson by ID
// @route GET /api/v1/lessons/:id
export const getLessonById = catchAsync(async (req, res, next) => {
  const lesson = await Lesson.findById(req.params.id).populate({
    path: 'course',
    select: 'title instructor',
  });

  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Check if the user is enrolled in the course
  const enrollment = await Enrollment.findOne({
    student: req.user.id,
    course: lesson.course._id,
  });

  if (!enrollment) {
    return next(new AppError("You are not enrolled in this course", 403));
  }

  // Extract the public ID from the video URL using the same logic as in updateLesson
  const oldVideoUrl = lesson.videoUrl;

  // Use regex to extract the public ID
  const publicIdMatch = oldVideoUrl.match(/upload\/v\d+\/(.*)\.mp4$/);
  
  if (!publicIdMatch) {
    return next(new AppError("Invalid video URL", 400));
  }

  const publicId = publicIdMatch[1]; // Extracts the public ID without extension
  console.log(`Extracted Public ID for signed URL: ${publicId}`); // Log public ID for debugging

  // Generate a signed URL for the video
  const signedVideoUrl = generateSignedUrl(publicId, 3600); // Expires in 1 hour

  // Send the lesson data, including the signed video URL
  res.status(200).json({
    success: true,
    data: {
      ...lesson.toObject(),
      videoUrl: signedVideoUrl, // Use the signed URL
    },
  });
});


// @desc Get all lessons for a specific course
// @route GET /api/v1/lessons/course/:courseId
export const getLessonsByCourse = catchAsync(async (req, res, next) => {
  const lessons = await Lesson.find({ course: req.params.courseId }).select("-videoUrl");

  res.status(200).json({
    success: true,
    count: lessons.length,
    data: lessons,
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

  // If a new video is uploaded
  if (req.file) {
    // Extract the public ID from the old video URL
    const oldVideoUrl = lesson.videoUrl;

    // Use regex to extract the public ID
    const publicIdMatch = oldVideoUrl.match(/upload\/v\d+\/(.*)\.mp4$/);
    if (!publicIdMatch) {
      return next(new AppError("Invalid video URL format", 400));
    }

    const publicId = publicIdMatch[1]; // Extracts the public ID without extension
    console.log(`Extracted Public ID for deletion: ${publicId}`);

    // Delete the old video from Cloudinary
    const deleteResponse = await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    console.log('Delete response from Cloudinary:', deleteResponse); // Log the response for debugging

    // Extract the new video URL from the multer object
    const videoUrl = req.file.path;

    // Update the lesson's video URL
    lesson.videoUrl = videoUrl; // Update the lesson's videoUrl field
  }

  // Update the rest of the lesson information
  const updatedLesson = await Lesson.findByIdAndUpdate(
    req.params.id,
    { title, content, duration, videoUrl: lesson.videoUrl }, // Include the updated video URL
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

  // Extract the public ID from the video URL
  const publicId = lesson.videoUrl
    .match(/upload\/v\d+\/(.*)\.mp4$/)[1]; // Extracts the public ID without extension

  console.log('Deleting video with public ID:', publicId); // Log public ID

  // Delete the video from Cloudinary
  const deleteResponse = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'video',
  });

  // Check if the deletion was successful
  if (deleteResponse.result !== 'ok') {
    return next(new AppError("Error deleting video from Cloudinary", 500));
  }

  // Delete the lesson from the database
  await Lesson.findByIdAndDelete(req.params.id);

  // Remove the lesson reference from the course
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
