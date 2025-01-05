const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // Store the HTML content from the Quill editor
    coverImage: { type: String, required: false }, // URL or path to the cover image
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User schema
      default: null,
    },
    tags: {
      type: [String], // Array of strings to store tags
      default: [], // Default to an empty array
    },
    url: {
      type: String, // The generated URL field
      required: false,
      unique: true, // Ensures each blog has a unique URL
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

module.exports = mongoose.model("Blog", blogSchema);