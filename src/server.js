import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import Tesseract from "tesseract.js";
// Import routes
import authRoutes from "./routes/authRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));


mongoose
  .connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // 30 seconds
})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));



// OCR endpoint
app.post("/ocr", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });

    // tesseract.js v4+ simplified usage
    const { data } = await Tesseract.recognize(
      image,
      "eng+mya", // English + Myanmar
      {
        logger: function(m){ console.log(m); } // Node.js compatible
      }
    );

    res.json({ text: data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed" });
  }
});



// route middlewares
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);


app.listen(process.env.PORT || 3000, () => console.log(`Server running on port ${process.env.PORT || 3000}`));
  
