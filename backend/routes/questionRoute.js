const express = require("express");
const {
  insertQuestion,
  updateQuestion,
  deleteQuestion,
  getAllQuestion,
  getSingleQuestion,
  StartQuestion,
  getQuestions,
  updateQuestions,
} = require("../controller/questionController");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type, only certain files are allowed!"),
        false
      );
    }
  },
});

router.post("/insertQuestion", upload.single("video"), insertQuestion);
router.post("/updateQuestion", updateQuestion);
router.delete("/deleteQuestion/:id", deleteQuestion);
router.get("/getallQuestion", getAllQuestion);
router.get("/singleQuestion/:id", getSingleQuestion);
router.post("/StartQuestion/:id", StartQuestion);
router.post("/getQuestions", getQuestions);
router.post("/updateQuestions/:id", upload.single("video"), updateQuestions); //Update question

module.exports = router;
