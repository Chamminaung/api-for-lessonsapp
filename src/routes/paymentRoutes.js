// ---------------------------
// src/routes/paymentRoutes.js
// ---------------------------
import express from "express";
import Payment from "../models/Payment.js";
import Course from "../models/Course.js";

const router = express.Router();

/**
 * CONFIG
 */
const CODE_EXPIRE_MINUTES = 60 * 24; // ⏱️ 60 min (change as needed)

/**
 * Helpers
 */
const generate4DigitCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

const generateExpiryDate = () =>
  new Date(Date.now() + CODE_EXPIRE_MINUTES * 60 * 1000);



// =====================================================
// POST /api/payments/pay
// Register payment (Device #1)
// =====================================================
router.post("/pay", async (req, res) => {
  try {
    const {
      deviceId,
      courseId,
      method,
      amount,
      status,
      transactionId,
      transactionDateTime,
    } = req.body;

    if (!deviceId || !courseId || !transactionId || !method) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // prevent duplicate transaction
    const exists = await Payment.findOne({ transactionId });
    if (exists) {
      return res.status(400).json({ error: "Transaction already used" });
    }

    // validate course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({ error: "Invalid courseId" });
    }

    const payment = await Payment.create({
      deviceId,
      courseId,
      method,
      amount,
      status: status || "PendingReview",
      transactionId,
      transactionDateTime: transactionDateTime
        ? new Date(transactionDateTime)
        : new Date(),

      allowedDevices: 2,
      activatedDevices: [],
      shareCode: {
        code: generate4DigitCode(),
        used: false,
        expiresAt: generateExpiryDate(),
      },
    });

    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// =====================================================
// POST /api/payments/approve
// Admin approve → auto activate Device #1
// =====================================================
router.post("/approve", async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: "transactionId required" });
    }

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = "Approved";

    // auto activate buyer device
    const activated = payment.activatedDevices.some(
      d => d.deviceId === payment.deviceId
    );

    if (!activated) {
      payment.activatedDevices.push({
        deviceId: payment.deviceId,
        activatedAt: new Date(),
      });
    }

    // regenerate code only if missing
    if (!payment.shareCode?.code) {
      payment.shareCode = {
        code: generate4DigitCode(),
        used: false,
        expiresAt: generateExpiryDate(),
      };
    }

    await payment.save();

    res.json({
      success: true,
      shareCode: payment.shareCode.code,
      expiresAt: payment.shareCode.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// =====================================================
// GET /api/payments/check?deviceId=&courseId=
// Used on app start
// =====================================================
router.get("/check", async (req, res) => {
  try {
    const { deviceId, courseId } = req.query;
    if (!deviceId || !courseId) {
      return res.json({ access: false });
    }

    const payment = await Payment.findOne({
      courseId,
      status: "Approved",
    });

    if (!payment) {
      return res.json({ access: false });
    }

    const isActivated = payment.activatedDevices.some(
      d => d.deviceId === deviceId
    );

    const codeExpired =
      payment.shareCode?.expiresAt &&
      new Date() > payment.shareCode.expiresAt;

    res.json({
      access: isActivated,
      canUseCode:
        !isActivated &&
        !payment.shareCode?.used &&
        !codeExpired &&
        payment.activatedDevices.length < payment.allowedDevices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// =====================================================
// POST /api/payments/activate-code
// Device #2 activation
// =====================================================
router.post("/activate-code", async (req, res) => {
  try {
    const { deviceId, courseId, code } = req.body;

    if (!deviceId || !courseId || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const payment = await Payment.findOne({
      courseId,
      status: "Approved",
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // already activated
    if (
      payment.activatedDevices.some(d => d.deviceId === deviceId)
    ) {
      return res.json({ success: true });
    }

    // device limit
    if (payment.activatedDevices.length >= payment.allowedDevices) {
      return res.status(400).json({ error: "Device limit reached" });
    }

    // expired
    if (
      payment.shareCode.expiresAt &&
      new Date() > payment.shareCode.expiresAt
    ) {
      return res.status(400).json({ error: "Code expired" });
    }

    // used
    if (payment.shareCode.used) {
      return res.status(400).json({ error: "Code already used" });
    }

    // invalid
    if (payment.shareCode.code !== code) {
      return res.status(400).json({ error: "Invalid code" });
    }

    // activate
    payment.activatedDevices.push({
      deviceId,
      activatedAt: new Date(),
    });

    payment.shareCode.used = true;
    payment.shareCode.usedByDevice = deviceId;
    payment.shareCode.usedAt = new Date();

    await payment.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// =====================================================
// GET /api/payments/share-code?courseId=
// Buyer device view + countdown
// =====================================================
router.get("/share-code", async (req, res) => {
  try {
    const { courseId, deviceId } = req.query;

    if (!courseId || !deviceId) {
      return res.status(400).json({ error: "courseId & deviceId required" });
    }

    const payment = await Payment.findOne({
      courseId,
      deviceId,
      status: "Approved",
    });

    if (!payment || !payment.shareCode) {
      return res.status(404).json({ error: "Share code not found" });
    }

    // expiry check
    if (
      payment.shareCode.expiresAt &&
      new Date(payment.shareCode.expiresAt) < new Date()
    ) {
      return res.status(410).json({ error: "Share code expired" });
    }

    res.json({
      code: payment.shareCode.code,
      used: payment.shareCode.used,
      expiresAt: payment.shareCode.expiresAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;




// // ---------------------------
// // src/routes/paymentRoutes.js
// // ---------------------------
// import express from "express";
// import Payment from "../models/Payment.js";
// import Course from "../models/Course.js";


// const router = express.Router();


// // POST /api/payments/pay
// router.post('/pay', async (req, res) => {
// try {
// const { deviceId,
//         courseId, 
//         method, 
//         amount, 
//         status, 
//         transactionId, 
//         transactionDateTime } = req.body;



// if (!deviceId || !courseId || !transactionId) {
// return res.status(400).json({ error: 'Missing required fields' });
// }


// // Prevent duplicate transactionId
// const exists = await Payment.findOne({ transactionId });
// if (exists) return res.status(400).json({ error: 'Transaction already used' });


// // Validate course exists
// const course = await Course.findById(courseId);
// if (!course) return res.status(400).json({ error: 'Invalid courseId' });


// const p = await Payment.create({
// deviceId,
// courseId,
// method,
// amount,
// status,
// transactionId,
// transactionDateTime: transactionDateTime ? new Date(transactionDateTime) : new Date()
// });


// res.json({ success: true, payment: p });
// } catch (err) {
// console.error(err);
// res.status(500).json({ error: 'Server error' });
// }
// });


// // GET /api/payments/check?phone=...&deviceId=...&courseId=...
// router.get('/check', async (req, res) => {
// const {  deviceId, courseId } = req.query;
// if (!deviceId || !courseId) return res.json({ paid: false });


// const payment = await Payment.findOne({ deviceId, courseId });
// res.json({ paid: !!payment });
// });


// export default router;