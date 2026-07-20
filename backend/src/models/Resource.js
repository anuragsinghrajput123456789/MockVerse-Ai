import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [150, 'Resource title cannot exceed 150 characters'],
  },
  type: {
    type: String,
    required: [true, 'Resource type is required'],
    enum: [
      'YouTube Video',
      'Video Lecture',
      'Video',
      'Blog Article',
      'Article/Blog',
      'Blog',
      'Article',
      'Blog Post',
      'Documentation',
      'Docs',
      'PDF',
      'Textbook/PDF',
      'PDF Sheet',
      'GitHub Repository',
      'GitHub',
      'Repo',
      'Course',
      'Course / Tutorial',
      'Tutorial',
      'Website',
      'Web',
      'Book',
      'E-Book',
      'Notes',
      'Cheat Sheet',
      'Practice Platform',
      'Research Paper',
      'Other'
    ],
  },
  url: {
    type: String,
    required: [true, 'Resource URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(v);
      },
      message: props => `${props.value} is not a valid HTTP/HTTPS URL!`
    }
  },
  description: {
    type: String,
    required: [true, 'One line description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters'],
  },
  notes: {
    type: String,
    default: '',
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },
  tags: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  estimatedTime: {
    type: String,
    default: '',
    trim: true,
    maxlength: [50, 'Estimated learning time cannot exceed 50 characters'],
  },
  subject: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters'],
  },
  chapter: {
    type: String,
    default: '',
    trim: true,
    maxlength: [100, 'Chapter cannot exceed 100 characters'],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  resourceSheet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ResourceSheet',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Auto-normalize category aliases before validation
resourceSchema.pre('validate', function(next) {
  if (this.type) {
    const t = this.type.trim();
    if (['Blog', 'Article', 'Article/Blog', 'Blog Post'].includes(t)) {
      this.type = 'Blog Article';
    } else if (['Video', 'YouTube', 'YouTube Video', 'Video Lecture'].includes(t)) {
      this.type = 'YouTube Video';
    } else if (['GitHub', 'Repo', 'GitHub Repository'].includes(t)) {
      this.type = 'GitHub Repository';
    } else if (['PDF', 'Textbook/PDF', 'PDF Sheet', 'PDF Sheet / Exam Set'].includes(t)) {
      this.type = 'PDF';
    } else if (['Course', 'Course / Tutorial', 'Tutorial'].includes(t)) {
      this.type = 'Course';
    }
  }
  next();
});

// Indexes for query performance optimization
resourceSchema.index({ resourceSheet: 1, createdAt: -1 });
resourceSchema.index({ user: 1, createdAt: -1 });

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
