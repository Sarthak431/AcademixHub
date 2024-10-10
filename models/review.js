import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
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

const Review = mongoose.model("Review", reviewSchema);

export default Review;
