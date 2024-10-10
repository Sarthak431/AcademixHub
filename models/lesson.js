import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["video", "quiz", "article"],
    required: true,
  },
});

const Lesson = mongoose.model("Lesson", lessonSchema);

export default Lesson;
