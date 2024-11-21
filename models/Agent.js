const mongoose = require("mongoose");

const agentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plot",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Agent = mongoose.model("Agent", agentSchema);

module.exports = Agent;
