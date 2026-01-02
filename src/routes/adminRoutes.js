import User from "../models/User.js"
import Course from "../models/Course.js"
import Lesson from "../models/Lesson.js"
import Payment from "../models/Payment.js"
import LessonProgress from "../models/LessonProgress.js"
import UserDevice from "../models/UserDevice.js"
import CourseProgress from "../models/CourseProgress.js"
import express from "express"

const router = express.Router()

export const getAdminStats = async (req, res) => {
  try {
    /* ---------------- COUNTS ---------------- */
    const [users, courses, lessons] = await Promise.all([
      UserDevice.countDocuments(),
      Course.countDocuments(),
        Lesson.countDocuments(),
    ])
    //   async () => {
    //     const result = await Lesson.aggregate([
    //           {
    //               $project: {
    //                   lessonCount: { $size: "$lessons" }
    //               }
    //           },
    //           {
    //               $group: {
    //                   _id: null,
    //                   totalLessons: { $sum: "$lessonCount" }
    //               }
    //           }
    //       ])
    //       return result[0]?.totalLessons || 0
    //   },
    // ])

    /* ---------------- TOTAL REVENUE ---------------- */
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "Approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const revenue = revenueAgg[0]?.total || 0


    /* ---------------- MONTHLY REVENUE ---------------- */
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ])

    /* ---------------- ACTIVE USERS (30 days) ---------------- */
    const last30 = new Date()
    last30.setDate(last30.getDate() - 30)

    const activeUsers = await LessonProgress.distinct("deviceId", {
      updatedAt: { $gte: last30 },
    })

    /* ---------------- TOP COURSES ---------------- */
    const topCourses = await Payment.aggregate([
      { $match: { status: "Approved" } },
      {
        $group: {
          _id: "$courseId",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
    ])

    res.json({
      users,
      courses,
      lessons,
      revenue,
      monthlyRevenue,
      activeUsers: activeUsers.length,
      topCourses,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Admin stats error" })
  }
}

router.get("/stats", getAdminStats)

export default router