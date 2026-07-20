import React from 'react';
import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import PrintButton from './PrintButton';

interface QuestionToolbarProps {
  title: string;
  onDownloadPDF: () => void;
  loadingPdf?: boolean;
}

export const QuestionToolbar: React.FC<QuestionToolbarProps> = ({
  title,
  onDownloadPDF,
  loadingPdf
}) => {
  return (
    <div className="flex flex-wrap gap-2.5">
      <DownloadButton onClick={onDownloadPDF} loading={loadingPdf} />
      <PrintButton />
      <ShareButton title={title} />
    </div>
  );
};

export default QuestionToolbar;
