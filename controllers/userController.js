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

export const updateMe = catchAsync(async (req, res, next) => {
  const { name, email, contact } = req.body;

  // Ensure no password is being updated here
  if (req.body.password) {
    return next(new AppError('This route is not for updating password. Please use /update-password', 400));
  }

  // Update the current user (exclude sensitive fields like password)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, contact },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedUser) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Update the current user's password
export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, passwordConfirm } = req.body;

  // 1. Get the user from the database
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2. Check if the posted current password is correct
  const isCorrectPassword = await user.correctPassword(currentPassword, user.password);
  if (!isCorrectPassword) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3. Check if new password and passwordConfirm match
  if (newPassword !== passwordConfirm) {
    return next(new AppError('New password and confirm password do not match', 400));
  }

  // 4. If so, update the password
  user.password = newPassword;
  await user.save(); // use save(), not findByIdAndUpdate, to trigger pre-save middleware

  res.status(200).json({
    status: 'success',
    message: 'Password updated successfully',
  });
});
