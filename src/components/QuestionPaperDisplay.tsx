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
      // PDF Layout system based on reference image
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-GB');

      // Main container for strict A4 size and center
      const pdfContainer = document.createElement('div');
      pdfContainer.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: #fff;
        font-family: 'Times New Roman', Times, serif;
        font-size: 13pt;
        color: #000;
        box-sizing: border-box;
        padding: 18mm 15mm 20mm 15mm;
        position: absolute;
        left: -9999px;
        top: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
        border: none;
      `;

      // Main header (as in screenshot)
      const header = document.createElement('div');
      header.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        border: 1.5px solid #222;
        padding: 0;
        width: 100%;
        margin-bottom: 13px;
        background: #fff;
      `;
      header.innerHTML = `
        <div style="padding:16px 0 0 0;font-weight:700;font-size:19pt;letter-spacing:1px;text-align:center;text-transform:uppercase;">
          QUESTION PAPER
        </div>
        <div style="padding:0 0 13px 0;text-align:center;font-size:11.5pt;">
          SUBJECT: <b>${title}</b> &nbsp;&nbsp;|&nbsp;&nbsp; CLASS: &nbsp;&nbsp;|&nbsp;&nbsp; MAX MARKS: 100 &nbsp;&nbsp;|&nbsp;&nbsp; TIME: 3 Hours
        </div>
      `;

      // General Instructions box, strong single border
      let instructionsBox = '';
      if (type === "question") {
        instructionsBox = `
          <div style="
            border: 1.5px solid #000; 
            padding: 10px 18px 10px 20px; 
            margin-bottom: 13px;
            font-size: 11.8pt;
            line-height: 1.8;
            background: #fff;
            font-family: 'Times New Roman', Times, serif;
            "
          >
            <div style="font-weight: bolder; font-size: 13.5pt; margin-bottom:.5em;letter-spacing:0.2px;">GENERAL INSTRUCTIONS</div>
            <ul style="margin:0;padding:0 0 0 20px;list-style-type:square;">
              <li style="margin-bottom:3px;">Read all instructions carefully before attempting.</li>
              <li style="margin-bottom:3px;">Attempt all questions unless instructed otherwise.</li>
              <li style="margin-bottom:3px;">Write clearly. No extra sheets allowed unless asked.</li>
              <li style="margin-bottom:3px;">Use only blue or black ink pen for writing answers.</li>
              <li style="margin-bottom:3px;">Calculators/mobile phones are not permitted.</li>
              <li style="">All questions carry equal marks unless specified.</li>
            </ul>
          </div>
        `;
      }

      // Section header builder
      const buildSectionHeading = (label: string) =>
        `<div style="margin-top:15px;margin-bottom:10px;font-weight: bold;font-size:14.2pt;border:none;text-align:left;padding:0;letter-spacing:0.3px;">${label}</div>`;

      // Parse markdown to HTML and adjust for MCQs and section layout
      const contentClone = element.cloneNode(true) as HTMLElement;
      // Remove survival Tailwind/Theme styles
      contentClone.style.cssText = `
        width: 100%;
        background: #fff;
        font-family: 'Times New Roman', Times, serif;
        font-size: 13pt;
        color: #000;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      `;

      // ---- Cosmetic adjustments ----
      // Style h1/h2/h3 (titles/sections)
      contentClone.querySelectorAll('h1').forEach(h1 => {
        (h1 as HTMLElement).style.cssText = `
          font-family: 'Times New Roman', Times, serif;
          font-weight: bold;
          font-size: 15.8pt;
          letter-spacing:0.4px;
          margin: 17px 0 8px 0;
          border: none;
          text-align: left;
          color: #000;
          background: #fff;
        `;
      });
      contentClone.querySelectorAll('h2').forEach(h2 => {
        (h2 as HTMLElement).style.cssText = `
          font-family:inherit;font-weight:bold;font-size:14pt;border:none;margin:13px 0 6px 0;text-align:left;color:#000;background:#fff;padding:0;
        `;
      });
      contentClone.querySelectorAll('h3').forEach(h3 => {
        (h3 as HTMLElement).style.cssText = `
          font-family:inherit;font-weight:bold;font-size:13pt;border:none;margin:10px 0 6px 0;text-align:left;color:#000;background:#fff;padding:0;
        `;
      });
      // Paragraphs
      contentClone.querySelectorAll('p').forEach(p => {
        (p as HTMLElement).style.cssText = `
          margin: 0 0 10px 0;
          font-size:13pt;
          text-align: left;
          color: #000;
          background: #fff;
          line-height: 1.8;
        `;
      });
      // Lists: Section titles and questions/choices
      contentClone.querySelectorAll('ol').forEach(ol => {
        (ol as HTMLElement).style.cssText = `
          margin-top:8px;margin-bottom:8px;padding-left:25px;
        `;
        ol.querySelectorAll('li').forEach((li, idx) => {
          (li as HTMLElement).style.cssText = `
            font-size:13pt;
            margin-bottom:12px;
            padding-bottom:0px;
            color:#000;
            background:#fff;
            font-family:'Times New Roman', Times, serif;
            text-align:left;
            line-height:1.8;
            padding-left:1.5px;
            position:relative;
            border:none;
          `;
        });
      });
      contentClone.querySelectorAll('ul').forEach(ul => {
        (ul as HTMLElement).style.cssText = `
          padding-left:20px;margin-top:4px;margin-bottom:7px;
          list-style-type: lower-alpha;
        `;
        ul.querySelectorAll('li').forEach((li, idx) => {
          (li as HTMLElement).style.cssText = `
            font-size:12.7pt;
            margin:5px 0 5px 0;
            padding-left:1.5px;
            font-family:'Times New Roman', Times, serif;
            color:#000;
            line-height: 1.6;
          `;
        });
      });
      // Table
      contentClone.querySelectorAll('table').forEach(table => {
        (table as HTMLElement).style.cssText = `
          width:100%;margin:11px 0 10px 0;border-collapse:collapse;border:1px solid #222;background:#fff;
        `;
        table.querySelectorAll('td,th').forEach(cell => {
          (cell as HTMLElement).style.cssText = `
            border:1px solid #222;padding:4px 7px;
            font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;
          `;
        });
      });
      // Strong/Bold
      contentClone.querySelectorAll('strong').forEach(str => {
        (str as HTMLElement).style.cssText = "font-weight:bold;color:#000;background:#fff;font-family:inherit;font-size:inherit;";
      });

      // Remove extra spacing before footer
      let footerMarginTop = 30;
      // --- END cosmetic ---

      // Build inner HTML for PDF assembly
      // (header previously created)
      pdfContainer.appendChild(header);

      // General Instructions
      if (instructionsBox) {
        const instrDiv = document.createElement('div');
        instrDiv.innerHTML = instructionsBox;
        pdfContainer.appendChild(instrDiv.firstElementChild!);
        footerMarginTop = 15;
      }

      // Main question content
      pdfContainer.appendChild(contentClone);

      // Footer (must be at the bottom, centered, smaller font)
      const footer = document.createElement('div');
      footer.style.cssText = `
        text-align: center;
        width: 100%;
        margin-top: ${footerMarginTop}px;
        padding-top: 6px;
        border-top: 1px solid #111;
        font-size: 11pt;
        color: #222;
        background: #fff;
        font-family: 'Times New Roman', Times, serif;
        font-weight: normal;
      `;
      footer.innerHTML = `
        Generated on ${formattedDate} | ${type === "question" ? "Question Paper" : "Solutions"} | Page
      `;
      pdfContainer.appendChild(footer);

      document.body.appendChild(pdfContainer);
      await new Promise(resolve => setTimeout(resolve, 140));
      
      // --- Generate PDF using html2canvas & jsPDF ---
      const canvas = await html2canvas(pdfContainer, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#fff',
        width: Math.round(210 * 3.78),
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: Math.round(210 * 3.78),
        windowHeight: Math.max(pdfContainer.scrollHeight, Math.round(297 * 3.78)),
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
      pdf.setFontSize(10);
      pdf.text(`Page ${pageNumber}`, pdfWidth - 24, pdfHeight - 10);

      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = -heightLeft;
        pdf.addPage();
        pageNumber++;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNumber}`, pdfWidth - 24, pdfHeight - 10);
        heightLeft -= pdfHeight;
      }

      document.body.removeChild(pdfContainer);

      // Generate filename
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
