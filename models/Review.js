import mongoose from "mongoose";
import Course from "./Course.js";

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
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ user: 1, course: 1 }, { unique: true });

const calculateAverageRating = async function (courseId) {
  const reviews = await mongoose.model("Review").find({ course: courseId });
  const totalReviews = reviews.length;

  if (totalReviews > 0) {
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    await Course.findByIdAndUpdate(courseId, {
      rating: Math.round(averageRating * 10) / 10,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { rating: 0 });
  }
};

reviewSchema.post("save", async function (doc) {
  await calculateAverageRating(doc.course);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await calculateAverageRating(doc.course);
  }
});

reviewSchema.pre("findOneAndDelete", async function (next) {
  const review = await this.model.findOne(this.getQuery());

  if (review) {
    const course = await Course.findById(review.course);
      const result = await Review.aggregate([
        { $match: { course: course._id, _id: { $ne: review._id } } },
        { $group: { _id: "$course", averageRating: { $avg: "$rating" } } },
      ]);

      course.rating = result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0;

      await course.save();
    }
  
  next();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;

