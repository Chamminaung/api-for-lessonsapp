import express from "express";
const Tesseract = require("tesseract.js");
const bodyParser = require("body-parser");

const router = express.Router();

router.use(bodyParser.json({ limit: "50mb" }));

// OCR endpoint
router.post("/ocr", async (req, res) => {
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

export default router;