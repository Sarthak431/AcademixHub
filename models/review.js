import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
  },
  review_text: {
    type: String,
  }
});

const review = mongoose.model("review", reviewSchema);

export default review;
