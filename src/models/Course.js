import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
id: { type: String, required: true, unique: true },
title: { type: String, required: true },
description: String,
thumbnailUrl: String,
free: { type: Boolean, default: false },
paid: { type: Boolean, default: false },
lessons: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true }
}, { timestamps: true });


export default mongoose.model('Course', courseSchema);