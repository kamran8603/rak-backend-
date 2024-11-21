const mongoose = require("mongoose");

const plotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bookingId: {
      type: String,
    },
    area: {
      type: String,
    },
    status: {
      type: String,
      enum: ["available", "booked", "selected"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const Plot = mongoose.model("Plot", plotSchema);

module.exports = Plot;
