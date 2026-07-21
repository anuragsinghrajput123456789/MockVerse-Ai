/**
 * Builds compressed, token-optimized prompts for Gemini model interactions.
 */

export const buildGeneratePaperPrompt = ({
  subject,
  studentClass,
  chapters,
  topics,
  totalMarks,
  difficulty,
  board,
  pattern,
  customPatternDetails,
  instructions,
}) => {
  const cleanTopics = topics ? `\nFocus Topics: ${String(topics).substring(0, 300)}` : '';
  const cleanInstruct = instructions ? `\nInstructions: ${String(instructions).substring(0, 400)}` : '';
  const cleanCustomPattern = pattern === 'Custom' && customPatternDetails ? ` (${String(customPatternDetails).substring(0, 300)})` : '';

  return `Generate a complete ${subject} exam paper for Class ${studentClass || 'N/A'}.
Board: ${board || 'Standard'} | Marks: ${totalMarks || 100} | Difficulty: ${difficulty || 'Medium'} | Pattern: ${pattern || 'Board-style'}${cleanCustomPattern}
Chapters: ${chapters.join(', ')}${cleanTopics}${cleanInstruct}

Requirements:
- Exam Header (Subject, Class, Marks, Time)
- Clear numbered sections with mark distribution
- Full exam-ready questions matching total marks without filler text
- Clean Markdown formatting`;
};

export const buildEvaluateAnswersPrompt = (questions, answers) => {
  const truncatedQuestions = String(questions).substring(0, 3500);
  const formattedAnswers = answers
    .slice(0, 50)
    .map((ans, i) => `Q${i + 1}: ${String(ans).substring(0, 400)}`)
    .join('\n');

  return `Evaluate student answers against the exam paper below.

Exam Paper:
${truncatedQuestions}

Student Answers:
${formattedAnswers}

Output Format:
1. Score (Earned / Total)
2. Itemized Question Feedback (Marks + constructive notes)
3. Summary & Key Improvements`;
};

export const buildGenerateSolutionsPrompt = (questions) => {
  const truncatedQuestions = String(questions).substring(0, 4000);

  return `Generate step-by-step worked solutions for this exam paper:

${truncatedQuestions}

Format:
- Question Number Header
- Step-by-step working
- Final answer in bold`;
};

export const buildChatbotPrompt = (contextPrompt, historyPrompt, message) => {
  const compressedContext = contextPrompt ? String(contextPrompt).substring(0, 1200) : '';
  const compressedHistory = historyPrompt ? String(historyPrompt).substring(0, 800) : '';

  return `You are MockVerse AI, an encouraging academic study tutor.
${compressedContext}
${compressedHistory}
Student Question: ${String(message).substring(0, 800)}

Guidelines:
- Clear, direct academic explanation
- Concise Markdown formatting`;
};

