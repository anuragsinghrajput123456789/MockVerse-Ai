import mongoose from 'mongoose';

const questionPaperSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  board: {
    type: String,
    required: true
  },
  chapters: {
    type: [String],
    required: true
  },
  topics: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: ''
  },
  pattern: {
    type: String,
    required: true
  },
  questions: {
    type: String,
    required: true
  },
  solutions: {
    type: String,
    default: ''
  },
  evaluationResult: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
export default QuestionPaper;
