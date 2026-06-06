const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
// @desc    Get user profile
// @route   GET /api/users/login
// @access  Public

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const userRegister = async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // basic validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required' });
    }

    // normalize email
    email = String(email).trim().toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('userRegister error:', error);
    if (res.headersSent) return;
    res.status(500).json({ message: error.message });
  }
};
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: 'Not authorized, no user attached to request' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ message: error.message });
  }
};
const getUsers = async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.status(200).json(user);
    } else {
      return res.status(404).json({
        message: 'User not found',
      });
    }
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ message: error.message });
  }
};
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'User removed' });
    l;
  } else {
    return res.status(404).json({
      message: 'User not found',
    });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      res
        .status(401)
        .json({ message: 'Not authorized, no user attached to request' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('getUserProfile error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @access Private/Admin
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('updateUserbyAdmin error:', error);
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  authUser,
  getUserProfile,
  updateUserProfile,
  userRegister,
  getUsers,
  deleteUser,
  getUserById,
  updateUserByAdmin,
};
