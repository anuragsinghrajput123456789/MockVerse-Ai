import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QuestionPaperHeader from "./QuestionPaperHeader";
import QuestionPaperMarkdownContent from "./QuestionPaperMarkdownContent";

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
      // Declare currentDate ONCE at the top of try block
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');
      
      // Create/prepare container for A4 PDF with highly visible/readable content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        padding: 18mm 15mm;
        background: #fff !important;
        font-family: 'Arial', 'Helvetica', sans-serif;
        font-size: 15pt;
        line-height: 1.8;
        color: #000 !important;
        display: block;
        position: absolute;
        left: -9999px;
        top: 0;
        opacity: 1 !important;
        z-index: 2147483647 !important;
        box-sizing: border-box;
        overflow: visible;
      `;
      
      // Add professional header with better spacing
      const header = document.createElement('div');
      header.style.cssText = `
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 3px solid #000000;
        color: #000000 !important;
        page-break-inside: avoid;
      `;
      
      const timeAllowed = type === 'question' ? '3 Hours' : 'Reference Material';
      
      header.innerHTML = `
        <div style="margin-bottom: 15px; font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #000000 !important;">
          ${title}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 12pt; font-weight: bold; color: #000000 !important;">
          <span style="color: #000000 !important;">Date: ${formattedDate}</span>
          <span style="color: #000000 !important;">Time: ${timeAllowed}</span>
          <span style="color: #000000 !important;">Type: ${type === 'question' ? 'Question Paper' : 'Solutions'}</span>
        </div>
      `;
      
      // Prepare inner content
      const contentClone = element.cloneNode(true) as HTMLElement;
      contentClone.style.cssText = `
        font-family: 'Arial', 'Helvetica', sans-serif;
        color: #000 !important;
        line-height: 1.8;
        font-size: 15pt;
        background: #fff !important;
        width: 100%;
        overflow: visible;
        display: block !important;
        opacity: 1 !important;
      `;

      // Improved: make sure every element is VISIBLE!
      const applyPDFStyles = (container: HTMLElement) => {
        const allElements = container.querySelectorAll('*');
        allElements.forEach(el => {
          const elem = el as HTMLElement;
          elem.style.color = '#000 !important';
          elem.style.backgroundColor = '#fff !important';
          elem.style.fontFamily = 'Arial, Helvetica, sans-serif';
          elem.style.opacity = '1 !important';
          elem.style.display = 'block';
        });

        // Headings
        const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading) => {
          const level = parseInt(heading.tagName[1]);
          (heading as HTMLElement).style.cssText = `
            color: #000 !important;
            background: #fff !important;
            font-weight: bold;
            text-align: center;
            margin: ${level === 1 ? '25px' : '20px'} 0 ${level === 1 ? '20px' : '15px'} 0;
            font-size: ${level === 1 ? '20pt' : level === 2 ? '18pt' : '16pt'};
            font-family: Arial, Helvetica, sans-serif;
            ${level <= 2 ? 'border-bottom: 2px solid #000; padding-bottom: 8px;' : ''}
            page-break-after: avoid;
            page-break-inside: avoid;
            opacity: 1 !important;
            display: block;
          `;
        });

        // Paragraphs
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
          (p as HTMLElement).style.cssText = `
            color: #000 !important;
            background: #fff !important;
            margin: 14px 0;
            text-align: justify;
            line-height: 1.8;
            font-size: 15pt;
            font-family: Arial, Helvetica, sans-serif;
            opacity: 1 !important;
            display: block;
            orphans: 2;
            widows: 2;
            page-break-inside: avoid;
          `;
        });

        // Ordered/Unordered lists
        const orderedLists = container.querySelectorAll('ol');
        orderedLists.forEach(ol => {
          (ol as HTMLElement).style.cssText = `
            margin: 20px 0;
            padding-left: 30px;
            counter-reset: question-counter;
            color: #000 !important;
            background: #fff !important;
            page-break-inside: auto;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15pt;
            opacity: 1 !important;
            display: block;
          `;
          const listItems = ol.querySelectorAll('li');
          listItems.forEach((li, index) => {
            (li as HTMLElement).style.cssText = `
              margin: 20px 0;
              padding: 12px 0;
              line-height: 1.8;
              color: #000 !important;
              background: #fff !important;
              position: relative;
              page-break-inside: avoid;
              break-inside: avoid;
              font-size: 15pt;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: normal;
              opacity: 1 !important;
              display: block;
            `;
            // Improved question numbering
            if (type === 'question') {
              const hasQuestion = li.querySelector('strong[data-qnum]');
              if (!hasQuestion) {
                const questionNumber = document.createElement('strong');
                questionNumber.textContent = `Q${index + 1}. `;
                questionNumber.setAttribute('data-qnum', 'true');
                questionNumber.style.cssText = `
                  font-weight: bold;
                  color: #000 !important;
                  font-size: 16pt;
                  margin-right: 8px;
                  opacity: 1 !important;
                  display: inline;
                  background: #fff !important;
                `;
                li.insertBefore(questionNumber, li.firstChild);
              }
            }
          });
        });

        const unorderedLists = container.querySelectorAll('ul');
        unorderedLists.forEach(ul => {
          (ul as HTMLElement).style.cssText = `
            margin: 15px 0;
            padding-left: 25px;
            color: #000 !important;
            background: #fff !important;
            page-break-inside: auto;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15pt;
            opacity: 1 !important;
            display: block;
          `;
          const listItems = ul.querySelectorAll('li');
          listItems.forEach(li => {
            (li as HTMLElement).style.cssText = `
              margin: 10px 0;
              line-height: 1.8;
              color: #000 !important;
              background: #fff !important;
              list-style-type: disc;
              page-break-inside: avoid;
              font-size: 15pt;
              font-family: Arial, Helvetica, sans-serif;
              opacity: 1 !important;
              display: block;
            `;
          });
        });

        // Strong/bold text
        const strongElements = container.querySelectorAll('strong, b');
        strongElements.forEach(strong => {
          (strong as HTMLElement).style.cssText = `
            font-weight: bold;
            color: #000 !important;
            background: #fff !important;
            font-size: 15pt;
            font-family: Arial, Helvetica, sans-serif;
            opacity: 1 !important;
            display: inline;
          `;
        });

        // Code blocks
        const codeBlocks = container.querySelectorAll('code, pre');
        codeBlocks.forEach(code => {
          (code as HTMLElement).style.cssText = `
            font-family: 'Courier New', monospace;
            background-color: #f8f8f8 !important;
            color: #000 !important;
            padding: 8px 10px;
            border-radius: 4px;
            font-size: 13pt;
            border: 1.5px solid #ccc;
            opacity: 1 !important;
            margin: 8px 0;
            display: block;
          `;
        });

        // Tables
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
          (table as HTMLElement).style.cssText = `
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            color: #000 !important;
            background: #fff !important;
            page-break-inside: avoid;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 15pt;
            opacity: 1 !important;
            display: block;
          `;
          const cells = table.querySelectorAll('td, th');
          cells.forEach(cell => {
            (cell as HTMLElement).style.cssText = `
              border: 2px solid #000;
              padding: 10px;
              text-align: left;
              color: #000 !important;
              background: #fff !important;
              font-size: 15pt;
              font-family: Arial, Helvetica, sans-serif;
              opacity: 1 !important;
              display: table-cell;
            `;
          });
        });
      };

      applyPDFStyles(contentClone);

      // Append in this order for proper rendering: header, instructions/content, footer
      pdfContainer.appendChild(header);

      if (type === 'question') {
        // Only add instructions for questions, not solutions
        const instructions = document.createElement('div');
        instructions.style.cssText = `
          margin: 25px 0;
          padding: 20px;
          border: 2px solid #000;
          background-color: #f9f9f9 !important;
          font-size: 14pt;
          color: #000 !important;
          page-break-inside: avoid;
          font-family: Arial, Helvetica, sans-serif;
          display: block;
          opacity: 1 !important;
        `;
        instructions.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 15px; text-align: center; color: #000 !important; font-size: 17pt;">
            GENERAL INSTRUCTIONS
          </div>
          <div style="line-height: 1.75; color: #000 !important;">
            <div style="margin-bottom: 8px;">• Read all questions carefully before attempting.</div>
            <div style="margin-bottom: 8px;">• Answer all questions as they appear.</div>
            <div style="margin-bottom: 8px;">• Write clearly and legibly in blue or black ink.</div>
            <div style="margin-bottom: 8px;">• Show all working steps where applicable.</div>
            <div style="margin-bottom: 8px;">• Manage your time effectively across all sections.</div>
            <div>• Review your answers before submission.</div>
          </div>
        `;
        pdfContainer.appendChild(instructions);
      }

      pdfContainer.appendChild(contentClone);

      // Enhanced visible footer
      const footer = document.createElement('div');
      footer.style.cssText = `
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #000;
        text-align: center;
        font-size: 13pt;
        color: #000 !important;
        background: #fff !important;
        page-break-inside: avoid;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: bold;
        opacity: 1 !important;
        display: block;
      `;
      footer.innerHTML = `<span>Generated on ${new Date().toLocaleDateString('en-GB')} • ${type === 'question' ? 'Question Paper' : 'Solutions'} • Page</span>`;
      pdfContainer.appendChild(footer);

      document.body.appendChild(pdfContainer);

      // Wait for layout to be ready
      await new Promise(resolve => setTimeout(resolve, 200));

      // Render the PDF clearly and at proper scale
      const canvas = await html2canvas(pdfContainer, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#fff',
        width: Math.round(210 * 3.78),
        height: Math.max(pdfContainer.scrollHeight * 3, Math.round(297 * 3.78)),
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.round(210 * 3.78),
        windowHeight: Math.max(pdfContainer.scrollHeight, Math.round(297 * 3.78)),
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.querySelector('div') as HTMLElement;
          if (clonedContainer) {
            clonedContainer.style.height = 'auto';
            clonedContainer.style.minHeight = 'auto';
            clonedContainer.style.opacity = '1 !important';
            clonedContainer.style.display = 'block !important';
            // Set all text visible/black
            const allEl = clonedDoc.querySelectorAll('*');
            allEl.forEach(el => {
              const elem = el as HTMLElement;
              elem.style.color = '#000';
              elem.style.backgroundColor = '#fff';
              elem.style.opacity = '1 !important';
              elem.style.display = 'block';
            });
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      let pageNumber = 1;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, Math.min(imgHeight, pdfHeight), '', 'FAST');
      pdf.setFontSize(12);
      pdf.text(`Page ${pageNumber}`, pdfWidth - 24, pdfHeight - 10);

      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        pdf.setFontSize(12);
        pdf.text(`Page ${pageNumber}`, pdfWidth - 24, pdfHeight - 10);
        heightLeft -= pdfHeight;
      }

      document.body.removeChild(pdfContainer);

      // Generate enhanced filename
      const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filePrefix = type === 'solution' ? 'solutions' : 'question_paper';
      const fileName = `${filePrefix}_${sanitizedTitle}_${currentDate.toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Section */}
      <QuestionPaperHeader
        title={title}
        type={type}
        loading={loading}
        onGenerateSolutions={onGenerateSolutions}
        onStartAnswering={onStartAnswering}
        onDownloadPDF={downloadPDF}
      />
      {/* Content Section */}
      <div className="p-6">
        <div id={`${type}-paper-content`}>
          <QuestionPaperMarkdownContent content={content} />
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperDisplay;
