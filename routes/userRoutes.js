const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin, isOwnerOrAdmin } = require('../middleware/auth');

// Admin routes
router.get('/', authenticate, isAdmin, userController.getAllUsers);
router.get('/:id', authenticate, isAdmin, userController.getUserById);
router.delete('/:id', authenticate, isAdmin, userController.deleteUser);

// User routes
router.put('/:id', authenticate, isOwnerOrAdmin, userController.updateUser);
router.put('/:id/change-password', authenticate, isOwnerOrAdmin, userController.changePassword);

module.exports = router;

