import User from "../models/User.js";
import jwt from "jsonwebtoken";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, contact, passwordConfirm } = req.body;

  const existinguser = await User.findOne({ email });
  if (existinguser) {
    return next(new AppError("Email already in use", 400));
  }

  if (password !== passwordConfirm) {
    return next(new AppError("Password and passwordConfirm do not match", 400));
  }

  const user = new User({ name, email, contact, password });
  await user.save();

  const token = signToken(user._id);
  
  await sendWelcomeEmail(email, name);

  res.status(201).json({
    message: "user registered successfully",
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
});

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
