const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true
  },
  phone: String,
  company: String,
  industry: String,
  source: {
    type: String,
    enum: ['website', 'form', 'email', 'whatsapp', 'manual', 'api'],
    default: 'website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiating', 'closed', 'lost'],
    default: 'new'
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String],
  customFields: mongoose.Schema.Types.Mixed,
  lastContactedAt: Date,
  nextFollowUp: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Lead', leadSchema);
