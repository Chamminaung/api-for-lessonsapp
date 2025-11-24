import mongoose from "mongoose";


const paymentSchema = new mongoose.Schema({
phone: { type: String, required: true },
deviceId: { type: String, required: true },
courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
transactionId: { type: String, required: true, unique: true },
transactionDateTime: Date,
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Payment', paymentSchema);