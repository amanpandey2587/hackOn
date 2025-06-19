const express = require('express');
const router = express.Router();

const {
    createProfile,
    updateAvatar,
    deleteProfile,
    updateProfile,
    getProfile
} = require('../controllers/UserProfile');

// Routes

// Get user profile
router.get('/profile', getProfile);

// Create new user profile
router.post('/profile', createProfile);

// Update profile (full update)
router.put('/profile', updateProfile);

// Update only avatar
router.patch('/profile/avatar', updateAvatar);

// Delete user profile
router.delete('/profile', deleteProfile);

export default router;
