import mongoose from "mongoose";
// ----------------------
// Payment Schema
// ----------------------
const paymentSchematest = new mongoose.Schema({
userId: { type: String, required: true },
method: { type: String, required: true },
amount: { type: Number, default: null },
rawText: { type: String, required: true },
base64Image: { type: String, required: true }, // store or upload to cloud
status: {
type: String,
enum: ["PendingReview", "Approved", "Rejected"],
default: "PendingReview",
},
timestamp: { type: Date, default: Date.now },
});


export default  mongoose.model("PaymentTest", paymentSchematest);