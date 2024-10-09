import mongoose from "mongoose";

const { Schema } = mongoose;

const courseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
  },
  description: {
    type: String,
    required: [true, 'A course must have a description'],
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'A course must have an instructor'],
  },
  category: {
    type: String,
    required: [true, 'A course must have a category'],
  },
  lessons: [
    {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must be at most 5'],
  },
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
