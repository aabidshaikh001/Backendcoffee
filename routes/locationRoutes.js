const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController.js');

// Public routes
router.get('/', locationController.getAllLocations);
router.get('/featured', locationController.getFeaturedLocations);
router.get('/:id', locationController.getLocationById);

// Protected routes
router.post('/',   locationController.createLocation);
router.put('/:id',  locationController.updateLocation);
router.delete('/:id',  locationController.deleteLocation);

module.exports = router;

