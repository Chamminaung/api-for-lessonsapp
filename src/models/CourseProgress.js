// models/Progress.js
import mongoose from "mongoose";

const CourseProgressSchema = new mongoose.Schema({
  deviceId: String,
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  },
  completedLessons: String,
  lastLesson: {
    lessonId: String,
    title: String,
  },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
  },
});

export default mongoose.model("CourseProgress", CourseProgressSchema);