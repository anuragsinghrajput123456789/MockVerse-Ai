import React from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface QuestionContentProps {
  content: string;
  type: string;
}

export const QuestionContent: React.FC<QuestionContentProps> = ({ content, type }) => {
  return (
    <div className="p-6">
      <div id={`${type}-paper-content`}>
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

export default QuestionContent;
