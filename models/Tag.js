const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    text: { type: String, required: true }, // Tag text
  },
  { timestamps: true } // Add timestamps for creation and update times
);

module.exports = mongoose.model("Tag", tagSchema);