const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // e.g. Red, Blue, Green, Yellow
    },
    colorCode: {
      type: String,
      default: "#FF69B4",
    },
    score: {
      type: Number,
      default: 0,
    },
    leaders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActiveTurn: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("House", houseSchema);
