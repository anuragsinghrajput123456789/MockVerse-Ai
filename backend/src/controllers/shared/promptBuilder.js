/**
 * Builds standard prompts for the Gemini model interactions.
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
  return `Generate a complete ${subject} question paper for class ${studentClass}.

Chapters: ${chapters.join(', ')}${topics ? `\nFocus topics: ${String(topics).substring(0, 2000)}` : ''}

Total marks: ${totalMarks || 100}
Difficulty: ${difficulty || 'Medium'}
Board: ${board || 'NCERT'}
Pattern: ${pattern || 'Board-style'}${pattern === 'Custom' && customPatternDetails ? `\nCustom pattern: ${String(customPatternDetails).substring(0, 2000)}` : ''}${instructions ? `\nAdditional instructions: ${String(instructions).substring(0, 5000)}` : ''}

Format the paper with:
- Header with subject, class, time, and total marks
- Clear section divisions
- Proper question numbering
- Mark allocation for each question
- Instructions for students

Generate ALL questions to meet the total marks. No placeholders or summaries. The paper must be complete and exam-ready. Use markdown formatting.`;
};

export const buildEvaluateAnswersPrompt = (questions, answers) => {
  return `Evaluate the following answers for the given question paper and provide marks and detailed feedback. The answers are provided in a list where each element corresponds to a question.

Question Paper:
${questions}

Answers:
${answers.map((ans, i) => `Answer for Q${i + 1}: ${String(ans).substring(0, 10000)}`).join('\n')}

Please provide:
1. A total score.
2. Question-by-question feedback.
3. An overall summary.
Make it structured and easy to read.`;
};

export const buildGenerateSolutionsPrompt = (questions) => {
  return `Generate detailed solutions for the following question paper. Provide step-by-step solutions with explanations:

${questions}

Format solutions with:
- Question number references
- Step-by-step working
- Clear explanations
- Final answers highlighted
- Alternative methods where applicable`;
};

export const buildChatbotPrompt = (contextPrompt, historyPrompt, message) => {
  return `You are an AI educational assistant helping students with their studies. 
${contextPrompt}
Here is the previous conversation history:
${historyPrompt}Student's current question: ${message}
 
Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;
};
