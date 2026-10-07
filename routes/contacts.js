const express = require('express');
const Contact = require('../models/Contact');

const router = express.Router();

// Submit contact form (public endpoint)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, businessType, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      businessType,
      message,
      source: 'website'
    });

    await contact.save();

    res.status(201).json({
      message: 'Contact form submitted successfully',
      contact
    });
  } catch (err) {
    res.status(500).json({ message: 'Error submitting contact form', error: err.message });
  }
});

// Get all contacts (admin only)
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contacts', error: err.message });
  }
});

module.exports = router;
