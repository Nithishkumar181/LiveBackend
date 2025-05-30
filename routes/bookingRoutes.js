const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const { authenticateToken } = require("./authRoutes");
const { ensureDbConnection } = require("../utils/db");

// Validation middleware
const validateBookingDates = (req, res, next) => {
    const { check_in_date, check_out_date } = req.body;
    const now = new Date();
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    // Remove time portion for date comparison
    now.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn < now) {
        return res.status(400).json({
            success: false,
            message: "Check-in date cannot be in the past"
        });
    }

    if (checkOut <= checkIn) {
        return res.status(400).json({
            success: false,
            message: "Check-out date must be after check-in date"
        });
    }

    next();
};

// Add Booking
router.post("/add-booking", [authenticateToken, ensureDbConnection, validateBookingDates], async (req, res) => {
    try {
        const bookingData = {
            ...req.body,
            check_in_date: new Date(req.body.check_in_date),
            check_out_date: new Date(req.body.check_out_date)
        };

        console.log('Processing booking request:', JSON.stringify(bookingData, null, 2));

        // Check room availability
        const isAvailable = await Booking.isRoomAvailable(
            bookingData.room_id,
            bookingData.check_in_date,
            bookingData.check_out_date
        );

        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: "Room is not available for the selected dates"
            });
        }

        const booking = new Booking(bookingData);
        
        // Validate the booking
        try {
            await booking.validate();
        } catch (validationError) {
            console.error('Validation error:', validationError);
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(validationError.errors).map(err => err.message)
            });
        }

        await booking.save();

        res.status(201).json({
            success: true,
            message: "Booking added successfully",
            booking: booking.toJSON()
        });
    } catch (error) {
        console.error("Add booking error:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Server error while adding booking",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get All Bookings
router.get("/bookings", [authenticateToken, ensureDbConnection], async (req, res) => {
    try {
        const { limit = 10, page = 1, sort = '-createdAt' } = req.query;
        const skip = (page - 1) * limit;

        const bookings = await Booking.find()
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-__v');

        const total = await Booking.countDocuments();

        res.json({
            success: true,
            count: bookings.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
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
router.get("/booking/:room_id", [authenticateToken, ensureDbConnection], async (req, res) => {
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
            booking: booking.toJSON()
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
router.put("/update-booking/:room_id", [authenticateToken, ensureDbConnection, validateBookingDates], async (req, res) => {
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
                checkOut,
                booking._id // Exclude current booking from availability check
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
            booking: updatedBooking.toJSON()
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
router.delete("/delete-booking/:room_id", [authenticateToken, ensureDbConnection], async (req, res) => {
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
            booking: booking.toJSON()
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
