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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
//app.use(express.urlencoded({ limit: "50mb", extended: true }));


mongoose
  .connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// route middlewares
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/ocr", ocrRoutes);

app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
  
