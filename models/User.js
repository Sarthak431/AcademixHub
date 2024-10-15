import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto"; // Import crypto for token generation

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name must be less than 50 characters"],
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Please provide a valid email address"],
  },
  contact: {
    type: String,
    required: [true, "Contact number is required"],
    match: [/^\d{10}$/, "Contact number must be a valid 10-digit number"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "student", "instructor"],
    default: "student",
    required: [true, "Role is required"],
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordResetAttempts: {
    type: Number,
    default: 0, // Initialize to 0 to track the number of attempts
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
}, {
  timestamps: true,
});

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to generate a password reset token
userSchema.methods.createPasswordResetToken = function () {
  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and set the values to the user's fields
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken; // Return the un-hashed token for sending in the email
};

// Method to check if the reset token is valid
userSchema.methods.isResetTokenValid = function (candidateToken) {
  const hashedToken = crypto.createHash("sha256").update(candidateToken).digest("hex");
  return this.passwordResetToken === hashedToken && this.passwordResetExpires > Date.now();
};

// Method to check the password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Reset the password reset attempts after a successful reset
userSchema.methods.resetPasswordAttempts = function () {
  this.passwordResetAttempts = 0;
};

// Increment password reset attempts
userSchema.methods.incrementPasswordResetAttempts = function () {
  this.passwordResetAttempts += 1;
};

const User = mongoose.model("User", userSchema);

export default User;
