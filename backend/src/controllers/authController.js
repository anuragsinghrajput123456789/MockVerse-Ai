import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mockverse_secret_jwt_key_2026';

// AES-256-CBC encryption for API keys
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.JWT_SECRET || 'mockverse_secret_jwt_key_2026').digest();
const IV_LENGTH = 16;

const encryptApiKey = (text) => {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt API key');
  }
};

const decryptApiKey = (text) => {
  try {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt API key');
  }
};

const maskApiKey = (key) => {
  if (!key || key.length < 8) return '••••••••';
  return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4);
};

// Validation helpers
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
};

const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= MIN_PASSWORD_LENGTH && password.length <= MAX_PASSWORD_LENGTH;
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password.' });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: `Password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
      });
    }

    const sanitizedName = name ? String(name).trim().substring(0, 100) : '';

    // Check if user already exists
    const userExists = await User.findOne({ email: sanitizedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        hasApiKey: false,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data.' });
    }
  } catch (error) {
    console.error('Signup error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }

    res.status(500).json({ message: 'Server error during signup.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password.' });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail });

    // Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        hasApiKey: !!(user.apiKey),
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      hasApiKey: !!(user.apiKey),
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// @desc    Save user's Gemini API key (encrypted)
// @route   PUT /api/auth/api-key
// @access  Private
export const saveApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return res.status(400).json({ message: 'API key is required.' });
    }

    const trimmedKey = apiKey.trim();

    if (trimmedKey.length > 256) {
      return res.status(400).json({ message: 'API key is too long.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Encrypt and save
    user.apiKey = encryptApiKey(trimmedKey);
    await user.save();

    res.json({
      message: 'API key saved successfully.',
      maskedKey: maskApiKey(trimmedKey),
      hasApiKey: true,
    });
  } catch (error) {
    console.error('Save API key error:', error);
    res.status(500).json({ message: 'Server error saving API key.' });
  }
};

// @desc    Get user's masked API key
// @route   GET /api/auth/api-key
// @access  Private
export const getApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.apiKey) {
      return res.json({ hasApiKey: false, maskedKey: null });
    }

    try {
      const decrypted = decryptApiKey(user.apiKey);
      res.json({
        hasApiKey: true,
        maskedKey: maskApiKey(decrypted),
      });
    } catch (decryptError) {
      // If decryption fails (e.g., key was corrupted), report as no key
      console.error('Failed to decrypt stored API key:', decryptError);
      res.json({ hasApiKey: false, maskedKey: null });
    }
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({ message: 'Server error fetching API key.' });
  }
};

// @desc    Delete user's stored API key
// @route   DELETE /api/auth/api-key
// @access  Private
export const deleteApiKey = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.apiKey = '';
    await user.save();

    res.json({
      message: 'API key removed successfully.',
      hasApiKey: false,
    });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ message: 'Server error deleting API key.' });
  }
};

// Export the decrypt function for use in paperController
export { decryptApiKey };
