const express = require('express');
const Client = require('../models/Client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get client profile
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.params.userId });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
});

// Create client profile
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { userId, businessName, industry, website, location, plan } = req.body;

    if (!userId || !businessName) {
      return res.status(400).json({ message: 'userId and businessName required' });
    }

    const existingClient = await Client.findOne({ userId });
    if (existingClient) {
      return res.status(400).json({ message: 'Client profile already exists' });
    }

    const client = new Client({
      userId,
      businessName,
      industry,
      website,
      location,
      plan
    });

    await client.save();
    res.status(201).json({
      message: 'Client profile created',
      client
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating client', error: err.message });
  }
});

// Update client profile
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating client', error: err.message });
  }
});

// Get client dashboard data
router.get('/dashboard/:clientId', authMiddleware, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json({
      businessName: client.businessName,
      plan: client.plan,
      automationStatus: client.automationStatus,
      metrics: {
        leads: client.leadCapture.monthlyLeads,
        qualified: client.leadCapture.qualifiedLeads,
        workflows: client.automationMetrics.workflowsActive,
        hoursSkipped: client.automationMetrics.hoursSkipped
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard', error: err.message });
  }
});

module.exports = router;
