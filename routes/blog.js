const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { authenticateUser } = require("../middlewares/authMiddleware"); // Middleware to check user authentication

// Create a new blog
router.post("/create", authenticateUser, async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required." });
    }

    // Create a new blog instance
    const blog = new Blog({
      title,
      content,
      author, // Assign the logged-in user's ID, or leave null if no user
    });

    // Save the blog to get the generated `_id`
    await blog.save();

    // Generate the URL dynamically
    const url = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}?id=${blog._id}`;

    // Update the blog with the URL
    blog.url = url;
    await blog.save();

    res.status(201).json({ message: "Blog created successfully.", blog });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Edit a blog by ID
router.put("/edit/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params; // Blog ID from the URL parameters
    const { title, content, author} = req.body; // Fields to update

    // Check if at least one field is provided for updating
    if (!title && !content) {
      return res.status(400).json({ message: "At least one field (title or content) is required to update the blog." });
    }

    // Find the blog by ID
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    // Verify the logged-in user is the author of the blog
    if (author !== blog.author?.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this blog." });
    }

    // Update the blog fields
    if (title) blog.title = title;
    if (content) blog.content = content;

    // Save the updated blog
    await blog.save();

    res.status(200).json({ message: "Blog updated successfully.", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find().populate("author", "firstName lastName email"); // Populate author details
    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get a single blog
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "firstName lastName email");
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    res.status(200).json({ blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/tag/:tag", async (req, res) => {
  try {
    const { tag } = req.params;

    if (!tag) {
      return res.status(400).json({ message: "Tag parameter is required." });
    }

    // Find blogs that include the specified tag
    const blogs = await Blog.find({ tags: tag }).populate("author", "firstName lastName email");

    if (blogs.length === 0) {
      return res.status(404).json({ message: "No blogs found with the specified tag." });
    }

    res.status(200).json({ blogs });
  } catch (error) {
    console.error("Error fetching blogs by tag:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/tags", async (req, res) => {
  try {
    const { text } = req.body;

    // Validate input
    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Tag text is required and must be a string." });
    }

    // Check if the tag already exists
    const existingTag = await Tag.findOne({ text: text.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists." });
    }

    // Create and save the tag
    const tag = new Tag({ text: text.toLowerCase() });
    await tag.save();

    res.status(201).json({ message: "Tag created successfully.", tag });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;