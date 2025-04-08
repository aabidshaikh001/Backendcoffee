const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

// Get all leads
router.get('/', leadController.getAllLeads);

// Update lead status
router.put('/:id', leadController.updateLeadStatus);

// Delete a lead
router.delete('/:id', leadController.deleteLead);

// Create a new lead (for contact form submission)
router.post('/', leadController.createLead);

module.exports = router;