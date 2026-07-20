/**
 * Builds compressed, optimized prompts for Gemini model interactions.
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
  return `Generate a complete ${subject} exam paper for Class/Grade: ${studentClass || 'N/A'}.

Target Exam/Board: ${board || 'Standard'}
Total Marks: ${totalMarks || 100}
Difficulty: ${difficulty || 'Medium'}
Pattern: ${pattern || 'Board-style'}${pattern === 'Custom' && customPatternDetails ? ` (${String(customPatternDetails).substring(0, 1000)})` : ''}
Chapters: ${chapters.join(', ')}${topics ? `\nFocus Topics: ${String(topics).substring(0, 1000)}` : ''}${instructions ? `\nSpecial Instructions: ${String(instructions).substring(0, 2000)}` : ''}

Output Requirements:
- Title Header (Subject, Class, Time Allowed, Total Marks)
- Structured section divisions with question numbers & mark allocations
- Complete exam-ready questions matching total marks without placeholders
- Clean Markdown formatting`;
};

export const buildEvaluateAnswersPrompt = (questions, answers) => {
  const truncatedQuestions = String(questions).substring(0, 8000);
  const formattedAnswers = answers
    .map((ans, i) => `Q${i + 1}: ${String(ans).substring(0, 2000)}`)
    .join('\n');

  return `Evaluate student answers against the exam paper below.

Exam Paper:
${truncatedQuestions}

Student Answers:
${formattedAnswers}

Output Format:
1. Total Score (Earned / Total)
2. Itemized Question Feedback (Marks awarded + constructive hints)
3. Summary & Strengths / Areas for Improvement`;
};

export const buildGenerateSolutionsPrompt = (questions) => {
  const truncatedQuestions = String(questions).substring(0, 10000);

  return `Generate step-by-step worked solutions for the following exam paper:

${truncatedQuestions}

Format:
- Solution header for each Question Number
- Step-by-step mathematical or logical working
- Final answer highlighted in bold`;
};

export const buildChatbotPrompt = (contextPrompt, historyPrompt, message) => {
  const compressedContext = contextPrompt ? String(contextPrompt).substring(0, 4000) : '';
  const compressedHistory = historyPrompt ? String(historyPrompt).substring(0, 2000) : '';

  return `You are MockVerse AI, an encouraging academic study tutor.
${compressedContext}
${compressedHistory}
Student Question: ${String(message).substring(0, 2000)}

Response Guidelines:
- Direct, clear, educational explanation
- Use concise Markdown and step-by-step formatting`;
};
