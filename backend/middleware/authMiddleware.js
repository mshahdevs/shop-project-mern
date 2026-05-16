const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
  let token;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'User not found',
        });
      }

      req.user = user;
      return next();
    }

    return res.status(401).json({
      message: 'No token provided',
    });
  } catch (error) {
    console.error('AUTH ERROR:', error.message);

    return res.status(401).json({
      message: 'Token failed or expired',
    });
  }
};

module.exports = { protect };
