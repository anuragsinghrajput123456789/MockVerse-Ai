import { useCallback } from 'react';
import { useDownloadQuestionPaperPDF } from '../useDownloadQuestionPaperPDF';

export interface UseQuestionPaperDisplayProps {
  content: string;
  title: string;
  type?: 'question' | 'solution';
  classVal?: string;
  totalMarks?: number;
  difficulty?: string;
  board?: string;
}

export function useQuestionPaperDisplay({
  content,
  title,
  type = 'question',
  classVal,
  totalMarks,
  difficulty,
  board,
}: UseQuestionPaperDisplayProps) {
  const { downloadPDF } = useDownloadQuestionPaperPDF();

  const handleDownloadPDF = useCallback(() => {
    downloadPDF({ content, title, type, classVal, totalMarks, difficulty, board });
  }, [downloadPDF, content, title, type, classVal, totalMarks, difficulty, board]);

  return {
    handleDownloadPDF,
  };
}

export default useQuestionPaperDisplay;
