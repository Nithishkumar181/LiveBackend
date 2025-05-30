const express = require("express");
const cors = require("cors");

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working",
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
