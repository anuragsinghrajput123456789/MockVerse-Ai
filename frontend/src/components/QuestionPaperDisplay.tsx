import React from 'react';
import QuestionPaperHeader from "./QuestionPaperHeader";
import QuestionPaperMarkdownContent from "./QuestionPaperMarkdownContent";
import { useDownloadQuestionPaperPDF } from '../hooks/useDownloadQuestionPaperPDF';

interface QuestionPaperDisplayProps {
  content: string;
  title: string;
  type?: 'question' | 'solution';
  onGenerateSolutions?: () => void;
  onStartAnswering?: () => void;
  loading?: boolean;
  classVal?: string;
  totalMarks?: number;
  difficulty?: string;
  board?: string;
}

const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({
  content,
  title,
  type = 'question',
  onGenerateSolutions,
  onStartAnswering,
  loading,
  classVal,
  totalMarks,
  difficulty,
  board
}) => {
  const { downloadPDF } = useDownloadQuestionPaperPDF();

  return (
    <div className="glass-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-fade-in">
      <QuestionPaperHeader
        title={title}
        type={type}
        loading={loading}
        onGenerateSolutions={onGenerateSolutions}
        onStartAnswering={onStartAnswering}
        onDownloadPDF={() => downloadPDF({ content, title, type, classVal, totalMarks, difficulty, board })}
      />
      <div className="p-6">
        <div id={`${type}-paper-content`}>
          <QuestionPaperMarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperDisplay;
