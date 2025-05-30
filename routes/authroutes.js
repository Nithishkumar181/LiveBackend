const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Debug middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test route to verify server is working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working" });
});

// Simple login route
router.post("/admin-login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    // Hardcoded test user for debugging
    const testUser = {
      email: "test@example.com",
      password: "$2a$10$YourHashedPasswordHere"
    };

    // For testing, accept any password for test@example.com
    if (email === "test@example.com") {
      const token = jwt.sign(
        { email: testUser.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: "Login successful",
        token
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message
    });
  }
});

module.exports = router;
