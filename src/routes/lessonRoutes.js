import express from "express";
import Lesson from "../models/Lesson.js"; // your updated model

const router = express.Router();

// GET all courses with lessons
router.get("/", async (req, res) => {
  try {
    const courses = await Lesson.find().populate("courseId");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET lessons of a specific course by courseId
router.get("/:courseId", async (req, res) => {
  try {
    const courseLessons = await Lesson.findOne({ courseId: req.params.courseId });
    if (!courseLessons) return res.status(404).json({ message: "Course not found" });
    res.json(courseLessons.lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//get lesson with course id and lesson id
router.get("/:courseId/:lessonId", async (req, res) => {
  try {
    const courseLessons = await Lesson.findOne({ courseId: req.params.courseId });
    if (!courseLessons) return res.status(404).json({ message: "Course not found" });
    const lesson = courseLessons.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADD a new lesson to a course
router.post("/:courseId", async (req, res) => {
  const { id, title, videoUrl } = req.body;

  try {
    let courseLessons = await Lesson.findOne({ courseId: req.params.courseId });

    if (!courseLessons) {
      // If courseLessons document doesn't exist yet, create it
      courseLessons = new Lesson({
        courseId: req.params.courseId,
        lessons: [{ id, title, videoUrl }]
      });
    } else {
      // Push new lesson into existing lessons array
      courseLessons.lessons.push({ id, title, videoUrl });
    }

    const saved = await courseLessons.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a lesson in a course
router.put("/:courseId/:lessonId", async (req, res) => {
  const { title, videoUrl } = req.body;

  try {
    const courseLessons = await Lesson.findOne({ courseId: req.params.courseId });
    if (!courseLessons) return res.status(404).json({ message: "Course not found" });

    const lesson = courseLessons.lessons.find(l => l.id === req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (title) lesson.title = title;
    if (videoUrl) lesson.videoUrl = videoUrl;

    const updated = await courseLessons.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a lesson from a course
router.delete("/:courseId/:lessonId", async (req, res) => {
  try {
    const courseLessons = await Lesson.findOne({ courseId: req.params.courseId });
    if (!courseLessons) return res.status(404).json({ message: "Course not found" });

    const lessonIndex = courseLessons.lessons.findIndex(l => l.id === req.params.lessonId);
    if (lessonIndex === -1) return res.status(404).json({ message: "Lesson not found" });

    courseLessons.lessons.splice(lessonIndex, 1);
    const updated = await courseLessons.save();
    res.json({ message: "Lesson deleted", data: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
