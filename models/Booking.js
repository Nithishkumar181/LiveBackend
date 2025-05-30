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
        // Convert both dates to start of day for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkIn = new Date(v);
        checkIn.setHours(0, 0, 0, 0);
        return checkIn >= today;
      },
      message: 'Check-in date must be in the future'
    }
  },
  check_out_date: {
    type: Date,
    required: [true, 'Check-out date is required'],
    validate: {
      validator: function(v) {
        if (!this.check_in_date) return false;
        // Convert both dates to start of day for comparison
        const checkIn = new Date(this.check_in_date);
        const checkOut = new Date(v);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        return checkOut > checkIn;
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
  timestamps: true,
  // Add toJSON transform to format dates consistently
  toJSON: {
    transform: function(doc, ret) {
      if (ret.check_in_date) {
        ret.check_in_date = ret.check_in_date.toISOString().split('T')[0];
      }
      if (ret.check_out_date) {
        ret.check_out_date = ret.check_out_date.toISOString().split('T')[0];
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for faster queries
bookingSchema.index({ room_id: 1, check_in_date: 1, check_out_date: 1 });
bookingSchema.index({ status: 1 });

// Method to check room availability
bookingSchema.statics.isRoomAvailable = async function(roomId, checkIn, checkOut, excludeBookingId = null) {
  // Convert dates to start of day for consistent comparison
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  checkInDate.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);

  const query = {
    room_id: roomId,
    status: { $in: ['pending', 'confirmed'] },
    $or: [
      {
        check_in_date: { $lt: checkOutDate },
        check_out_date: { $gt: checkInDate }
      }
    ]
  };

  // Exclude the current booking if updating
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await this.find(query);
  return overlappingBookings.length === 0;
};

// Method to confirm a pending booking
bookingSchema.methods.confirm = async function() {
  if (this.status !== 'pending') {
    throw new Error('Can only confirm pending bookings');
  }

  // Check if room is still available
  const isAvailable = await this.constructor.isRoomAvailable(
    this.room_id,
    this.check_in_date,
    this.check_out_date,
    this._id
  );

  if (!isAvailable) {
    throw new Error('Room is no longer available for these dates');
  }

  this.status = 'confirmed';
  await this.save();
  return this;
};

// Pre-save middleware to handle dates
bookingSchema.pre('save', function(next) {
  if (this.check_in_date) {
    this.check_in_date.setHours(0, 0, 0, 0);
  }
  if (this.check_out_date) {
    this.check_out_date.setHours(0, 0, 0, 0);
  }
  next();
});

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
