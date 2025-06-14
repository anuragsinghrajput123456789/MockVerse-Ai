
const GEMINI_API_KEY = 'AIzaSyBprDdLZVyo0Pv6l_Rzx9ReTIWFqkSSGgo';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export const sendChatMessage = async (message: string, context?: string): Promise<string> => {
  const prompt = context 
    ? `You are an AI educational assistant helping students with their studies. Here's the context of the current question paper or study material:

${context}

Student's question: ${message}

Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`
    : `You are an AI educational assistant helping students with their studies. 

Student's question: ${message}

Please provide a helpful, educational response that helps the student understand the concepts better. Be clear, concise, and encouraging.`;

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
    throw new Error(errorData.error?.message || 'Failed to get response from chatbot');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
