import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters'],
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
    maxlength: [50, 'Class cannot exceed 50 characters'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1'],
    max: [1000, 'Total marks cannot exceed 1000'],
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: {
      values: ['Easy', 'Medium', 'Average', 'Hard'],
      message: 'Difficulty must be Easy, Medium, Average, or Hard',
    },
  },
  board: {
    type: String,
    required: [true, 'Board is required'],
    trim: true,
    maxlength: [100, 'Board cannot exceed 100 characters'],
  },
  chapters: {
    type: [String],
    required: [true, 'At least one chapter is required'],
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0 && arr.length <= 50;
      },
      message: 'Chapters must be an array with 1-50 items',
    },
  },
  topics: {
    type: String,
    default: '',
    maxlength: [2000, 'Topics cannot exceed 2000 characters'],
  },
  instructions: {
    type: String,
    default: '',
    maxlength: [5000, 'Instructions cannot exceed 5000 characters'],
  },
  pattern: {
    type: String,
    required: [true, 'Pattern is required'],
    trim: true,
    maxlength: [200, 'Pattern cannot exceed 200 characters'],
  },
  questions: {
    type: String,
    required: [true, 'Questions content is required'],
  },
  solutions: {
    type: String,
    default: '',
  },
  evaluationResult: {
    type: String,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for common query pattern (user's papers sorted by date)
questionPaperSchema.index({ userId: 1, createdAt: -1 });

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
export default QuestionPaper;
