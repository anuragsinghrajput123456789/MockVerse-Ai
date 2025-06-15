
import { supabase } from '../integrations/supabase/client';
import { PaperFormData } from '../types';

export const generateQuestionPaper = async (formData: PaperFormData): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-paper', {
    body: formData,
  });

  if (error) {
    console.error('Error invoking generate-paper function:', error);
    throw new Error(error.message);
  }
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.content;
};

export const generateSolutions = async (questionPaper: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('generate-solutions', {
    body: { questionPaper },
  });

  if (error) {
    console.error('Error invoking generate-solutions function:', error);
    throw new Error(error.message);
  }
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.content;
};

export const evaluateAnswers = async (questionPaper: string, answers: string[]): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('evaluate-answers', {
    body: { questionPaper, answers },
  });

  if (error) {
    console.error('Error invoking evaluate-answers function:', error);
    throw new Error(error.message);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.content;
};
