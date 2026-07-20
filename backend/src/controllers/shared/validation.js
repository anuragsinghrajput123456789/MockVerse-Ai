import mongoose from 'mongoose';

// Validates parameters for generating a question paper
export const validateGeneratePaperInput = (body) => {
  const { subject, class: studentClass, chapters } = body;

  if (!subject || !studentClass || !chapters || !Array.isArray(chapters) || chapters.length === 0) {
    return { isValid: false, message: 'Subject, class, and chapters (non-empty array) are required.' };
  }

  // Length guards
  if (String(subject).length > 200) {
    return { isValid: false, message: 'Subject name is too long.' };
  }
  if (chapters.length > 50) {
    return { isValid: false, message: 'Too many chapters selected (max 50).' };
  }

  return { isValid: true };
};

// Validates answers parameter for evaluation
export const validateEvaluateAnswersInput = (body) => {
  const { answers } = body;

  if (!answers || !Array.isArray(answers)) {
    return { isValid: false, message: 'Answers array is required.' };
  }

  if (answers.length > 200) {
    return { isValid: false, message: 'Too many answers submitted (max 200).' };
  }

  return { isValid: true };
};

// Validates parameters for chatbot interactions
export const validateChatbotInput = (body) => {
  const { message } = body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return { isValid: false, message: 'Message is required.' };
  }

  return { isValid: true };
};

// Validates if an identifier string is a valid MongoDB ObjectId
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};
