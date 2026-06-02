import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'mockverse_secret_jwt_key_2026';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Validate ObjectId format to prevent CastError from legacy UUID tokens
      if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
        return res.status(401).json({ message: 'Not authorized, session token format is invalid' });
      }

      // Get user from the database
      const foundUser = await User.findById(decoded.id).select('-password');
      
      if (foundUser) {
        req.user = {
          id: foundUser._id.toString(),
          email: foundUser.email,
          name: foundUser.name,
          createdAt: foundUser.createdAt
        };
      } else {
        req.user = null;
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found, unauthorized' });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
