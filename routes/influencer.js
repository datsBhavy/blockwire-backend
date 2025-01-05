const express = require("express");
const router = express.Router();
const Influencer = require("../models/Influencer");
const Tag = require("../models/Tag");
const mongoose = require("mongoose");


// Create a new influencer
router.post("/", async (req, res) => {
  try {
    const { name, description, instagramHandle, xHandle, socialLinks, profileImage } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required." });
    }

    const influencer = new Influencer({
      name,
      description,
      instagramHandle,
      xHandle,
      socialLinks,
      profileImage,
    });

    await influencer.save();
    res.status(201).json({ message: "Influencer created successfully.", influencer });
  } catch (error) {
    console.error("Error creating influencer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all influencers
router.get("/", async (req, res) => {
  try {
    const influencers = await Influencer.find();
    res.status(200).json({ influencers });
  } catch (error) {
    console.error("Error fetching influencers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
router.get("/tags", async (req, res) => {
    try {
      // Fetch all tags from the Tag collection
      const tags = await Tag.find({}, { text: 1 }).sort({ text: 1 });
  
      if (tags.length === 0) {
        return res.status(404).json({ message: "No tags found." });
      }
  
      res.status(200).json({ tags });
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

router.post("/tags", async (req, res) => {
    const { text } = req.body;
  
    if (!text) {
      return res.status(400).json({ message: "Tag text is required." });
    }
  
    try {
      const tag = new Tag({ text });
      await tag.save();
      res.status(201).json({ message: "Tag created successfully.", tag });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
      throw error;
    }
  });

  router.delete("/tags/:tagId", async (req, res) => {
    const { tagId } = req.params;
  
    try {
      const tag = await Tag.findByIdAndDelete(tagId);
  
      if (!tag) {
        return res.status(404).json({ message: "Tag not found." });
      }
  
      // Optionally, remove references from influencers
      await Influencer.updateMany({ tags: tagId }, { $pull: { tags: tagId } });
  
      res.status(200).json({ message: "Tag deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
      throw error;
    }
  });

  router.post("/influencers/:influencerId/tags", async (req, res) => {
    const { influencerId } = req.params;
    const { tagId } = req.body;
  
    if (!tagId) {
      return res.status(400).json({ message: "Tag ID is required." });
    }
  
    try {
      const influencer = await Influencer.findById(influencerId);
  
      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found." });
      }
  
      // Check if the tag already exists in the influencer
      if (influencer.tags.includes(tagId)) {
        return res.status(400).json({ message: "Tag already added to influencer." });
      }
  
      influencer.tags.push(tagId);
      await influencer.save();
  
      res.status(200).json({ message: "Tag added to influencer successfully.", influencer });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
      throw error;
    }
  });

  router.delete("/influencers/:influencerId/tags/:tagId", async (req, res) => {
    const { influencerId, tagId } = req.params;
  
    try {
      const influencer = await Influencer.findById(influencerId);
  
      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found." });
      }
  
      influencer.tags = influencer.tags.filter((tag) => tag.toString() !== tagId);
      await influencer.save();
  
      res.status(200).json({ message: "Tag removed from influencer successfully.", influencer });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
      throw error;
    }
  });


// Get a single influencer by ID
router.get("/:id", async (req, res) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found." });
    }
    res.status(200).json({ influencer });
  } catch (error) {
    console.error("Error fetching influencer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Update an influencer
router.put("/:id", async (req, res) => {
  try {
    const { name, description, instagramHandle, xHandle, socialLinks, profileImage } = req.body;

    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      { name, description, instagramHandle, xHandle, socialLinks, profileImage },
      { new: true, runValidators: true }
    );

    if (!influencer) {
      return res.status(404).json({ message: "Influencer not found." });
    }

    res.status(200).json({ message: "Influencer updated successfully.", influencer });
  } catch (error) {
    console.error("Error updating influencer:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Delete an influencer
router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the ID is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid influencer ID." });
      }
  
      const influencer = await Influencer.findByIdAndDelete(id);
      if (!influencer) {
        return res.status(404).json({ message: "Influencer not found." });
      }
  
      res.status(200).json({ message: "Influencer deleted successfully." });
    } catch (error) {
      console.error("Error deleting influencer:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

module.exports = router;