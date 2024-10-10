import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0%"],
      max: [100, "Progress cannot be more than 100%"],
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
