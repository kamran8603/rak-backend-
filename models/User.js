const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: true,
      trim: true,
    },
    lname: {
      type: String,
      required: true,
      trim: true,
    },
    mnumber: {
      type: Number,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    agentRef: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "agent", "owner"],
      default: "user",
    },
    bookedPlots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plot",
      },
    ],
    documents: [
      {
        filename: String,
        path: String,
      },
    ],
    profilePicture: {
      type: String,
      default: "defaultProfile.png",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.addBookedPlot = async function(plotId) {
  this.bookedPlots.push(plotId);
  await this.save();
};

module.exports = mongoose.model("User", UserSchema);
