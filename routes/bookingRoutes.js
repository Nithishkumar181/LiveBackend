const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const { authenticateToken } = require("./authRoutes");

// Add Booking
router.post("/add-booking", authenticateToken, async (req, res) => {
  try {
    const bookingData = req.body;

    // Check room availability
    const isAvailable = await Booking.isRoomAvailable(
      bookingData.room_id,
      new Date(bookingData.check_in_date),
      new Date(bookingData.check_out_date)
    );

    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for the selected dates"
      });
    }

    const booking = new Booking(bookingData);
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking added successfully",
      booking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    console.error("Add booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding booking"
    });
  }
});

// Get All Bookings
router.get("/bookings", authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 }) // Latest first
      .select('-__v'); // Exclude version key

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching bookings"
    });
  }
});

// Get Booking by ID
router.get("/booking/:room_id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ room_id: req.params.room_id })
      .select('-__v');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching booking"
    });
  }
});

// Update Booking
router.put("/update-booking/:room_id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ room_id: req.params.room_id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // If dates are being updated, check availability
    if (req.body.check_in_date || req.body.check_out_date) {
      const checkIn = new Date(req.body.check_in_date || booking.check_in_date);
      const checkOut = new Date(req.body.check_out_date || booking.check_out_date);
      
      const isAvailable = await Booking.isRoomAvailable(
        req.params.room_id,
        checkIn,
        checkOut
      );

      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: "Room is not available for the selected dates"
        });
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(
      { room_id: req.params.room_id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating booking"
    });
  }
});

// Delete Booking
router.delete("/delete-booking/:room_id", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({ room_id: req.params.room_id });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    res.json({
      success: true,
      message: "Booking deleted successfully",
      booking
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting booking"
    });
  }
});

module.exports = router;
