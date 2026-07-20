import React from 'react';
import QuestionHeader from './QuestionHeader';
import QuestionContent from './QuestionContent';
import QuestionActions from './QuestionActions';
import QuestionToolbar from './QuestionToolbar';
import QuestionFooter from './QuestionFooter';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { useQuestionPaperDisplay } from './useQuestionPaperDisplay';

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

export const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({
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
  const { handleDownloadPDF } = useQuestionPaperDisplay({
    content,
    title,
    type,
    classVal,
    totalMarks,
    difficulty,
    board
  });

  if (!content && !loading) {
    return <EmptyState />;
  }

  return (
    <div className="glass-card rounded-2xl border border-white/5 shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-white/5 px-6 py-5 border-b border-white/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <QuestionHeader title={title} type={type} />
          
          <div className="flex flex-wrap items-center gap-3">
            <QuestionToolbar
              title={title}
              onDownloadPDF={handleDownloadPDF}
            />
            
            <QuestionActions
              type={type}
              loading={loading}
              onGenerateSolutions={onGenerateSolutions}
              onStartAnswering={onStartAnswering}
            />
          </div>
        </div>
      </div>
      
      {loading && !content ? (
        <LoadingState />
      ) : (
        <QuestionContent content={content || ''} type={type} />
      )}
      
      <QuestionFooter
        classVal={classVal}
        totalMarks={totalMarks}
        difficulty={difficulty}
        board={board}
      />
    </div>
  );
};

export default QuestionPaperDisplay;
