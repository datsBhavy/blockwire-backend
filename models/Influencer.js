const mongoose = require("mongoose");

const influencerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Name of the influencer
    description: { type: String, required: true }, // Short bio or description
    instagramHandle: { type: String, required: false }, // Optional Instagram handle
    xHandle: { type: String, required: false }, // Optional X (Twitter) handle
    socialLinks: { 
      type: Map, 
      of: String, // Map of platform names to URLs
      required: false, // Optional
    },
    profileImage: { type: String, required: false }, // URL or path to the cover image
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }], // References to tags
  },
  { timestamps: true } // Add timestamps for creation and update times
);

module.exports = mongoose.model("Influencer", influencerSchema);