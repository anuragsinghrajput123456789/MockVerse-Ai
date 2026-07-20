import { useState, useCallback, useRef } from 'react';
import { useToast } from '../../shared/hooks/use-toast';
import { sendChatMessage } from '../../shared/services/chatService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export function useChat(paperId?: string) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your MockVerse AI study companion. Ask me anything about your current question paper, subjects, or study plans!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isLoading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Map prior messages to send history (last 6 messages max)
      const historyPayload = messages.slice(-6).map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      
      const response = await sendChatMessage(messageText, paperId, historyPayload);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Assistant Error",
        description: error.message || "Failed to reach AI tutor. Please check server connection.",
        variant: "destructive",
      });
    } finally {
      isSubmittingRef.current = false;
      setIsLoading(false);
    }
  }, [inputMessage, isLoading, messages, paperId, toast]);

  return {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    handleSendMessage
  };
}

export default useChat;
