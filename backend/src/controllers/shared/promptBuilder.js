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
  const cleanTopics = topics ? `\nFocus Topics: ${String(topics).substring(0, 500)}` : '';
  const cleanInstruct = instructions ? `\nSpecific Instructions: ${String(instructions).substring(0, 500)}` : '';
  const cleanCustomPattern = pattern === 'Custom' && customPatternDetails ? ` (${String(customPatternDetails).substring(0, 400)})` : '';

  return `You are a master academic examiner. Generate a complete, high-quality ${subject} exam question paper for Class ${studentClass || 'N/A'}.
Board: ${board || 'Standard'} | Total Marks: ${totalMarks || 100} | Difficulty: ${difficulty || 'Medium'} | Pattern: ${pattern || 'Board-style'}${cleanCustomPattern}
Syllabus / Chapters: ${chapters.join(', ')}${cleanTopics}${cleanInstruct}

CRITICAL GENERATION RULES:
1. COMPLETE PAPER: You MUST write out EVERY SINGLE QUESTION in full from start to finish. NEVER stop midway, truncate, summarize, or leave placeholder comments like "(Questions continue...)".
2. SECTION STRUCTURE: Organize the exam paper logically into standard sections (e.g., Section A: Objective/MCQs, Section B: Short Answer, Section C: Long Answer, Section D/E: Case Studies/Detailed Problems) appropriate for ${board || 'Board'} exam standards.
3. MARKS DISTRIBUTION: State marks for each question clearly in brackets like [1 Mark], [2 Marks], [3 Marks], [5 Marks], ensuring the sum of all question marks equals exactly ${totalMarks || 100} Marks.
4. FORMATTING: Use clean Markdown formatting with clear section titles, bold numbered questions, and options for MCQs.`;
};

export const buildEvaluateAnswersPrompt = (questions, answers) => {
  const truncatedQuestions = String(questions).substring(0, 10000);
  const formattedAnswers = answers
    .slice(0, 60)
    .map((ans, i) => `Q${i + 1}: ${String(ans).substring(0, 1000)}`)
    .join('\n');

  return `Evaluate student answers against the exam paper below.

Exam Paper:
${truncatedQuestions}

Student Answers:
${formattedAnswers}

Output Format:
1. Score Summary (Earned / Total Marks)
2. Itemized Question Feedback (Marks awarded + constructive notes for each question)
3. Key Strengths & Areas for Improvement`;
};

export const buildGenerateSolutionsPrompt = (questions) => {
  const truncatedQuestions = String(questions).substring(0, 12000);

  return `Generate step-by-step worked solutions for every question in this exam paper:

${truncatedQuestions}

Format:
- Question Number Header (e.g. ### Question 1)
- Clear step-by-step mathematical/conceptual solution
- Final Answer highlighted in bold`;
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

