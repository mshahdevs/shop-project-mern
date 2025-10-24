const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    console.log("Upload request received");
    if (!req.file) {
      return res.status(400).json({
        message: "No image file provided",
      });
    }
    console.log("File details:", req.file);
    res.json({
      message: "Image uploaded successfully",
      image: req.file.path,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Error uploading image",
      error: error.message,
    });
  }
});

module.exports = router;
