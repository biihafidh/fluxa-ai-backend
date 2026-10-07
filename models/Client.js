const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true
  },
  industry: String,
  website: String,
  location: String,
  plan: {
    type: String,
    enum: ['Launch', 'Growth Suite', 'Business OS'],
    default: 'Launch'
  },
  monthlyRevenue: Number,
  teamSize: Number,
  automationStatus: {
    type: String,
    enum: ['onboarding', 'active', 'paused', 'cancelled'],
    default: 'onboarding'
  },
  integrations: [{
    type: String,
    enum: ['crm', 'email', 'whatsapp', 'slack', 'zapier']
  }],
  leadCapture: {
    enabled: { type: Boolean, default: false },
    monthlyLeads: { type: Number, default: 0 },
    qualifiedLeads: { type: Number, default: 0 }
  },
  automationMetrics: {
    workflowsActive: { type: Number, default: 0 },
    tasksAutomated: { type: Number, default: 0 },
    hoursSkipped: { type: Number, default: 0 }
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

module.exports = mongoose.model('Client', clientSchema);
