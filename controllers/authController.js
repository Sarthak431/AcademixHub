import User from "../models/User.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { sendWelcomeEmail, sendResetPasswordEmail } from "../utils/emailService.js";

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Forgot Password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  // Check the number of attempts
  if (user.passwordResetAttempts >= 3) {
    return next(new AppError("You have exceeded the maximum number of password reset attempts. Please try again later.", 429));
  }

  // Generate reset token using the model method
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/resetPassword?token=${resetToken}`;

  // Send email with reset token
  await sendResetPasswordEmail(email, resetUrl);

  // Increment the password reset attempts
  user.incrementPasswordResetAttempts();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Reset token sent to email!",
  });
});

// Reset Password
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  const { token } = req.query;

  // Find the user with the hashed reset token
  const user = await User.findOne({ passwordResetToken: { $exists: true } });

  // Check if the user exists and if the reset token is valid
  if (!user || !user.isResetTokenValid(token)) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  // Check password confirmation
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Update password and clear reset token fields
  user.password = password; // The password will be hashed in the pre-save hook
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Reset password reset attempts after a successful reset
  user.resetPasswordAttempts();
  await user.save(); // Save the new password

  // Send a success response
  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully!",
  });
});

// Signup
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, contact, passwordConfirm } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already in use", 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Password and passwordConfirm do not match", 400));
  }

  const user = new User({ name, email, contact, password });
  await user.save();

  const token = signToken(user._id);
  
  await sendWelcomeEmail(email, name,`${req.protocol}://${req.get('host')}`);

  res.status(201).json({
    message: "User registered successfully",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

// Login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
    user: { id: user._id, email: user.email },
  });
});
