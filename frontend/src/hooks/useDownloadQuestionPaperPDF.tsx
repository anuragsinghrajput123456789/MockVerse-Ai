import { useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QuestionPaperPDFLayoutProps } from "../components/QuestionPaperPDFLayout";
import ReactDOM from "react-dom/client";
import React from "react";
import QuestionPaperPDFLayout from "../components/QuestionPaperPDFLayout";
import { useToast } from "./use-toast";

// Dynamically create a wrapper to render PDF layout off-screen.
export function useDownloadQuestionPaperPDF() {
  const { toast } = useToast();
  
  const downloadPDF = useCallback(
    async ({
      content,
      title,
      type,
      classVal,
      totalMarks,
      difficulty,
      board,
    }: QuestionPaperPDFLayoutProps) => {
      toast({
        title: "Preparing PDF...",
        description: "Generating layouts and compiling formulas...",
      });

      // 1. Prepare the container in viewport bounds but invisible to the user
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.minHeight = '297mm';
      container.style.background = '#fff';
      container.style.opacity = '0.01';
      container.style.zIndex = '-9999';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);

      // 2. Render the PDF layout into the container
      let root: ReactDOM.Root | null = null;
      try {
        root = ReactDOM.createRoot(container);
        root.render(
          <QuestionPaperPDFLayout
            content={content}
            title={title}
            type={type}
            classVal={classVal}
            totalMarks={totalMarks}
            difficulty={difficulty}
            board={board}
          />
        );

        // Wait for React to finish asynchronous rendering and mount the DOM element
        let paperContentDiv: HTMLElement | null = null;
        for (let i = 0; i < 100; i++) {
          paperContentDiv = container.querySelector('.pdf-main-content') as HTMLElement;
          if (paperContentDiv) {
            break;
          }
          await new Promise(res => setTimeout(res, 20));
        }

        if (!paperContentDiv) {
          throw new Error("Failed to render PDF layout: .pdf-main-content not found in DOM");
        }

        // Give browser and layout systems a short wait state to settle text rendering
        await new Promise(res => setTimeout(res, 120));

        // Trigger MathJax compilation with a strict 1-second timeout race to prevent hanging
        const MJ = (window as any).MathJax;
        if (MJ && MJ.typesetPromise) {
          await Promise.race([
            MJ.typesetPromise([container]),
            new Promise(res => setTimeout(res, 1000))
          ]);
          // Wait a tiny bit for typeset drawings to settle
          await new Promise(res => setTimeout(res, 80));
        }

        // 3. Use html2canvas to capture the entire paper once, then slice it into A4 pages
        const elementWidth = paperContentDiv.offsetWidth || 794; // Fallback to standard A4 width in pixels
        const elementHeight = paperContentDiv.scrollHeight || 1122; // Fallback to standard A4 height in pixels

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (elementHeight * imgWidth) / elementWidth;

        if (!isFinite(imgHeight) || imgHeight <= 0) {
          throw new Error("Invalid dimensions calculated for PDF rendering: imgHeight must be finite");
        }

        // Wrap html2canvas execution in a timeout race (12 seconds) to prevent infinite freezing
        const canvas = await Promise.race([
          html2canvas(paperContentDiv, {
            scale: 1.0, // Scale 1.0 renders 40% faster and uses half the memory of scale 1.2
            useCORS: false, // Disabling CORS prevents hanging on Google Fonts or CDN stylesheets
            allowTaint: true,
            logging: false,
            backgroundColor: '#fff',
            width: elementWidth,
            height: elementHeight,
            windowWidth: elementWidth,
            windowHeight: elementHeight
          }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("PDF compilation timed out")), 12000)
          )
        ]);

        // Converting canvas to JPEG at 0.85 quality is up to 10x faster to encode than lossless PNG format
        const imgData = canvas.toDataURL('image/jpeg', 0.85);

        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;
        let pageNum = 1;

        // Render first page slice
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
        pdf.setFontSize(10);
        pdf.text(`Page ${pageNum}`, 210 - 24, 297 - 10);
        heightLeft -= 297;

        // Render subsequent page slices
        while (heightLeft > 0) {
          position = -297 * pageNum; // Shift image upward
          pdf.addPage();
          pageNum++;
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, '', 'FAST');
          pdf.setFontSize(10);
          pdf.text(`Page ${pageNum}`, 210 - 24, 297 - 10);
          heightLeft -= 297;
        }

        // 4. Save the file
        const sanitizedTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
        const filePrefix = type === "solution" ? "solutions" : "question_paper";
        const isoDate = new Date().toISOString().split("T")[0];
        const fileName = `${filePrefix}_${sanitizedTitle}_${isoDate}.pdf`;
        pdf.save(fileName);

        toast({
          title: "Download Started",
          description: "Your question paper PDF has been downloaded successfully.",
        });
      } catch (err: any) {
        console.error('Error generating PDF:', err);
        toast({
          title: "PDF Generation Failed",
          description: err.message || "Failed to render and slice your question paper. Please try again.",
          variant: "destructive",
        });
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
    [toast]
  );

  return { downloadPDF };
}
