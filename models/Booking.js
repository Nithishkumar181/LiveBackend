const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  room_id: {
    type: String,
    required: [true, 'Room ID is required']
  },
  customer_name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long']
  },
  customer_age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'Must be at least 18 years old']
  },
  customer_address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  customer_mobileNo: {
    type: String,
    required: [true, 'Mobile number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid mobile number! Must be 10 digits.`
    }
  },
  customer_aadharno: {
    type: String,
    required: [true, 'Aadhar number is required'],
    validate: {
      validator: function(v) {
        return /^[0-9]{12}$/.test(v);
      },
      message: props => `${props.value} is not a valid Aadhar number! Must be 12 digits.`
    }
  },
  check_in_date: {
    type: Date,
    required: [true, 'Check-in date is required'],
    validate: {
      validator: function(v) {
        return v >= new Date();
      },
      message: 'Check-in date must be in the future'
    }
  },
  check_out_date: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(v) {
        return v > this.check_in_date;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ room_id: 1, check_in_date: 1, check_out_date: 1 });

// Method to check room availability
bookingSchema.statics.isRoomAvailable = async function(roomId, checkIn, checkOut) {
  const overlappingBookings = await this.find({
    room_id: roomId,
    status: 'confirmed',
    $or: [
      {
        check_in_date: { $lte: checkOut },
        check_out_date: { $gte: checkIn }
      }
    ]
  });
  
  return overlappingBookings.length === 0;
};

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
