// ---------------------------
// src/routes/authRoutes.js
// ---------------------------
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'REPLACE_ME';


// POST /api/auth/register
router.post('/register', async (req, res) => {
const { phone, password, deviceId } = req.body;
if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });


const exists = await User.findOne({ phone });
if (exists) return res.status(400).json({ error: 'Phone already registered' });


const hashed = await bcrypt.hash(password, 10);
const user = await User.create({ phone, password: hashed, deviceId });
res.json({ success: true, user: { id: user._id, phone: user.phone } });
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
const { phone, password } = req.body;
if (!phone || !password) return res.status(400).json({ error: 'Missing phone or password' });


const user = await User.findOne({ phone });
if (!user) return res.status(400).json({ error: 'User not found' });


const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(400).json({ error: 'Wrong password' });


const token = jwt.sign({ id: user._id, phone: user.phone }, JWT_SECRET, { expiresIn: '30d' });
res.json({ success: true, token });
});


export default router;