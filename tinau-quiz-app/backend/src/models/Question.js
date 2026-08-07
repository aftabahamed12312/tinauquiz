const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    answerText: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["text", "image", "audio"],
      default: "text",
    },
    mediaUrl: {
      type: String,
      default: null, // file path or external URL
    },
    points: {
      type: Number,
      default: 10,
    },
    timerSeconds: {
      type: Number,
      default: 30,
    },
    // Question lifecycle: AVAILABLE -> ASKED -> REVEALED / PASSED / COMPLETED
    status: {
      type: String,
      enum: ["AVAILABLE", "ASKED", "REVEALED", "PASSED", "COMPLETED"],
      default: "AVAILABLE",
    },
    // House currently holding / assigned to this question
    assignedHouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      default: null,
    },
    // Track which houses it was passed to, in order
    passHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "House",
      },
    ],
    // House that ultimately answered / won points for this question
    wonByHouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
