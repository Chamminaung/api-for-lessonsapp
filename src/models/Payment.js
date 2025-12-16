import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  // ===== Existing fields (မပြောင်း) =====
  deviceId: { type: String, required: true }, // Buyer device (Device #1)
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  method: { type: String, required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, default: null },
  status: {
    type: String,
    enum: ["PendingReview", "Approved", "Rejected"],
    default: "Approved",
  },
  transactionDateTime: Date,
  createdAt: { type: Date, default: Date.now },

  // ===== New fields (Device 2 + Code System) =====

  // total allowed devices per purchase
  allowedDevices: {
    type: Number,
    default: 2
  },

  // activated devices list
  activatedDevices: [
    {
      deviceId: { type: String, required: true },
      activatedAt: { type: Date, default: Date.now }
    }
  ],

  // 4-digit share code for second device
  shareCode: {
    code: { type: String },          // e.g. "4829"
    used: { type: Boolean, default: false },
    usedByDevice: { type: String },
    usedAt: { type: Date },

    expiresAt: { type: Date } // ⏱️ NEW
  }

});

export default mongoose.model("Payment", paymentSchema);
