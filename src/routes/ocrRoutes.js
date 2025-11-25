// routes/ocrRoutes.js
import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Multer - memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB per file
});

// Accept multiple files (field name "images")
router.post("/ocr", upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No image files received" });
    }

    const results = [];

    // sequential processing to avoid memory/CPU spikes; you can parallelize later if you want
    for (const file of req.files) {
      const tempPath = path.join("/tmp", `${Date.now()}-${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);

      // run OCR (language set to eng+mya as before)
      const { data } = await Tesseract.recognize(tempPath, "eng+mya", {
        logger: (m) => console.log(`[Tesseract] ${file.originalname}`, m),
      });

      results.push({
        fileName: file.originalname,
        text: data.text,
      });

      // remove temp file
      try { fs.unlinkSync(tempPath); } catch(e){ console.warn("unlink failed", e); }
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("OCR endpoint error:", err);
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
});

export default router;
