import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'mockverse_secret_jwt_key_2026';

export const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, token is empty' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Not authorized, token has expired. Please log in again.' });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Not authorized, token is malformed or invalid.' });
      }
      return res.status(401).json({ message: 'Not authorized, token verification failed.' });
    }

    // Validate ObjectId format to prevent CastError from legacy UUID tokens
    if (!decoded.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      return res.status(401).json({ message: 'Not authorized, session token format is invalid.' });
    }

    // Get user from the database
    const foundUser = await User.findById(decoded.id).select('-password');

    if (!foundUser) {
      return res.status(401).json({ message: 'User not found, unauthorized.' });
    }

    req.user = {
      id: foundUser._id.toString(),
      email: foundUser.email,
      name: foundUser.name,
      createdAt: foundUser.createdAt,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};
