
import { useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QuestionPaperPDFLayoutProps } from "../components/QuestionPaperPDFLayout";
import ReactDOM from "react-dom/client";
import React from "react";
import QuestionPaperPDFLayout from "../components/QuestionPaperPDFLayout";

// Dynamically create a wrapper to render PDF layout off-screen.
export function useDownloadQuestionPaperPDF() {
  const downloadPDF = useCallback(
    async ({
      content,
      title,
      type,
    }: Pick<QuestionPaperPDFLayoutProps, "content" | "title" | "type">) => {
      // 1. Prepare the container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.background = '#fff';
      document.body.appendChild(container);

      // 2. Render the PDF layout into the container
      let root: ReactDOM.Root | null = null;
      try {
        root = ReactDOM.createRoot(container);
        root.render(
          <QuestionPaperPDFLayout content={content} title={title} type={type} />
        );

        // Wait for render
        await new Promise(res => setTimeout(res, 140));
        // 3. Use html2canvas to capture each page
        const pdfWidth = 210;
        const pdfHeight = 297;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const formattedDate = new Date().toLocaleDateString('en-GB');
        const paperContentDiv = container.querySelector('.pdf-main-content') as HTMLElement;

        // Calculate height for single A4 in pixels
        const pageHeightPx = Math.floor((pdfHeight / 25.4) * 96); // at 96dpi
        const totalHeight = container.scrollHeight;
        let renderedHeight = 0;
        let pageNum = 1;
        const pdfPageWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();

        // Scroll and clip if content spans multiple pages
        while (renderedHeight < (paperContentDiv?.scrollHeight || container.scrollHeight)) {
          paperContentDiv.scrollTop = renderedHeight;
          paperContentDiv.style.overflow = "hidden";
          paperContentDiv.style.height = `${pageHeightPx}px`;

          await new Promise(r => setTimeout(r, 40));
          const canvas = await html2canvas(paperContentDiv, {
            scale: 2.3,
            useCORS: true,
            backgroundColor: '#fff',
            width: paperContentDiv.offsetWidth,
            height: pageHeightPx,
            scrollX: 0,
            scrollY: renderedHeight,
            windowWidth: paperContentDiv.offsetWidth,
            windowHeight: pageHeightPx
          });
          const imgData = canvas.toDataURL('image/png', 1.0);

          if (pageNum > 1) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfPageWidth, pdfPageHeight, '', 'FAST');
          pdf.setFontSize(10);
          pdf.text(`Page ${pageNum}`, pdfPageWidth - 24, pdfPageHeight - 10);
          renderedHeight += pageHeightPx;
          pageNum += 1;
        }

        // 4. Save the file
        const sanitizedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const filePrefix = type === "solution" ? "solutions" : "question_paper";
        const isoDate = new Date().toISOString().split("T")[0];
        const fileName = `${filePrefix}_${sanitizedTitle}_${isoDate}.pdf`;
        pdf.save(fileName);
      } catch (err) {
        console.error('Error generating PDF:', err);
      } finally {
        if (root) {
          try {
            root.unmount();
          } catch (unmountError) {
            console.error('Error unmounting root:', unmountError);
          }
        }
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }
    },
    []
  );

  return { downloadPDF };
}
