import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [254, 'Email cannot exceed 254 characters'],
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  name: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  apiKey: {
    type: String,
    default: '',
    maxlength: [1024, 'Encrypted API key exceeds maximum length'],
  },
}, {
  timestamps: true,
});

// Index for faster lookups (unique already creates one, but explicit for clarity)
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;
