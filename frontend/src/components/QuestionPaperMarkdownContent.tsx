
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QuestionPaperMarkdownContentProps {
  content: string;
}

const QuestionPaperMarkdownContent: React.FC<QuestionPaperMarkdownContentProps> = ({ content }) => {
  return (
    <div className="prose prose-lg max-w-none dark:prose-invert">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => (
            <h1 className="text-2xl font-bold text-center border-b-2 border-gray-300 dark:border-gray-600 pb-3 mb-6 text-gray-900 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="text-xl font-bold text-center border-b border-gray-200 dark:border-gray-600 pb-2 mb-4 text-gray-800 dark:text-gray-100">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              {children}
            </h3>
          ),
          p: ({children}) => (
            <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-justify">
              {children}
            </p>
          ),
          ol: ({children}) => (
            <ol className="list-decimal list-outside space-y-4 ml-6 mb-6">
              {children}
            </ol>
          ),
          ul: ({children}) => (
            <ul className="list-disc list-outside space-y-2 ml-6 mb-4">
              {children}
            </ul>
          ),
          li: ({children}) => (
            <li className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed pl-2">
              {children}
            </li>
          ),
          strong: ({children}) => (
            <strong className="font-bold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({children}) => (
            <em className="italic text-gray-800 dark:text-gray-200">
              {children}
            </em>
          ),
          code: ({children}) => (
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200">
              {children}
            </code>
          ),
          pre: ({children}) => (
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
              {children}
            </td>
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default QuestionPaperMarkdownContent;
