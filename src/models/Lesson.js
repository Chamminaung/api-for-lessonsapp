import mongoose from "mongoose";


const lessonSchema = new mongoose.Schema({
id: { type: String, required: true },
title: { type: String, required: true },
videoUrl: { type: String, required: true },
watched: { type: Boolean, default: false }
}, { _id: false});

const lessonsSchema = new mongoose.Schema({
courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
lessons: [lessonSchema],
order: Number,
}, { timestamps: true });

export default mongoose.model('Lesson', lessonsSchema);
