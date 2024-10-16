<<<<<<< HEAD
import mongoose from "mongoose";
=======
import mongoose from 'mongoose';
>>>>>>> c9a0c724aff241a01a61cae071ef17014cd335ea

<<<<<<< HEAD
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A lesson must have a title"],
  },
  content: {
    type: String,
    required: [true, "A lesson must have content"],
  },
  duration: {
    type: Number,
    required: [true, "A lesson must have a duration"],
    min: [1, "Duration must be at least 1 minute"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: [true, "A lesson must belong to a course"],
  }
}, {
  timestamps: true 
});

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;

=======
const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A lesson must have a title"],
  },
  content: {
    type: String,
    required: [true, "A lesson must have content"],
  },
  duration: {
    type: Number,
    required: [true, "A lesson must have a duration"],
    min: [1, "Duration must be at least 1 minute"],
  },
  videoUrl: {
    type: String, // URL to the video stored in Cloudinary
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, "A lesson must belong to a course"],
  }
}, {
  timestamps: true 
});

const Lesson = mongoose.model('Lesson', lessonSchema);

export default Lesson;

>>>>>>> c9a0c724aff241a01a61cae071ef17014cd335ea