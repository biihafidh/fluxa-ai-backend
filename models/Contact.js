const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: String,
  businessType: String,
  message: String,
  status: {
    type: String,
    enum: ['new', 'contacted', 'scheduled', 'completed'],
    default: 'new'
  },
  source: {
    type: String,
    default: 'website'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contact', contactSchema);
