
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const downloadPDF = async () => {
    const element = document.getElementById(`${type}-paper-content`);
    if (!element) return;

    try {
      // Create a temporary container optimized for A4 PDF
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        padding: 20mm;
        background: #ffffff !important;
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 12pt;
        line-height: 1.5;
        color: #000000 !important;
        position: absolute;
        top: -50000px;
        left: -50000px;
        box-sizing: border-box;
      `;
      
      // Add professional header
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid #000000;
        color: #000000 !important;
      `;
      
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');
      const timeAllowed = type === 'question' ? '3 Hours' : 'Reference Material';
      
      header.innerHTML = `
        <div style="margin-bottom: 10px; font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #000000 !important;">
          ${title}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-size: 10pt; color: #000000 !important;">
          <span style="color: #000000 !important;"><strong style="color: #000000 !important;">Date:</strong> ${formattedDate}</span>
          <span style="color: #000000 !important;"><strong style="color: #000000 !important;">Time:</strong> ${timeAllowed}</span>
          <span style="color: #000000 !important;"><strong style="color: #000000 !important;">Type:</strong> ${type === 'question' ? 'Question Paper' : 'Solutions'}</span>
        </div>
      `;
      
      // Clone and optimize content for PDF
      const contentClone = element.cloneNode(true) as HTMLElement;
      contentClone.style.cssText = `
        font-family: 'Times New Roman', Georgia, serif;
        color: #000000 !important;
        line-height: 1.6;
        font-size: 12pt;
        background: #ffffff !important;
      `;
      
      // Enhanced styling for better PDF appearance with forced colors
      const applyPDFStyles = (container: HTMLElement) => {
        // Force all elements to have black text on white background
        const allElements = container.querySelectorAll('*');
        allElements.forEach(el => {
          const element = el as HTMLElement;
          element.style.color = '#000000 !important';
          element.style.backgroundColor = 'transparent !important';
        });
        
        // Style all headings
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
          const level = parseInt(heading.tagName[1]);
          (heading as HTMLElement).style.cssText = `
            color: #000000 !important;
            background: transparent !important;
            font-weight: bold;
            text-align: center;
            margin: ${level === 1 ? '20px' : '15px'} 0 ${level === 1 ? '15px' : '10px'} 0;
            font-size: ${level === 1 ? '16pt' : level === 2 ? '14pt' : '13pt'};
            ${level <= 2 ? 'border-bottom: 1px solid #000000; padding-bottom: 5px;' : ''}
            page-break-after: avoid;
          `;
        });
        
        // Style paragraphs
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
          (p as HTMLElement).style.cssText = `
            color: #000000 !important;
            background: transparent !important;
            margin: 8px 0;
            text-align: justify;
            line-height: 1.6;
            font-size: 12pt;
            orphans: 3;
            widows: 3;
          `;
        });
        
        // Style lists with better formatting
        const orderedLists = container.querySelectorAll('ol');
        orderedLists.forEach(ol => {
          (ol as HTMLElement).style.cssText = `
            margin: 12px 0;
            padding-left: 25px;
            counter-reset: question-counter;
            color: #000000 !important;
            background: transparent !important;
          `;
          
          const listItems = ol.querySelectorAll('li');
          listItems.forEach((li, index) => {
            (li as HTMLElement).style.cssText = `
              margin: 10px 0;
              padding: 8px 0;
              line-height: 1.6;
              color: #000000 !important;
              background: transparent !important;
              position: relative;
              page-break-inside: avoid;
            `;
            
            // Add question numbering for question papers
            if (type === 'question') {
              (li as HTMLElement).style.counterIncrement = 'question-counter';
            }
          });
        });
        
        const unorderedLists = container.querySelectorAll('ul');
        unorderedLists.forEach(ul => {
          (ul as HTMLElement).style.cssText = `
            margin: 12px 0;
            padding-left: 20px;
            color: #000000 !important;
            background: transparent !important;
          `;
          
          const listItems = ul.querySelectorAll('li');
          listItems.forEach(li => {
            (li as HTMLElement).style.cssText = `
              margin: 8px 0;
              line-height: 1.6;
              color: #000000 !important;
              background: transparent !important;
              list-style-type: disc;
            `;
          });
        });
        
        // Style strong/bold text
        const strongElements = container.querySelectorAll('strong, b');
        strongElements.forEach(strong => {
          (strong as HTMLElement).style.cssText = `
            font-weight: bold;
            color: #000000 !important;
            background: transparent !important;
          `;
        });
        
        // Style code blocks if any
        const codeBlocks = container.querySelectorAll('code, pre');
        codeBlocks.forEach(code => {
          (code as HTMLElement).style.cssText = `
            font-family: 'Courier New', monospace;
            background-color: #f0f0f0 !important;
            color: #000000 !important;
            padding: 4px 6px;
            border-radius: 3px;
            font-size: 11pt;
            border: 1px solid #cccccc;
          `;
        });
        
        // Style tables if any
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
          (table as HTMLElement).style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            color: #000000 !important;
            background: #ffffff !important;
          `;
          
          const cells = table.querySelectorAll('td, th');
          cells.forEach(cell => {
            (cell as HTMLElement).style.cssText = `
              border: 1px solid #000000;
              padding: 8px;
              text-align: left;
              color: #000000 !important;
              background: #ffffff !important;
            `;
          });
        });
      };
      
      applyPDFStyles(contentClone);
      
      // Add instructions for question papers
      if (type === 'question') {
        const instructions = document.createElement('div');
        instructions.style.cssText = `
          margin: 20px 0;
          padding: 15px;
          border: 1px solid #000000;
          background-color: #f8f8f8 !important;
          font-size: 11pt;
          color: #000000 !important;
        `;
        instructions.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 10px; text-align: center; color: #000000 !important;">INSTRUCTIONS</div>
          <div style="line-height: 1.4; color: #000000 !important;">
            • Read all questions carefully before attempting.<br>
            • Answer all questions as they appear.<br>
            • Write clearly and legibly.<br>
            • Show all working where applicable.<br>
            • Manage your time effectively.
          </div>
        `;
        pdfContainer.appendChild(instructions);
      }
      
      pdfContainer.appendChild(header);
      pdfContainer.appendChild(contentClone);
      
      // Add footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        margin-top: 30px;
        padding-top: 15px;
        border-top: 1px solid #000000;
        text-align: center;
        font-size: 10pt;
        color: #333333 !important;
        background: transparent !important;
      `;
      footer.innerHTML = `<span style="color: #333333 !important;">Generated on ${formattedDate} • ${type === 'question' ? 'Question Paper' : 'Solutions'}</span>`;
      pdfContainer.appendChild(footer);
      
      document.body.appendChild(pdfContainer);

      // Generate high-quality PDF with better color handling
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: Math.round(210 * 3.78), // A4 width in pixels at 96 DPI
        height: Math.max(Math.round(297 * 3.78), pdfContainer.scrollHeight * 2),
        onclone: (clonedDoc) => {
          // Ensure all text is black in the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            if (element.style) {
              element.style.color = '#000000';
              element.style.backgroundColor = 'transparent';
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pdfHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pdfHeight;
      }

      // Clean up
      document.body.removeChild(pdfContainer);
      
      // Generate filename
      const timestamp = currentDate.toISOString().split('T')[0];
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePrefix = type === 'solution' ? 'solutions' : 'question_paper';
      const fileName = `${filePrefix}_${sanitizedTitle}_${timestamp}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
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
              onClick={downloadPDF}
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
      
      {/* Content Section */}
      <div className="p-6">
        <div 
          id={`${type}-paper-content`}
          className="prose prose-lg max-w-none dark:prose-invert"
        >
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
      </div>
    </div>
  );
};

export default QuestionPaperDisplay;
