const express = require('express');
const Workflow = require('../models/Workflow');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all workflows for a client
router.get('/:clientId', authMiddleware, async (req, res) => {
  try {
    const workflows = await Workflow.find({ clientId: req.params.clientId })
      .sort({ createdAt: -1 });
    res.json(workflows);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workflows', error: err.message });
  }
});

// Create a new workflow
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { clientId, name, description, type, trigger, steps } = req.body;

    if (!clientId || !name || !type) {
      return res.status(400).json({ message: 'clientId, name, and type required' });
    }

    const workflow = new Workflow({
      clientId,
      name,
      description,
      type,
      trigger,
      steps
    });

    await workflow.save();

    res.status(201).json({
      message: 'Workflow created successfully',
      workflow
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating workflow', error: err.message });
  }
});

// Activate workflow
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    res.json({ message: 'Workflow activated', workflow });
  } catch (err) {
    res.status(500).json({ message: 'Error activating workflow', error: err.message });
  }
});

// Pause workflow
router.post('/:id/pause', authMiddleware, async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { status: 'paused' },
      { new: true }
    );
    res.json({ message: 'Workflow paused', workflow });
  } catch (err) {
    res.status(500).json({ message: 'Error pausing workflow', error: err.message });
  }
});

module.exports = router;
