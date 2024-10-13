import mongoose from "mongoose";
import User from "./User.js";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A course must have a title"],
      minlength: [5, "A course title must have at least 5 characters"],
      maxlength: [100, "A course title must have less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "A course must have a description"],
      minlength: [20, "A course description must have at least 20 characters"],
    },
    instructors: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "An instructor must have an ID"],
        },
        name: {
          type: String,
        },
      },
    ],
    category: {
      type: String,
      required: [true, "A course must have a category"],
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: [0, "Rating must be at least 0"],
      max: [5, "Rating must be at most 5"],
      set: function (value) {
        return Math.round(value * 10) / 10;
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A course must have a creator"],
    },
  },
  {
    timestamps: true,
  }
);

courseSchema.pre("save", async function (next) {
  if (this.isModified("instructors") || this.isNew) {
    this.instructors = await Promise.all(
      this.instructors.map(async (instructor) => {
        const user = await User.findById(instructor._id);
        if (!user) {
          throw new Error(`Instructor with ID ${instructor._id} not found`);
        }
        return {
          _id: user._id,
          name: user.name,
        };
      })
    );
  }
  next();
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
