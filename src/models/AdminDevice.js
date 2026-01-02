import mongoose from "mongoose";

const adminDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, unique: true, required: true },
  adminName: { type: String, required: true }
}, { timestamps: true });
export default mongoose.model('AdminDevice', adminDeviceSchema);