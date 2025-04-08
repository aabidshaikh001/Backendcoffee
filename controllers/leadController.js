const mongoose = require('mongoose');
const Lead = require('../models/Lead');

// Get all leads
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Failed to fetch leads' });
  }
};

// controllers/leadController.js
exports.updateLeadStatus = async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Validate ID exists and is valid
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
          message: 'Invalid lead ID',
          receivedId: id // This helps debugging
        });
      }
  
      // Validate status
      const validStatuses = ['new', 'contacted', 'resolved'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          message: 'Invalid status value',
          validStatuses
        });
      }
  
      const updatedLead = await Lead.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );
  
      if (!updatedLead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
  
      res.json(updatedLead);
    } catch (error) {
      console.error('Error updating lead status:', error);
      res.status(500).json({ 
        message: 'Failed to update lead status',
        error: error.message 
      });
    }
  };
// Delete a lead
exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }

    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newLead = new Lead({
      firstName,
      lastName,
      email,
      phone,
      message
    });

    await newLead.save();
    res.status(201).json(newLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};