import mongoose from "mongoose";

const UserDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },

  platform: { type: String, enum: ["web", "android", "ios"] },
  appVersion: String,
  locale: { type: String, default: "mm" },
  timezone: String,

  isPremium: { type: Boolean, default: false },
  premiumUntil: Date,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

  lastIP: String,
  ipHistory: [String],

  isBlocked: { type: Boolean, default: false },
  blockReason: String,

  lastActiveAt: Date,
}, { timestamps: true });
export default mongoose.model('UserDevice', UserDeviceSchema);