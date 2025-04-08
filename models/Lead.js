const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'resolved'],
    default: 'new'
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
leadSchema.index({ firstName: 'text', lastName: 'text', email: 'text', message: 'text' });

const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;