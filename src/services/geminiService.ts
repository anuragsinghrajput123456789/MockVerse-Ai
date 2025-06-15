
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const generateQuestionPaper = async (formData: any, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const requirements = [
    `- Total marks: ${formData.totalMarks || 100}`,
    `- Difficulty level: ${formData.difficulty || 'Medium'}`,
    `- Board/Book type: ${formData.board || 'NCERT'}`,
    `- Pattern: ${formData.pattern || 'Board-style'}`,
  ];

  if (formData.pattern === 'Custom' && formData.customPatternDetails) {
    requirements.push(`- Custom Pattern Details: ${formData.customPatternDetails}`);
  }
  if (formData.instructions) {
    requirements.push(`- Additional instructions: ${formData.instructions}`);
  }

  const prompt = `Generate a ${formData.subject} question paper for class ${formData.class} based on chapters: ${formData.chapters.join(', ')}${formData.topics ? ` with focus on: ${formData.topics}` : ''}. 

Requirements:
${requirements.join('\n')}

Please format the question paper with:
1. Proper header with subject, class, time, and marks
2. Clear section divisions
3. Proper question numbering
4. Mark allocation for each question
5. Instructions for students

Important: Generate the FULL question paper with all necessary questions to meet the total marks. Do not use placeholders or summaries like "(...continue with more questions)". The paper must be complete and ready to use.

Make it look professional and exam-ready. Use proper markdown formatting for better readability.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
};

export const generateSolutions = async (questionPaper: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const prompt = `Generate detailed solutions for the following question paper. Provide step-by-step solutions with explanations:

${questionPaper}

Please format the solutions with:
1. Question number references
2. Step-by-step working
3. Clear explanations
4. Final answers highlighted
5. Alternative methods where applicable`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to generate solutions');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const evaluateAnswers = async (questionPaper: string, answers: string[], apiKey: string): Promise<any> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const prompt = `Evaluate the following answers for the given question paper and provide marks and detailed feedback. The answers are provided in a list where each element corresponds to a question.

Question Paper:
${questionPaper}

Answers:
${answers.map((ans, i) => `Answer for Q${i + 1}: ${ans}`).join('\n')}

Please provide:
1. A total score.
2. Question-by-question feedback.
3. An overall summary.
Make it structured and easy to read.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to evaluate answers');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

export const sendChatMessage = async (message: string, context: string | undefined, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }

  const prompt = context 
    ? `You are an AI educational assistant helping students with their studies. Here's the context of the current question paper or study material:

${context}

Student's question: ${message}

Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`
    : `You are an AI educational assistant helping students with their studies. 

Student's question: ${message}

Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to get response from chatbot');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
