const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth headers
const getHeaders = (isJson = true) => {
  const token = localStorage.getItem('mockverse_token');
  const headers: Record<string, string> = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Generate Question Paper
export const generateQuestionPaper = async (formData: any): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/papers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      subject: formData.subject,
      class: formData.class,
      totalMarks: Number(formData.totalMarks) || 100,
      difficulty: formData.difficulty,
      board: formData.board,
      chapters: formData.chapters,
      topics: formData.topics || '',
      instructions: formData.instructions || '',
      pattern: formData.pattern,
      customPatternDetails: formData.customPatternDetails || '',
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to generate question paper');
  }

  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};

// Get all papers (history)
export const getPapers = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE_URL}/papers`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch paper history');
  }

  const data = await res.json();
  return data.map((paper: any) => ({
    ...paper,
    createdAt: new Date(paper.createdAt),
  }));
};

// Get details of a specific paper
export const getPaperById = async (id: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/papers/${id}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to fetch paper details');
  }

  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
  };
};


// Delete a paper
export const deletePaper = async (id: string): Promise<any> => {
  const res = await fetch(`${API_BASE_URL}/papers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to delete question paper');
  }

  return await res.json();
};

// Generate Solutions
export const generateSolutions = async (paperId: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/solutions`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to generate solutions');
  }

  const data = await res.json();
  return data.solutions;
};

// Evaluate submitted answers
export const evaluateAnswers = async (paperId: string, answers: string[]): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/evaluate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to evaluate answers');
  }

  const data = await res.json();
  return data.evaluationResult;
};

// Send chatbot message
export const sendChatMessage = async (message: string, paperId?: string): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, paperId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to send message to chatbot');
  }

  const data = await res.json();
  return data.response;
};
