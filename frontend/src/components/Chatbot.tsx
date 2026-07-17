import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Minimize2, Cpu, User, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { sendChatMessage } from '../services/apiService';
import { useToast } from '../hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatbotProps {
  paperId?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ paperId }) => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const historyPayload = messages.map(msg => ({
        text: msg.text,
        isUser: msg.isUser
      }));
      const response = await sendChatMessage(inputMessage, paperId, historyPayload);
      
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
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_25px_rgba(99,102,241,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.5)] z-50 group border border-white/20 animate-pulse-glow"
        aria-label="Open Chatbot"
      >
        <MessageCircle className="h-6 w-6 transition-transform group-hover:rotate-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] glass-panel border border-white/10 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.6)] z-50 overflow-hidden transition-all duration-300 flex flex-col ${
      isMinimized ? 'h-16' : 'h-[500px]'
    }`}>
      {/* Absolute ambient mesh backdrop */}
      <div className="absolute inset-0 glow-bg-indigo opacity-25 pointer-events-none rounded-full blur-[80px] -top-1/2" />

      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5 relative z-10 shrink-0 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-4 h-4 animate-float" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide leading-none flex items-center gap-1">
              <span>AI Tutor Assistant</span>
              <Sparkles className="w-3 h-3 text-pink-400 fill-pink-400" />
            </h3>
            <span className="text-[9px] text-emerald-400 font-semibold tracking-widest uppercase mt-1 block flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              Online
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative z-10 scrollbar-thin">
            {messages.map((message) => {
              const isUser = message.isUser;
              return (
                <div
                  key={message.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5 shadow-sm">
                      <Cpu className="w-3.5 h-3.5" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-tr-none font-medium'
                        : 'bg-white/5 border border-white/5 text-slate-200 rounded-tl-none prose prose-invert prose-xs'
                    }`}
                  >
                    {isUser ? (
                      message.text
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 text-justify text-[11px] md:text-xs text-slate-200">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1 text-[11px] md:text-xs text-slate-200">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1 text-[11px] md:text-xs text-slate-200">{children}</ol>,
                          li: ({ children }) => <li className="mb-0.5 text-slate-200 leading-normal">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                          code: ({ children }) => <code className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono text-pink-400">{children}</code>
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-500/10 to-pink-500/10 border border-indigo-500/30 flex items-center justify-center text-pink-400 shrink-0 mt-0.5 shadow-sm">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            
            {isLoading && (
              <div className="flex items-start gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <Cpu className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-1.5 py-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Panel */}
          <div className="border-t border-white/10 p-4 relative z-10 bg-slate-950/20 shrink-0">
            <div className="flex space-x-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/10 transition-all">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask your study assistant..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-none text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-0 w-full min-h-[36px]"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white flex items-center justify-center shadow-md transition-all hover:scale-105 shrink-0 self-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatbot;
