import React from 'react';
import QuestionPaperMarkdownContent from '../QuestionPaperMarkdownContent';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return <QuestionPaperMarkdownContent content={content} />;
};

export default MarkdownRenderer;
