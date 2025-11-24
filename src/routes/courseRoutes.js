import express from "express";
import Course from "../models/Course.js";


const router = express.Router();


// GET /api/courses
router.get('/', async (req, res) => {
const courses = await Course.find().sort({ createdAt: -1 });
res.json(courses);
});


// GET /api/courses/:id
router.get('/:id', async (req, res) => {
const course = await Course.findOne({ id: req.params.id });
if (!course) return res.status(404).json({ error: 'Course not found' });
res.json(course);
});


// POST /api/courses (simple admin endpoint, no auth for now)
router.post('/', async (req, res) => {
const { title, description, thumbnailUrl, free, paid, lessons } = req.body;
const course = await Course.create({ title, description, thumbnailUrl, free, paid, lessons });
res.json(course);
});


export default router;