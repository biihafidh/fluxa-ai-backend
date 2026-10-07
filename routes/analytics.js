const express = require('express');
const Lead = require('../models/Lead');
const Workflow = require('../models/Workflow');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get lead analytics for a client
router.get('/leads/:clientId', authMiddleware, async (req, res) => {
  try {
    const leads = await Lead.find({ clientId: req.params.clientId });
    
    const total = leads.length;
    const byStatus = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      closed: leads.filter(l => l.status === 'closed').length,
      lost: leads.filter(l => l.status === 'lost').length
    };
    const avgScore = Math.round(
      leads.reduce((sum, l) => sum + l.score, 0) / Math.max(1, total)
    );
    const conversionRate = total > 0 ? 
      Math.round((byStatus.closed / total) * 100) : 0;

    res.json({
      total,
      byStatus,
      avgScore,
      conversionRate,
      trend: 'up' // Placeholder
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

// Get workflow performance analytics
router.get('/workflows/:clientId', authMiddleware, async (req, res) => {
  try {
    const workflows = await Workflow.find({ clientId: req.params.clientId });
    
    const active = workflows.filter(w => w.status === 'active').length;
    const totalRuns = workflows.reduce((sum, w) => sum + w.totalRuns, 0);
    const avgSuccessRate = Math.round(
      workflows.reduce((sum, w) => sum + w.successRate, 0) / Math.max(1, workflows.length)
    );

    res.json({
      total: workflows.length,
      active,
      totalRuns,
      avgSuccessRate,
      workflows
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching workflow analytics', error: err.message });
  }
});

module.exports = router;
