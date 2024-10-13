import mongoose from "mongoose";
import Course from "./Course.js";

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
    enrollment_date: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be less than 0%"],
      max: [100, "Progress cannot be more than 100%"],
    },
    completed_lessons: [
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

enrollmentSchema.pre("save", async function (next) {
  const enrollment = this;

  const course = await Course.findById(enrollment.course).populate("lessons");

  if (course.lessons.length > 0) {
    enrollment.progress =
      (enrollment.completed_lessons.length / course.lessons.length) * 100;
  } else {
    enrollment.progress = 0;
  }
  next();
});

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

export default Enrollment;
