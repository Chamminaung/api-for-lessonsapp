import AdminDevice from "../models/AdminDevice.js";
import express from "express";
const router = express.Router();
// Add a new admin device
router.post("/", async (req, res) => {
  try {
    const { deviceId, adminName } = req.body;
    const newAdminDevice = new AdminDevice({ deviceId, adminName });
    await newAdminDevice.save();
    res.status(201).json(newAdminDevice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all admin devices
router.get("/", async (req, res) => {
  try {
    const adminDevices = await AdminDevice.find();
    res.status(200).json(adminDevices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export default router;