import { useState, useCallback } from 'react';
import { QuestionPaper } from '../../shared/types';

export function useQuestionPaper() {
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');

  const clearPaperState = useCallback(() => {
    setCurrentPaper(null);
    setSolutions('');
    setEvaluationResult('');
  }, []);

  const selectPaper = useCallback((paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setSolutions(paper.solutions || '');
    setEvaluationResult(paper.evaluationResult || '');
  }, []);

  return {
    currentPaper,
    setCurrentPaper,
    solutions,
    setSolutions,
    evaluationResult,
    setEvaluationResult,
    clearPaperState,
    selectPaper
  };
}

export default useQuestionPaper;
