import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A course must have a title'],
    minlength: [5, 'A course title must have at least 5 characters'],
    maxlength: [100, 'A course title must have less than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'A course must have a description'],
    minlength: [20, 'A course description must have at least 20 characters'],
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'A course must have an instructor'],
  },
  category: {
    type: String,
    required: [true, 'A course must have a category'],
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
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating must be at most 5'],
    set: function(value) {
      return Math.round(value * 10) / 10; 
    },
  },
}, {
  timestamps: true 
});

const Course = mongoose.model("Course", courseSchema);

export default Course;
