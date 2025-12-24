import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import ocrRoutes from "./routes/ocrRoutes.js";
import paymentTestRoutes from "./routes/paymentTestRoutes.js";
import courseProgressRoutes from "./routes/courseProgressRoutes.js";
import lessonProgressRoutes from "./routes/lessonProgressRoutes.js";

// Load environment variables

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// app.use(cors({
//   origin: "*",
//   methods: ["GET", "POST", "OPTIONS"],
// }));

// // Wildcard OPTIONS handler
// app.options("/*", cors()); // ⭐ MUST

// ❌ Route middleware MUST NOT run before DB connect
// ❌ app.listen MUST NOT run before DB connect

async function startServer() {
  try {
    // 🔥 Fix: Connect to DB first
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000, // 20 sec
      connectTimeoutMS: 20000
    });

    console.log("✅ MongoDB Connected");

    // 🔥 Fix: Add routes AFTER DB connected
    app.use("/api/courses", courseRoutes);
    app.use("/api/payments", paymentRoutes);
    app.use("/api/auth", authRoutes);
    app.use("/api/lessons", lessonRoutes);
    app.use("/api/ocr", ocrRoutes);
    app.use("/api/paymenttests", paymentTestRoutes);
    app.use("/api/courseprogress", courseProgressRoutes);
    app.use("/api/lessonprogress", lessonProgressRoutes);

    // 🔥 Fix: Start server AFTER routes loaded
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Stop completely (avoid broken server)
  }
}

startServer();
