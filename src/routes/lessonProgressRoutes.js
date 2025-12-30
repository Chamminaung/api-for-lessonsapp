// routes/lessons.js
import express from "express";
import Lesson from "../models/Lesson.js";
import LessonProgress from "../models/LessonProgress.js";

const router = express.Router();

/**
 * GET /api/lessons/:courseId?deviceId=xxx
 */
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { deviceId } = req.query;

    const lessons = await Lesson.find({ courseId }).sort({ order: 1 });
    console.log("LESSONS:", lessons); // ⭐ အရေးကြီး

    const progresses = await LessonProgress.find({
      courseId,
      deviceId,
      watched: true,
    });
    console.log("PROGRESSES:", progresses); // ⭐ အရေးကြီး

    const watchedMap = {};
    progresses.forEach(p => {
      watchedMap[p.lessonId.toString()] = true;
    });
    console.log("WATCHED MAP:", watchedMap); // ⭐ အရေးကြီး

    const result = lessons.map(l => ({
      _id: l._id,
      title: l.title,
      videoUrl: l.videoUrl,
      order: l.order,
      watched: watchedMap[l._id.toString()] || false,
    }));
    console.log("RESULT:", result); // ⭐ အရေးကြီး

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/lessons/watched
 */
router.post("/watched", async (req, res) => {
  try {
    const { deviceId, lessonId, courseId, watchedSeconds } = req.body;

    const progress = await LessonProgress.findOneAndUpdate(
      { deviceId, lessonId },
      {
        deviceId,
        lessonId,
        courseId,
        watched: true,
        watchedSeconds,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json(progress);
  } catch (err) {
    console.error("WATCHED ERROR:", err); // ⭐ အရေးကြီး
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/lessons/resume/:courseId?deviceId=xxx
 */
router.get("/resume/:courseId", async (req, res) => {
  const { deviceId } = req.query;
  const { courseId } = req.params;

  const last = await LessonProgress.findOne({
    courseId,
    deviceId,
    watched: true,
  }).sort({ updatedAt: -1 });

  res.json(last);
});


export default router;
