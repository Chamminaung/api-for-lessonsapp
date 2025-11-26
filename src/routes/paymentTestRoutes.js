// ----------------------
// Router
// ----------------------
const router = express.Router();
router.use(express.json({ limit: "20mb" }));


// 1. Register payment
router.post("/paymentregister", async (req, res) => {
try {
const { userId, method, rawText, base64Image, amount, status } = req.body;


if (!base64Image) {
return res.status(400).json({ error: "base64Image missing" });
}


const payment = await Payment.create({
userId,
method,
amount,
rawText,
base64Image,
status: status || "PendingReview",
});


res.json({ message: "Payment saved", payment });
} catch (err) {
console.error("Register error", err);
res.status(500).json({ error: "Server error" });
}
});


// 2. Admin: Get all payments
router.get("/all", async (req, res) => {
try {
const payments = await Payment.find().sort({ timestamp: -1 });
res.json({ payments });
} catch (err) {
res.status(500).json({ error: "Server error" });
}
});


// 3. Admin: Approve or Reject payment
router.post("/update-status", async (req, res) => {
try {
const { id, status } = req.body;
if (!id || !status) return res.status(400).json({ error: "Invalid data" });


const updated = await Payment.findByIdAndUpdate(id, { status }, { new: true });
res.json({ message: "Updated", payment: updated });
} catch (err) {
res.status(500).json({ error: "Server error" });
}
});


// ----------------------
// Export router
// ----------------------
export default router;