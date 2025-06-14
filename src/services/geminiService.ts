
const GEMINI_API_KEY = 'AIzaSyBprDdLZVyo0Pv6l_Rzx9ReTIWFqkSSGgo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const generateQuestionPaper = async (formData: any): Promise<string> => {
  // Check if API key is still the placeholder
  if (GEMINI_API_KEY === 'YOUR_NEW_GEMINI_API_KEY_HERE') {
    throw new Error('Please replace GEMINI_API_KEY with your actual API key from Google AI Studio');
  }

  const prompt = `Generate a ${formData.subject} question paper for class ${formData.class} based on chapters: ${formData.chapters.join(', ')}${formData.topics ? ` with focus on: ${formData.topics}` : ''}. 

Requirements:
- Total marks: ${formData.totalMarks}
- Difficulty level: ${formData.difficulty}
- Board/Book type: ${formData.board}
- Pattern: ${formData.pattern}
${formData.instructions ? `- Additional instructions: ${formData.instructions}` : ''}

Please format the question paper with:
1. Proper header with subject, class, time, and marks
2. Clear section divisions
3. Proper question numbering
4. Mark allocation for each question
5. Instructions for students

Make it look professional and exam-ready.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to generate question paper');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const generateSolutions = async (questionPaper: string): Promise<string> => {
  // Check if API key is still the placeholder
  if (GEMINI_API_KEY === 'YOUR_NEW_GEMINI_API_KEY_HERE') {
    throw new Error('Please replace GEMINI_API_KEY with your actual API key from Google AI Studio');
  }

  const prompt = `Generate detailed solutions for the following question paper. Provide step-by-step solutions with explanations:

${questionPaper}

Please format the solutions with:
1. Question number references
2. Step-by-step working
3. Clear explanations
4. Final answers highlighted
5. Alternative methods where applicable`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to generate solutions');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const evaluateAnswers = async (questionPaper: string, answers: string[]): Promise<any> => {
  // Check if API key is still the placeholder
  if (GEMINI_API_KEY === 'YOUR_NEW_GEMINI_API_KEY_HERE') {
    throw new Error('Please replace GEMINI_API_KEY with your actual API key from Google AI Studio');
  }

  const prompt = `Evaluate the following answers for the given question paper and provide detailed feedback:

Question Paper:
${questionPaper}

Student Answers:
${answers.map((answer, index) => `Question ${index + 1}: ${answer}`).join('\n')}

Please provide:
1. Marks for each question
2. Total marks obtained
3. Percentage
4. Grade (A+/A/B+/B/C+/C/D/F)
5. Overall feedback
6. Specific feedback for each answer
7. Areas for improvement
8. Suggestions for better performance

Format the response as a structured evaluation report.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to evaluate answers');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
