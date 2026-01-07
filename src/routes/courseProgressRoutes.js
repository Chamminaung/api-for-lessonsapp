import CourseProgress from "../models/CourseProgress.js";
import express from "express";

const router = express.Router();

// GET course progress by deviceId and courseId
router.get("/", async (req, res) => {
  try {
    const { deviceId, courseId } = req.query;

    const progress = await CourseProgress.findOne({ deviceId, courseId });

    res.json({
      progress: {
        completedLessons: progress?.completedLessons || [],
        totalLessons: 20,
      },
      lastLesson: progress?.lastLesson || null,
      status: { status: progress?.status || "not_started" },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST or UPDATE course progress

router.post("/", async (req, res) => {
  try {
    const {
      deviceId,
      courseId,
      completedLessons = [],
      lastLesson,
      status
    } = req.body;

    // 🔥 ALWAYS make it an array
    if (!Array.isArray(completedLessons)) {
      completedLessons = completedLessons ? [completedLessons] : [];
    }

    const progress = await CourseProgress.findOneAndUpdate(
      { deviceId, courseId },
      {
        $addToSet: {
          completedLessons: { $each: completedLessons }
        },
        $set: {
          lastLesson,
          status
        }
      },
      {
        new: true,
        upsert: true // 🔥 မရှိရင် create လုပ်ပေးမယ်
      }
    );

    res.json({
      message: "Progress updated successfully",
      progress
    });
  } catch (error) {
    console.error("COURSE PROGRESS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});



// router.post("/", async (req, res) => {
//   try {
//     const { deviceId, courseId, completedLessons, lastLesson, status } = req.body;
//     let progress = await CourseProgress.findOne({ deviceId, courseId });

//     if (progress) {
//       progress.completedLessons = [...progress.completedLessons, ...completedLessons];
//       progress.lastLesson = lastLesson;
//       progress.status = status;
//       await progress.save();
//     } else {
//       progress = await CourseProgress.create({
//         deviceId,
//         courseId,
//         completedLessons: progress ? [...progress.completedLessons, ...completedLessons] : completedLessons,
//         lastLesson,
//         status
//       });
//     }

//     res.json({ message: "Progress updated successfully", progress });
//   } catch (error) {
//     console.error("COURSE PROGRESS ERROR:", error); // ⭐ အရေးကြီး
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;


// export const getCourseProgress = async (req, res) => {
//   const { deviceId, courseId } = req.query;

//   const progress = await CourseProgress.findOne({ deviceId, courseId });

//   res.json({
//     progress: {
//       completedLessons: progress?.completedLessons || 0,
//       totalLessons: 20,
//     },
//     lastLesson: progress?.lastLesson || null,
//     status: { status: progress?.status || "not_started" },
//   });
// };

