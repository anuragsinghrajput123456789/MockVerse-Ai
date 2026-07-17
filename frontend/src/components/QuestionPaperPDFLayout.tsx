
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export interface QuestionPaperPDFLayoutProps {
  content: string;
  title: string;
  type?: "question" | "solution";
  classVal?: string;
  totalMarks?: number;
  difficulty?: string;
  board?: string;
}

// React context to track nested list parameters for layout rendering
const ListContext = React.createContext<{ ordered: boolean; depth: number; startIndex: number }>({
  ordered: false,
  depth: 0,
  startIndex: 1
});

const MarkdownOl: React.FC<any> = ({ node, ...props }) => {
  const parentList = React.useContext(ListContext);
  const startVal = props.start || 1;
  return (
    <ListContext.Provider value={{ ordered: true, depth: parentList.depth + 1, startIndex: startVal }}>
      <ol
        style={{
          marginTop: "6px",
          marginBottom: "6px",
          paddingLeft: "0px",
          listStyleType: "none"
        }}
        {...props}
      />
    </ListContext.Provider>
  );
};

const MarkdownUl: React.FC<any> = ({ node, ...props }) => {
  const parentList = React.useContext(ListContext);
  return (
    <ListContext.Provider value={{ ordered: false, depth: parentList.depth + 1, startIndex: 1 }}>
      <ul
        style={{
          paddingLeft: "0px",
          marginTop: "6px",
          marginBottom: "6px",
          listStyleType: "none"
        }}
        {...props}
      />
    </ListContext.Provider>
  );
};

const MarkdownLi: React.FC<any> = ({ node, index, ...props }) => {
  const { ordered, depth, startIndex } = React.useContext(ListContext);
  const idx = typeof index === 'number' ? index : 0;
  
  let marker: React.ReactNode = null;
  if (ordered) {
    const displayNum = startIndex + idx;
    if (depth === 1) {
      marker = `${displayNum}.`;
    } else if (depth === 2) {
      marker = `${String.fromCharCode(97 + (idx % 26))}.`;
    } else {
      const roman = (num: number): string => {
        const lookup: [string, number][] = [
          ["x", 10], ["ix", 9], ["v", 5], ["iv", 4], ["i", 1]
        ];
        let res = "";
        let val = num;
        for (const [str, limit] of lookup) {
          while (val >= limit) {
            res += str;
            val -= limit;
          }
        }
        return res;
      };
      marker = `${roman(displayNum)}.`;
    }
  } else {
    if (depth === 1) {
      marker = "•";
    } else if (depth === 2) {
      marker = "◦";
    } else {
      marker = "▪";
    }
  }

  const markerWidth = depth === 1 ? "28px" : "22px";
  
  return (
    <li
      style={{
        fontSize: "13pt",
        marginBottom: "10px",
        color: "#000",
        background: "#fff",
        fontFamily: "Times New Roman, Times, Georgia, serif",
        textAlign: "left",
        lineHeight: 1.8,
        listStyleType: "none",
        display: "flex",
        alignItems: "flex-start",
        width: "100%",
        boxSizing: "border-box"
      }}
      {...props}
    >
      <span
        style={{
          display: "inline-block",
          width: markerWidth,
          minWidth: markerWidth,
          fontWeight: ordered && depth === 1 ? "bold" : "normal",
          paddingRight: "6px",
          textAlign: "left",
          boxSizing: "border-box",
          userSelect: "none"
        }}
      >
        {marker}
      </span>
      <div style={{ flex: 1, display: "block" }}>
        {props.children}
      </div>
    </li>
  );
};


const QuestionPaperPDFLayout: React.FC<QuestionPaperPDFLayoutProps> = ({
  content,
  title,
  type = "question",
  classVal = "",
  totalMarks = 100,
  difficulty = "Medium",
  board = "NCERT"
}) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-GB");

  return (
    <div
      className="pdf-main-content tex2jax_process"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0",
        background: "#fff",
        fontFamily: "Times New Roman, Times, Georgia, serif",
        fontSize: "13pt",
        color: "#000",
        boxSizing: "border-box",
        padding: "18mm 15mm 20mm 15mm",
        display: "block",
        border: "none"
      }}
    >
      {/* Header */}
      <div
        className="pdf-header"
        style={{
          border: "3px double #000",
          padding: "16px 20px",
          width: "100%",
          marginBottom: "15px",
          background: "#fff",
          textAlign: "center",
          boxSizing: "border-box",
          display: "block"
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "15pt",
            letterSpacing: "2px",
            textTransform: "uppercase",
            marginBottom: "4px",
            fontFamily: "Times New Roman, Times, Georgia, serif"
          }}
        >
          {board ? `${board.toUpperCase()} EVALUATION` : "ACADEMIC EVALUATION"}
        </div>
        <div
          style={{
            fontWeight: 800,
            fontSize: "18pt",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "15px",
            fontFamily: "Times New Roman, Times, Georgia, serif",
            borderBottom: "1px solid #333",
            paddingBottom: "8px"
          }}
        >
          {type === "question" ? "QUESTION PAPER" : "SOLUTIONS KEY"}
        </div>
        
        {/* Two-Column Metadata Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "none",
            fontSize: "11.5pt",
            fontFamily: "Times New Roman, Times, Georgia, serif",
            color: "#000",
            lineHeight: "1.6"
          }}
        >
          <tbody>
            <tr>
              <td style={{ border: "none", padding: "2px 0", textAlign: "left", width: "50%" }}>
                SUBJECT: <strong>{title ? title.toUpperCase() : "N/A"}</strong>
              </td>
              <td style={{ border: "none", padding: "2px 0", textAlign: "right", width: "50%" }}>
                MAXIMUM MARKS: <strong>{totalMarks}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "2px 0", textAlign: "left" }}>
                CLASS: <strong>{classVal ? (classVal.toLowerCase().includes('grade') || isNaN(Number(classVal)) ? classVal.toUpperCase() : `${classVal}TH GRADE`) : 'N/A'}</strong>
              </td>
              <td style={{ border: "none", padding: "2px 0", textAlign: "right" }}>
                TIME ALLOWED: <strong>{totalMarks > 50 ? "3 HOURS" : "2 HOURS"}</strong>
              </td>
            </tr>
            <tr>
              <td style={{ border: "none", padding: "2px 0", textAlign: "left" }}>
                BOARD: <strong>{board ? board.toUpperCase() : "NCERT"}</strong>
              </td>
              <td style={{ border: "none", padding: "2px 0", textAlign: "right" }}>
                DATE: <strong>{formattedDate}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* General Instructions Box */}
      {type === "question" && (
        <div
          className="pdf-instructions"
          style={{
            border: "1.5px solid #000",
            padding: "12px 18px",
            marginBottom: "15px",
            fontSize: "11.5pt",
            background: "#fff",
            fontFamily: "Times New Roman, Times, Georgia, serif",
            boxSizing: "border-box"
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: "12pt",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            GENERAL INSTRUCTIONS:
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px"
            }}
          >
            {[
              "Read all instructions carefully before attempting the questions.",
              "Attempt all questions. There is no negative marking.",
              "Write your answers neatly and legibly. Extra sheets are not provided.",
              "Use of calculators, mobile phones, or any electronic gadgets is strictly prohibited.",
              "Verify that your question paper contains all questions and sections before starting."
            ].map((instruction, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  lineHeight: "1.5"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "18px",
                    minWidth: "18px",
                    textAlign: "left",
                    userSelect: "none"
                  }}
                >
                  •
                </span>
                <span style={{ flex: 1 }}>{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question Content */}
      <div className="pdf-markdown-container">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => (
              <h1
                style={{
                  fontFamily: "Times New Roman, Times, Georgia, serif",
                  fontWeight: "bold",
                  fontSize: "15.8pt",
                  letterSpacing: "0.4px",
                  margin: "17px 0 8px 0",
                  border: "none",
                  textAlign: "left",
                  color: "#000",
                  background: "#fff"
                }}
                {...props}
              />
            ),
            h2: ({node, ...props}) => (
              <h2
                style={{
                  fontFamily: "inherit",
                  fontWeight: "bold",
                  fontSize: "14pt",
                  border: "none",
                  margin: "13px 0 6px 0",
                  textAlign: "left",
                  color: "#000",
                  background: "#fff",
                  padding: 0
                }}
                {...props}
              />
            ),
            h3: ({node, ...props}) => (
              <h3
                style={{
                  fontFamily: "inherit",
                  fontWeight: "bold",
                  fontSize: "13pt",
                  border: "none",
                  margin: "10px 0 6px 0",
                  textAlign: "left",
                  color: "#000",
                  background: "#fff",
                  padding: 0
                }}
                {...props}
              />
            ),
            p: ({node, ...props}) => (
              <p
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "13pt",
                  textAlign: "left",
                  color: "#000",
                  background: "#fff",
                  lineHeight: 1.9
                }}
                {...props}
              />
            ),
            ol: MarkdownOl,
            ul: MarkdownUl,
            li: MarkdownLi,
            strong: ({ node, ...props }) => (
              <strong
                style={{
                  fontWeight: "bold",
                  color: "#000",
                  background: "#fff",
                  fontFamily: "inherit",
                  fontSize: "inherit"
                }}
                {...props}
              />
            ),
            table: ({ node, ...props }) => (
              <table
                style={{
                  width: "100%",
                  margin: "11px 0 10px 0",
                  borderCollapse: "collapse",
                  border: "1px solid #222",
                  background: "#fff"
                }}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                style={{
                  border: "1px solid #222",
                  padding: "4px 7px",
                  fontFamily: "Times New Roman, Times, Georgia, serif",
                  fontSize: "12pt",
                  color: "#000"
                }}
                {...props}
              />
            ),
            th: ({ node, ...props }) => (
              <th
                style={{
                  border: "1px solid #222",
                  padding: "4px 7px",
                  fontFamily: "Times New Roman, Times, Georgia, serif",
                  fontSize: "12pt",
                  color: "#000"
                }}
                {...props}
              />
            )
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          width: "100%",
          marginTop: "25px",
          paddingTop: "6px",
          borderTop: "1px solid #111",
          fontSize: "11pt",
          color: "#222",
          background: "#fff",
          fontFamily: "Times New Roman, Times, Georgia, serif",
          fontWeight: "normal"
        }}
      >
        Generated on {formattedDate} | {type === "question" ? "Question Paper" : "Solutions"}
      </div>
    </div>
  );
};

export default QuestionPaperPDFLayout;

