import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  course_id: {
    type: Schema.Types.ObjectId,
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

const lesson = mongoose.model("lesson", lessonSchema);

export default lesson;
