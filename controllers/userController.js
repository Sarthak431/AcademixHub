import catchAsync from "../utils/catchAsync.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js"; // Import the Review model

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { role } = req.query;

  const query = role ? { role: { $regex: new RegExp(role, "i") } } : {};

  const users = await User.find(query).select("-__v");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

export const addUser = catchAsync(async (req, res, next) => {
  const { name, email, contact, role, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    contact,
    role,
    password,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 12);
  }

  const user = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.json({
    status: "success",
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Check if the user exists
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // If the user is a student, delete their enrollments and reviews
  if (user.role === 'student') {
    await Enrollment.deleteMany({ student: id });
    await Review.deleteMany({ user: id });
  }

  // Delete the user
  await User.findByIdAndDelete(id);

  res.json({
    status: "success",
    message: "User deleted successfully",
  });
});

export const myInfoHandler = catchAsync(async (req, res, next) => {
  const user_id = req.user._id;

  const user = await User.findById(user_id).select("name email");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const enrollments = await Enrollment.find({ student: user_id })
    .populate({
      path: "course",
      select: "title description instructors",
    })
    .populate({
      path: "completed_lessons",
      select: "title",
    });

  res.json({
    success: true,
    data: {
      user: {
        name: user.name,
        email: user.email,
      },
      enrollments,
    },
  });
});

export const userInfoHandler = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const enrollments = await Enrollment.find({ student: id })
    .populate({
      path: "course",
      select: "title description instructors",
    })
    .populate({
      path: "completed_lessons",
      select: "title",
    });

  res.json({
    success: true,
    data: {
      user,
      enrollments,
    },
  });
});
