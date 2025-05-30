const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  // Add toJSON transform to hide password in responses
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Pre-save hook for validation
userSchema.pre('save', function(next) {
  // Only validate on new documents
  if (this.isNew) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      next(new Error('Invalid email format'));
    }
  }
  next();
});

// Create the model only if it hasn't been created
module.exports = mongoose.models.User || mongoose.model('User', userSchema);