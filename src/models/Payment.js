import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
//phone: { type: String, required: true },
deviceId: { type: String, required: true },
courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
method: { type: String, required: true },
transactionId: { type: String, required: true, unique: true },
amount: { type: Number, default: null },
status: {
type: String,
enum: ["PendingReview", "Approved", "Rejected"],
default: "PendingReview",
},
transactionDateTime: Date,
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Payment', paymentSchema);