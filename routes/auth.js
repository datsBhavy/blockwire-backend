const express = require("express");
const router = express.Router();
const User = require("../models/User");

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, password, email, phoneNumber } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!firstName || !lastName || !password || !email || !phoneNumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if email or phone number is already in use
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or phone number is already in use.",
      });
    }

    // Create a new user
    const user = new User({ firstName, lastName, password, email, phoneNumber });
    await user.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// User Login
router.post("/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
  
      // Validate input fields
      if (!identifier || !password) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Find user by email or phone number
      const user = await User.findOne({
        $or: [{ email: identifier }, { phoneNumber: identifier }],
      });
  
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
  
      // Validate password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials." });
      }
  
      // Create session
      req.session.userId = user._id;
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return res.status(500).json({ message: "Internal server error." });
        }
  
        res.status(200).json({ message: "Login successful.", user });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  });

// Check Session
router.get("/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not logged in." });
      }
  
      const user = await User.findById(req.session.userId).select("-password -__v");
  
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
  
      res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  });
// Logout
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Unable to log out." });
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.status(200).json({ message: "Logout successful." });
    });
  });

module.exports = router;