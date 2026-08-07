const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Topic", topicSchema);
