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
const { deviceId,
        courseId, 
        method, 
        amount, 
        status, 
        transactionId, 
        transactionDateTime } = req.body;



if (!deviceId || !courseId || !transactionId) {
return res.status(400).json({ error: 'Missing required fields' });
}


// Prevent duplicate transactionId
const exists = await Payment.findOne({ transactionId });
if (exists) return res.status(400).json({ error: 'Transaction already used' });


// Validate course exists
const course = await Course.findById(courseId);
if (!course) return res.status(400).json({ error: 'Invalid courseId' });


const p = await Payment.create({
deviceId,
courseId,
method,
amount,
status,
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
const {  deviceId, courseId } = req.query;
if (!deviceId || !courseId) return res.json({ paid: false });


const payment = await Payment.findOne({ deviceId, courseId });
res.json({ paid: !!payment });
});


export default router;