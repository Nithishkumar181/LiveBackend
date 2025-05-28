// routes/bookingRoutes.js
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Add Booking
router.post("/add-booking", async (req, res) => {
  const booking = new Booking(req.body);
  await booking.save();
  res.json({ message: "Booking added" });
});

// Get All Bookings
router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

// Update Booking
router.put("/update-booking/:room_id", async (req, res) => {
  await Booking.findOneAndUpdate({ room_id: req.params.room_id }, req.body);
  res.json({ message: "Booking updated" });
});

// Delete Booking
router.delete("/delete-booking/:room_id", async (req, res) => {
  await Booking.findOneAndDelete({ room_id: req.params.room_id });
  res.json({ message: "Booking deleted" });
});

module.exports = router;
