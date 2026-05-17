const express = require('express');
const router = express.Router();
const {
  authUser,
  getUserProfile,
  updateUserProfile,
  userRegister,
  getUsers,
  deleteUser,
} = require('../controller/userController');
const { protect, admin } = require('../middleware/authMiddleware');
router.post('/', userRegister);
router.post('/login', authUser);
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.route('/').get(protect, admin, getUsers);
router.route('/:id').delete(protect, admin, deleteUser);
module.exports = router;
