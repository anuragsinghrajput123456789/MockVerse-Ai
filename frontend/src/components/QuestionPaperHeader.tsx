
import React from "react";

interface QuestionPaperHeaderProps {
  title: string;
  type: "question" | "solution";
  loading?: boolean;
  onGenerateSolutions?: () => void;
  onStartAnswering?: () => void;
  onDownloadPDF?: () => void;
}

const QuestionPaperHeader: React.FC<QuestionPaperHeaderProps> = ({
  title,
  type,
  loading,
  onGenerateSolutions,
  onStartAnswering,
  onDownloadPDF
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {type === 'question' ? 'Question Paper' : 'Solutions'} • Generated on {new Date().toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onDownloadPDF}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          {onGenerateSolutions && type === 'question' && (
            <button
              onClick={onGenerateSolutions}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loading ? 'Generating...' : 'Generate Solutions'}
            </button>
          )}
          {onStartAnswering && type === 'question' && (
            <button
              onClick={onStartAnswering}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all text-sm font-medium flex items-center gap-2 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Answering
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperHeader;
