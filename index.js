require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const { checkDbConnection, connectWithRetry } = require('./utils/db');

// Create Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is working",
    timestamp: new Date().toISOString()
  });
});

// Routes
const { router: authRouter } = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

// Use routers
app.use("/api", authRouter);
app.use("/api", bookingRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate key error"
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

// Connect to MongoDB with retry mechanism
connectWithRetry()
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Periodic database connection check
setInterval(async () => {
  const isConnected = await checkDbConnection();
  if (!isConnected) {
    console.error('Database connection lost');
  }
}, 30000); // Check every 30 seconds

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during app termination:', err);
    process.exit(1);
  }
});
