import React, { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface QuestionPaperMarkdownContentProps {
  content: string;
}

const QuestionPaperMarkdownContent: React.FC<QuestionPaperMarkdownContentProps> = ({ content }) => {
  useEffect(() => {
    // Dynamic typesetting call for SPA rendering updates
    const MJ = (window as any).MathJax;
    if (MJ && MJ.typesetPromise) {
      MJ.typesetPromise().catch((err: any) => console.error("MathJax typeset error:", err));
    }
  }, [content]);

  return (
    <div className="prose prose-slate max-w-none text-slate-300 prose-invert font-sans tex2jax_process">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({children}) => (
            <h1 className="text-xl md:text-2xl font-extrabold text-center border-b border-white/10 pb-4 mb-6 text-white tracking-tight">
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className="text-lg md:text-xl font-bold border-b border-white/5 pb-3 mb-5 text-white/90">
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className="text-base md:text-lg font-bold mb-4 text-white/80">
              {children}
            </h3>
          ),
          p: ({children}) => (
            <p className="mb-5 text-slate-300 leading-relaxed text-sm md:text-base text-justify">
              {children}
            </p>
          ),
          ol: ({children}) => (
            <ol className="list-decimal list-outside space-y-4 ml-5 mb-6 text-sm md:text-base text-slate-300">
              {children}
            </ol>
          ),
          ul: ({children}) => (
            <ul className="list-disc list-outside space-y-3 ml-5 mb-5 text-sm md:text-base text-slate-300">
              {children}
            </ul>
          ),
          li: ({children}) => (
            <li className="mb-2 text-slate-300 leading-relaxed pl-1.5">
              {children}
            </li>
          ),
          strong: ({children}) => (
            <strong className="font-extrabold text-white">
              {children}
            </strong>
          ),
          em: ({children}) => (
            <em className="italic text-slate-200">
              {children}
            </em>
          ),
          code: ({children}) => (
            <code className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-xs font-mono text-pink-400">
              {children}
            </code>
          ),
          pre: ({children}) => (
            <pre className="bg-[#080C16] border border-white/5 p-4 rounded-xl overflow-x-auto mb-5 text-xs font-mono text-slate-200 shadow-inner">
              {children}
            </pre>
          ),
          blockquote: ({children}) => (
            <blockquote className="border-l-4 border-indigo-500 bg-white/5 px-4.5 py-3 rounded-r-xl my-5 italic text-slate-300 text-sm">
              {children}
            </blockquote>
          ),
          table: ({children}) => (
            <div className="overflow-x-auto mb-6 rounded-xl border border-white/10">
              <table className="min-w-full border-collapse text-left text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({children}) => (
            <th className="border-b border-white/10 bg-white/5 px-4.5 py-3 font-bold text-white text-xs uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({children}) => (
            <td className="border-b border-white/5 px-4.5 py-3 text-slate-300 text-xs">
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
