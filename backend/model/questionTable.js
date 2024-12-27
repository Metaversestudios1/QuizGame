const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: String,
        required: true,
      },
    },
  ],
  correctAnswer: { type: String, required: true },
  videoUrl: {
    publicId: { type: String },
    url: { type: String },
    originalname: { type: String },
    mimetype: { type: String },
  },
  videoType: {
    type: String, //Intro video,question related video
    required: false,
  },
  currentQuestion: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  timer: {
    type: String,
    default: null,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
