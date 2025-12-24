// models/LessonProgress.js
import mongoose from "mongoose";

const lessonProgressSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lesson",
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  watched: {
    type: Boolean,
    default: false,
  },
  watchedSeconds: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

lessonProgressSchema.index({ deviceId: 1, lessonId: 1 }, { unique: true });

export default mongoose.model("LessonProgress", lessonProgressSchema);
