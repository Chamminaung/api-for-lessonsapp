import express from "express";
import UserDevice from "../models/UserDevice.js";

const router = express.Router();


// ✅ CREATE (or get if exists) – device register
router.post("/", async (req, res) => {
  try {
    const {
      deviceId,
      platform,
      appVersion
    } = req.body;

    if (!deviceId) {
      return res.status(400).json({ message: "deviceId is required" });
    }

    let device = await UserDevice.findOne({ deviceId });

    if (!device) {
      device = await UserDevice.create({
        deviceId,
        platform,
        appVersion,
        locale: req.headers["accept-language"] || "en-US",
        timezone: req.headers["x-timezone"] || "UTC",
        lastActiveAt: new Date(),
        lastIP: req.ip,
        ipHistory: [req.ip],
      });
    } else {
      // update last active
      device.lastActiveAt = new Date();
      device.lastIP = req.ip;

      if (!device.ipHistory.includes(req.ip)) {
        device.ipHistory.push(req.ip);
      }

      await device.save();
    }

    res.status(200).json(device);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ READ (by deviceId)
router.get("/:deviceId", async (req, res) => {
  try {
    const device = await UserDevice.findOne({
      deviceId: req.params.deviceId,
    }).populate("purchasedCourses");

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ READ ALL (admin)
router.get("/", async (req, res) => {
  try {
    const devices = await UserDevice.find()
      .sort({ createdAt: -1 });

    res.json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ UPDATE (partial update)
router.put("/:deviceId", async (req, res) => {
  try {
    const device = await UserDevice.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      { $set: req.body },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ UPDATE – premium status (payment hook)
router.patch("/:deviceId/premium", async (req, res) => {
  try {
    const { isPremium, premiumUntil } = req.body;

    const device = await UserDevice.findOneAndUpdate(
      { deviceId: req.params.deviceId },
      {
        isPremium,
        premiumUntil,
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ DELETE (admin only – normally not public)
router.delete("/:deviceId", async (req, res) => {
  try {
    const device = await UserDevice.findOneAndDelete({
      deviceId: req.params.deviceId,
    });

    if (!device) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.json({ message: "Device deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
