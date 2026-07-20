import { AI_TIMEOUT } from './shared/apiConfig';
import { httpPost } from './shared/httpClient';

// Generate Question Paper
export const generateQuestionPaper = async (formData: any): Promise<any> => {
  const data = await httpPost(
    '/papers',
    {
      subject: formData.subject,
      class: formData.class,
      totalMarks: Number(formData.totalMarks) || 100,
      difficulty: formData.difficulty,
      board: formData.board,
      chapters: formData.chapters,
      topics: formData.topics || '',
      instructions: formData.instructions || '',
      pattern: formData.pattern,
      customPatternDetails: formData.customPatternDetails || '',
    },
    AI_TIMEOUT,
    'Failed to generate question paper'
  );

  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Generate Solutions
export const generateSolutions = async (paperId: string): Promise<string> => {
  const data = await httpPost<{ solutions: string }>(
    `/papers/${paperId}/solutions`,
    undefined,
    AI_TIMEOUT,
    'Failed to generate solutions'
  );
  return data.solutions;
};

// Evaluate submitted answers
export const evaluateAnswers = async (paperId: string, answers: string[]): Promise<string> => {
  const data = await httpPost<{ evaluationResult: string }>(
    `/papers/${paperId}/evaluate`,
    { answers },
    AI_TIMEOUT,
    'Failed to evaluate answers'
  );
  return data.evaluationResult;
};
