
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
      // Create a temporary container with PDF-optimized styling
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 794px;
        min-height: 1123px;
        padding: 40px;
        background: white;
        font-family: 'Times New Roman', serif;
        font-size: 14px;
        line-height: 1.6;
        color: black;
        position: absolute;
        top: -10000px;
        left: -10000px;
      `;
      
      // Clone and style the content for PDF
      const contentClone = element.cloneNode(true) as HTMLElement;
      contentClone.style.cssText = `
        max-width: none;
        font-family: 'Times New Roman', serif;
        color: black;
      `;
      
      // Style headings for PDF
      const headings = contentClone.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        (heading as HTMLElement).style.cssText = `
          color: black;
          font-weight: bold;
          margin: 20px 0 10px 0;
          text-align: center;
          border-bottom: 2px solid black;
          padding-bottom: 5px;
        `;
      });
      
      // Style paragraphs and lists
      const paragraphs = contentClone.querySelectorAll('p, li');
      paragraphs.forEach(p => {
        (p as HTMLElement).style.cssText = `
          color: black;
          margin: 10px 0;
          text-align: justify;
        `;
      });
      
      // Style ordered/unordered lists
      const lists = contentClone.querySelectorAll('ol, ul');
      lists.forEach(list => {
        (list as HTMLElement).style.cssText = `
          margin: 15px 0;
          padding-left: 30px;
        `;
      });
      
      // Style strong/bold text
      const strongElements = contentClone.querySelectorAll('strong, b');
      strongElements.forEach(strong => {
        (strong as HTMLElement).style.cssText = `
          font-weight: bold;
          color: black;
        `;
      });
      
      // Add header with title
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 3px double black;
      `;
      header.innerHTML = `
        <h1 style="font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">${title}</h1>
        <p style="margin: 10px 0 0 0; font-style: italic;">Generated on: ${new Date().toLocaleDateString()}</p>
      `;
      
      pdfContainer.appendChild(header);
      pdfContainer.appendChild(contentClone);
      document.body.appendChild(pdfContainer);

      // Generate PDF with better quality settings
      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: Math.max(1123, pdfContainer.scrollHeight)
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Clean up
      document.body.removeChild(pdfContainer);
      
      // Save with formatted filename based on type
      const filePrefix = type === 'solution' ? 'solutions' : 'question_paper';
      const fileName = `${filePrefix}_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
          {title}
        </h2>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download {type === 'solution' ? 'Solutions' : 'Question Paper'}
          </button>
          
          {onGenerateSolutions && type === 'question' && (
            <button
              onClick={onGenerateSolutions}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
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
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Start Answering
            </button>
          )}
        </div>
      </div>
      
      <div 
        id={`${type}-paper-content`}
        className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-headings:text-center prose-headings:border-b prose-headings:border-gray-300 prose-headings:pb-2 prose-ol:list-decimal prose-ul:list-disc prose-li:my-2"
      >
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({children}) => <h1 className="text-2xl font-bold text-center border-b-2 border-gray-300 pb-2 mb-4">{children}</h1>,
            h2: ({children}) => <h2 className="text-xl font-bold text-center border-b border-gray-200 pb-1 mb-3">{children}</h2>,
            h3: ({children}) => <h3 className="text-lg font-semibold mb-2">{children}</h3>,
            p: ({children}) => <p className="mb-3 text-justify leading-relaxed">{children}</p>,
            ol: ({children}) => <ol className="list-decimal list-inside space-y-2 ml-4">{children}</ol>,
            ul: ({children}) => <ul className="list-disc list-inside space-y-2 ml-4">{children}</ul>,
            li: ({children}) => <li className="mb-2">{children}</li>,
            strong: ({children}) => <strong className="font-bold">{children}</strong>
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default QuestionPaperDisplay;
