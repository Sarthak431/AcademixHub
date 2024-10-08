import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  enrolled_at: {
    type: Date,
    default: Date.now,
  },
});

const enrollment = mongoose.model("enrollment", enrollmentSchema);

export default enrollment;
