const express = require('express');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all leads for a client
router.get('/:clientId', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { clientId: req.params.clientId };
    if (status) query.status = status;

    const leads = await Lead.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leads', error: err.message });
  }
});

// Create a new lead
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clientId, firstName, lastName, email, phone, company, industry, source } = req.body;

    if (!clientId || !email) {
      return res.status(400).json({ message: 'clientId and email required' });
    }

    const lead = new Lead({
      clientId,
      firstName,
      lastName,
      email,
      phone,
      company,
      industry,
      source
    });

    await lead.save();

    // Update client lead metrics
    await Client.findByIdAndUpdate(
      clientId,
      { $inc: { 'leadCapture.monthlyLeads': 1 } }
    );

    res.status(201).json({
      message: 'Lead created successfully',
      lead
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating lead', error: err.message });
  }
});

// Get lead by ID
router.get('/detail/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo');
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lead', error: err.message });
  }
});

// Update lead
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({
      message: 'Lead updated successfully',
      lead
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating lead', error: err.message });
  }
});

// Score lead based on engagement
router.post('/:id/score', authMiddleware, async (req, res) => {
  try {
    const { score } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { score: Math.min(100, Math.max(0, score)) },
      { new: true }
    );
    res.json({ message: 'Lead scored', lead });
  } catch (err) {
    res.status(500).json({ message: 'Error scoring lead', error: err.message });
  }
});

module.exports = router;
