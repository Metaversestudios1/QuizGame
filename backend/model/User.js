const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  sessionId: { 
    type: String, 
    required: true, 
    unique: true // To make sure each session ID is unique
  },
  score: {
    type: Number,
    default: 0, // Initialize score to 0 at the start of the session
  },
  answeredQuestions: [
    {
      questionId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Question", // Reference to the Question model
      },
      userAnswer: String, // The answer the user gave
      isCorrect: { 
        type: Boolean, 
        default: false, 
      },
    },
  ],
  currentQuestionIndex: {
    type: Number,
    default: 0, // Track which question the user is on
  },
  totalQuestions: {
    type: Number,
    default: 0, // Track total number of questions the user should answer in this session
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of session start
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Timestamp of last update
  },
});

module.exports = mongoose.model("User", UserSchema);
