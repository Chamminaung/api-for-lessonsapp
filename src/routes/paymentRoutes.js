// ---------------------------
// src/routes/paymentRoutes.js
// ---------------------------
import express from "express";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";


const router = express.Router();


// POST /api/payments/pay
router.post('/pay', async (req, res) => {
try {
const { phone, deviceId, courseId, transactionId, transactionDateTime } = req.body;


if (!phone || !deviceId || !courseId || !transactionId) {
return res.status(400).json({ error: 'Missing required fields' });
}


// Prevent duplicate transactionId
const exists = await Payment.findOne({ transactionId });
if (exists) return res.status(400).json({ error: 'Transaction already used' });


// Validate course exists
const course = await Course.findOne({ id: courseId });
if (!course) return res.status(400).json({ error: 'Invalid courseId' });


const p = await Payment.create({
phone,
deviceId,
courseId: course.id,
transactionId,
transactionDateTime: transactionDateTime ? new Date(transactionDateTime) : new Date()
});


res.json({ success: true, payment: p });
} catch (err) {
console.error(err);
res.status(500).json({ error: 'Server error' });
}
});


// GET /api/payments/check?phone=...&deviceId=...&courseId=...
router.get('/check', async (req, res) => {
const { phone, deviceId, courseId } = req.query;
if (!phone || !deviceId || !courseId) return res.json({ paid: false });


const payment = await Payment.findOne({ phone, deviceId, courseId });
res.json({ paid: !!payment });
});


export default router;