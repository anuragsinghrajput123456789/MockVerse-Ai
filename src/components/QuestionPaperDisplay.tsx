import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
}

const QuestionPaperDisplay: React.FC<QuestionPaperDisplayProps> = ({
  content,
  title,
  type = 'question',
  onGenerateSolutions,
  onStartAnswering,
  loading
}) => {
  const { downloadPDF } = useDownloadQuestionPaperPDF();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <QuestionPaperHeader
        title={title}
        type={type}
        loading={loading}
        onGenerateSolutions={onGenerateSolutions}
        onStartAnswering={onStartAnswering}
        onDownloadPDF={() => downloadPDF({ content, title, type })}
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
