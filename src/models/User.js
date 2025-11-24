import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
phone: { type: String, unique: true, required: true },
password: { type: String, required: true },
deviceId: String
}, { timestamps: true });


export default mongoose.model('User', userSchema);
