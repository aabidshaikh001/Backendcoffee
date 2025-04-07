const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.get('/me', authController.getCurrentUser);
router.post('/register',  authController.register);

module.exports = router;

