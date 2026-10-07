const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['lead-capture', 'follow-up', 'support', 'marketing', 'operations'],
    required: true
  },
  trigger: {
    type: String,
    enum: ['form-submission', 'lead-created', 'time-based', 'webhook', 'manual']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'archived'],
    default: 'draft'
  },
  steps: [{
    action: String,
    config: mongoose.Schema.Types.Mixed
  }],
  successRate: {
    type: Number,
    default: 0
  },
  lastRun: Date,
  totalRuns: {
    type: Number,
    default: 0
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

module.exports = mongoose.model('Workflow', workflowSchema);
