import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      required: [true, "A rating is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Review must belong to a course"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    }
  },
  {
    timestamps: true,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ course: 1, user: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
