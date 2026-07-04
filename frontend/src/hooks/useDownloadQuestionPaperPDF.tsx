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

        // 3. Flatten and slice elements into A4 pages ensuring no block or list item crosses page boundaries
        const getFullHeight = (el: HTMLElement): number => {
          const style = window.getComputedStyle(el);
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;
          return el.offsetHeight + marginTop + marginBottom;
        };

        // Measure A4 width and height in pixels dynamically on the client
        const tempPage = document.createElement('div');
        tempPage.style.width = '210mm';
        tempPage.style.height = '297mm';
        container.appendChild(tempPage);
        const pageHeightPx = tempPage.offsetHeight || 1123;
        const pageWidthPx = tempPage.offsetWidth || 794;
        container.removeChild(tempPage);

        // Measure padding in pixels
        const tempPaddingTop = document.createElement('div');
        tempPaddingTop.style.height = '18mm';
        const tempPaddingBottom = document.createElement('div');
        tempPaddingBottom.style.height = '20mm';
        container.appendChild(tempPaddingTop);
        container.appendChild(tempPaddingBottom);
        const paddingTopPx = tempPaddingTop.offsetHeight || 68;
        const paddingBottomPx = tempPaddingBottom.offsetHeight || 75;
        container.removeChild(tempPaddingTop);
        container.removeChild(tempPaddingBottom);

        const usableHeightPx = pageHeightPx - paddingTopPx - paddingBottomPx;

        // Query the structural divs
        const headerDiv = paperContentDiv.querySelector('.pdf-header') as HTMLElement | null;
        const instructionsDiv = paperContentDiv.querySelector('.pdf-instructions') as HTMLElement | null;
        const markdownContainer = paperContentDiv.querySelector('.pdf-markdown-container') as HTMLElement | null;

        if (!headerDiv || !markdownContainer) {
          throw new Error("Required layout elements (.pdf-header or .pdf-markdown-container) not found for pagination");
        }

        const headerHeight = getFullHeight(headerDiv);
        const instructionsHeight = instructionsDiv ? getFullHeight(instructionsDiv) : 0;

        interface LayoutElement {
          type: 'block' | 'list-item';
          element: HTMLElement;
          height: number;
          listType?: 'ol' | 'ul';
          listStart?: number;
          listClass?: string;
          listStyle?: string;
        }

        const contentElements: LayoutElement[] = [];
        const markdownChildren = Array.from(markdownContainer.children) as HTMLElement[];

        for (const child of markdownChildren) {
          if (child.tagName === 'OL' || child.tagName === 'UL') {
            const listType = child.tagName.toLowerCase() as 'ol' | 'ul';
            const listItems = Array.from(child.children) as HTMLElement[];
            const originalStart = child.getAttribute('start') ? parseInt(child.getAttribute('start')!) : 1;
            
            listItems.forEach((li, idx) => {
              contentElements.push({
                type: 'list-item',
                element: li.cloneNode(true) as HTMLElement,
                height: getFullHeight(li),
                listType,
                listStart: originalStart + idx,
                listClass: child.className,
                listStyle: child.getAttribute('style') || ''
              });
            });
          } else {
            contentElements.push({
              type: 'block',
              element: child.cloneNode(true) as HTMLElement,
              height: getFullHeight(child)
            });
          }
        }

        // Keep cloned versions of header and instructions
        const headerClone = headerDiv.cloneNode(true) as HTMLElement;
        const instructionsClone = instructionsDiv ? instructionsDiv.cloneNode(true) as HTMLElement : null;

        // 4. Safely unmount React root now that we have cloned the elements and measured dimensions
        if (root) {
          try {
            root.unmount();
            root = null;
          } catch (unmountError) {
            console.error('Error unmounting root:', unmountError);
          }
        }

        // Clear the container
        container.innerHTML = '';

        // Inject page-level reset styles for PDF compilation consistency
        const styleSheet = document.createElement('style');
        styleSheet.innerHTML = `
          .pdf-page, .pdf-page * {
            box-sizing: border-box !important;
          }
          .pdf-page ol, .pdf-page ul {
            list-style-type: none !important;
            list-style: none !important;
            padding-left: 0 !important;
            margin-top: 6px !important;
            margin-bottom: 6px !important;
          }
          .pdf-page li {
            list-style-type: none !important;
            list-style: none !important;
            display: flex !important;
            align-items: flex-start !important;
            margin-bottom: 10px !important;
            padding-left: 0 !important;
          }
          .pdf-page table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          .pdf-page td, .pdf-page th {
            border: 1px solid #222 !important;
            padding: 4px 7px !important;
          }
          .pdf-page .pdf-header table td {
            border: none !important;
            padding: 2px 0 !important;
          }
          .pdf-page .pdf-instructions div {
            box-sizing: border-box !important;
          }
        `;
        container.appendChild(styleSheet);

        // Distribute elements into pages
        const pages: LayoutElement[][] = [[]];
        let currentPageIndex = 0;
        let currentPageHeightUsed = headerHeight + instructionsHeight;

        for (const layoutEl of contentElements) {
          // If adding this element exceeds the limit, push to next page
          if (currentPageHeightUsed + layoutEl.height > usableHeightPx) {
            currentPageIndex++;
            pages.push([]);
            currentPageHeightUsed = 0; // Page 2 starts clean
          }
          pages[currentPageIndex].push(layoutEl);
          currentPageHeightUsed += layoutEl.height;
        }

        // Reconstruct A4 pages in DOM
        pages.forEach((pageElements, index) => {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'pdf-page';
          pageDiv.style.width = '210mm';
          pageDiv.style.height = '297mm';
          pageDiv.style.boxSizing = 'border-box';
          pageDiv.style.padding = '18mm 15mm 20mm 15mm';
          pageDiv.style.position = 'relative';
          pageDiv.style.background = '#fff';
          pageDiv.style.overflow = 'hidden';
          pageDiv.style.color = '#000';
          pageDiv.style.fontFamily = "'Times New Roman', Times, serif";
          pageDiv.style.fontSize = '13pt';
          pageDiv.style.display = 'flex';
          pageDiv.style.flexDirection = 'column';
          
          const contentArea = document.createElement('div');
          contentArea.style.flex = '1';
          contentArea.style.display = 'block';
          pageDiv.appendChild(contentArea);

          // Render header & instructions on first page
          if (index === 0) {
            contentArea.appendChild(headerClone.cloneNode(true));
            if (instructionsClone) {
              contentArea.appendChild(instructionsClone.cloneNode(true));
            }
          }

          let currentListContainer: HTMLOListElement | HTMLUListElement | null = null;
          let currentListType: 'ol' | 'ul' | null = null;

          pageElements.forEach((el) => {
            if (el.type === 'list-item') {
              if (!currentListContainer || currentListType !== el.listType) {
                currentListType = el.listType!;
                currentListContainer = document.createElement(currentListType) as HTMLOListElement | HTMLUListElement;
                if (el.listClass) currentListContainer.className = el.listClass;
                if (el.listStyle) currentListContainer.setAttribute('style', el.listStyle);
                if (currentListType === 'ol' && el.listStart !== undefined) {
                  (currentListContainer as HTMLOListElement).start = el.listStart;
                }
                contentArea.appendChild(currentListContainer);
              }
              currentListContainer.appendChild(el.element.cloneNode(true));
            } else {
              currentListContainer = null;
              currentListType = null;
              contentArea.appendChild(el.element.cloneNode(true));
            }
          });

          // Add dynamic page footer
          const footerDiv = document.createElement('div');
          footerDiv.style.position = 'absolute';
          footerDiv.style.bottom = '10mm';
          footerDiv.style.left = '15mm';
          footerDiv.style.right = '15mm';
          footerDiv.style.borderTop = '1px solid #111';
          footerDiv.style.paddingTop = '6px';
          footerDiv.style.fontSize = '11pt';
          footerDiv.style.color = '#222';
          footerDiv.style.fontFamily = "'Times New Roman', Times, serif";
          
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleDateString("en-GB");
          
          footerDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <span>Generated on ${formattedDate} | ${type === "solution" ? "Solutions" : "Question Paper"}</span>
              <span>Page ${index + 1} of ${pages.length}</span>
            </div>
          `;
          pageDiv.appendChild(footerDiv);
          container.appendChild(pageDiv);
        });

        // 5. Render to jsPDF by capturing each page individually
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageElements = container.querySelectorAll('.pdf-page');

        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i] as HTMLElement;

          const canvas = await Promise.race([
            html2canvas(pageEl, {
              scale: 1.5, // 1.5 scale balances rendering speed and sharpness
              useCORS: false,
              allowTaint: true,
              logging: false,
              backgroundColor: '#fff',
              width: pageWidthPx,
              height: pageHeightPx,
              windowWidth: pageWidthPx,
              windowHeight: pageHeightPx,
              scrollX: 0,
              scrollY: 0
            }),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error(`PDF compilation timed out on page ${i + 1}`)), 12000)
            )
          ]);

          const imgData = canvas.toDataURL('image/jpeg', 0.9);

          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, '', 'FAST');
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
