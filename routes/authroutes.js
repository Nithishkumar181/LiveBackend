// routes/authRoutes.js
const express = require("express");
const router = express.Router();

let users = {}; // Simple in-memory store (for demo purposes)

router.post("/admin-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({ success: false, message: "Email and password required" });
  }

  if (users[email]) {
    if (users[email] === password) {
      return res.json({ success: true, message: "Login successful" });
    } else {
      return res.json({ success: false, message: "Incorrect password" });
    }
  }

  users[email] = password;
  return res.json({ success: true, message: "New user registered and logged in" });
});

module.exports = router;
