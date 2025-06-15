
import { supabase } from '../integrations/supabase/client';

export const sendChatMessage = async (message: string, context?: string): Promise<string> => {
  const { data, error } = await supabase.functions.invoke('chatbot', {
    body: { message, context },
  });

  if (error) {
    console.error('Error invoking chatbot function:', error);
    throw new Error(error.message);
  }
  
  if (data.error) {
    throw new Error(data.error);
  }

  return data.content;
};
