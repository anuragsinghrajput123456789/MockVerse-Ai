
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
        margin: "0 auto",
        background: "#fff",
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "13pt",
        color: "#000",
        boxSizing: "border-box",
        padding: "18mm 15mm 20mm 15mm",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        border: "none"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "1.5px solid #222",
          padding: 0,
          width: "100%",
          marginBottom: "13px",
          background: "#fff"
        }}
      >
        <div
          style={{
            padding: "16px 0 0 0",
            fontWeight: 700,
            fontSize: "19pt",
            letterSpacing: "1px",
            textAlign: "center",
            textTransform: "uppercase"
          }}
        >
          QUESTION PAPER
        </div>
        <div
          style={{
            padding: "0 0 13px 0",
            textAlign: "center",
            fontSize: "11.5pt"
          }}
        >
          SUBJECT: <b>{title}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
          CLASS: <b>{classVal ? (classVal.toLowerCase().includes('grade') || isNaN(Number(classVal)) ? classVal : `${classVal}th Grade`) : 'N/A'}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
          BOARD: <b>{board || 'N/A'}</b> &nbsp;&nbsp;|&nbsp;&nbsp;
          MARKS: <b>{totalMarks}</b>
        </div>
      </div>

      {/* General Instructions box */}
      {type === "question" && (
        <div
          style={{
            border: "1.5px solid #000",
            padding: "10px 18px 10px 20px",
            marginBottom: "13px",
            fontSize: "11.8pt",
            background: "#fff",
            fontFamily: "'Times New Roman', Times, serif"
          }}
        >
          <div
            style={{
              fontWeight: "bolder",
              fontSize: "13.5pt",
              marginBottom: ".5em",
              letterSpacing: "0.2px"
            }}
          >
            GENERAL INSTRUCTIONS
          </div>
          <ul
            style={{
              margin: 0,
              padding: "0 0 0 20px",
              listStyleType: "square",
              lineHeight: 1.7
            }}
          >
            <li style={{ marginBottom: "4px" }}>
              Read all instructions carefully before attempting.
            </li>
            <li style={{ marginBottom: "4px" }}>
              Attempt all questions unless instructed otherwise.
            </li>
            <li style={{ marginBottom: "4px" }}>
              Write clearly. No extra sheets allowed unless asked.
            </li>
            <li style={{ marginBottom: "4px" }}>
              Use only blue or black ink pen for writing answers.
            </li>
            <li style={{ marginBottom: "4px" }}>
              Calculators/mobile phones are not permitted.
            </li>
            <li>All questions carry equal marks unless specified.</li>
          </ul>
        </div>
      )}

      {/* Question Content */}
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => (
              <h1
                style={{
                  fontFamily: "'Times New Roman', Times, serif",
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
            ol: ({node, ...props}) => (
              <ol
                style={{
                  marginTop: "8px",
                  marginBottom: "8px",
                  paddingLeft: "25px"
                }}
                {...props}
              />
            ),
            ul: ({node, ...props}) => (
              <ul
                style={{
                  paddingLeft: "20px",
                  marginTop: "4px",
                  marginBottom: "7px",
                  listStyleType: "lower-alpha"
                }}
                {...props}
              />
            ),
            li: ({node, ...props}) => (
              <li
                style={{
                  fontSize: "13pt",
                  marginBottom: "12px",
                  paddingBottom: "0px",
                  color: "#000",
                  background: "#fff",
                  fontFamily: "'Times New Roman', Times, serif",
                  textAlign: "left",
                  lineHeight: 1.9,
                  paddingLeft: "1.5px",
                  position: "relative",
                  border: "none"
                }}
                {...props}
              />
            ),
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
                  fontFamily: "'Times New Roman',Times,serif",
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
                  fontFamily: "'Times New Roman',Times,serif",
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
          fontFamily: "'Times New Roman', Times, serif",
          fontWeight: "normal"
        }}
      >
        Generated on {formattedDate} | {type === "question" ? "Question Paper" : "Solutions"}
      </div>
    </div>
  );
};

export default QuestionPaperPDFLayout;
