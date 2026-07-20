import QuestionPaper from '../../models/QuestionPaper.js';

// Helper to find a paper for a given request (scoped to user or guest)
export const findPaperForRequest = async (paperId, req) => {
  const query = { _id: paperId };
  if (req.user?.id) {
    // Authenticated users can access their own papers or public guest papers
    query.$or = [{ userId: req.user.id }, { userId: null }];
  } else {
    // Guests can only access guest papers
    query.userId = null;
  }
  return await QuestionPaper.findOne(query);
};

// Formatter to standardize paper object serialization formats
export const formatPaperResponse = (paperInstance) => {
  if (!paperInstance) return null;
  const doc = paperInstance.toObject ? paperInstance.toObject() : paperInstance;
  return {
    id: (doc._id || paperInstance._id).toString(),
    subject: doc.subject,
    class: doc.class,
    totalMarks: doc.totalMarks,
    difficulty: doc.difficulty,
    board: doc.board,
    chapters: doc.chapters,
    topics: doc.topics,
    instructions: doc.instructions,
    pattern: doc.pattern,
    questions: doc.questions,
    solutions: doc.solutions,
    evaluationResult: doc.evaluationResult,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    userId: doc.userId ? doc.userId.toString() : null,
  };
};
