// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  room_id: String,
  customer_name: String,
  customer_age: Number,
  customer_address: String,
  customer_mobileNo: String,
  customer_aadharno: String,
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
