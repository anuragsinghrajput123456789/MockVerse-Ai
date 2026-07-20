import { AI_TIMEOUT } from './shared/apiConfig';
import { httpPost } from './shared/httpClient';

// Send chatbot message
export const sendChatMessage = async (
  message: string,
  paperId?: string,
  history?: { text: string; isUser: boolean }[]
): Promise<string> => {
  const data = await httpPost<{ response: string }>(
    '/chat',
    { message, paperId, history },
    AI_TIMEOUT,
    'Failed to send message to chatbot'
  );
  return data.response;
};
