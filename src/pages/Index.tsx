
import React, { useState } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Chatbot from '../components/Chatbot';
import ApiKeyInput from '../components/ApiKeyInput';
import { Button } from '../components/ui/button';
import { QuestionPaper, PaperFormData } from '../types';
import { useToast } from '../hooks/use-toast';
import AnswerTab from '../components/tabs/AnswerTab';
import EvaluateTab from '../components/tabs/EvaluateTab';
import ResourcesTab from '../components/tabs/ResourcesTab';
import { generateQuestionPaper, generateSolutions, evaluateAnswers } from '../services/geminiService';
import { useApiKey } from '../hooks/useApiKey';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);
  
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();
  const { toast } = useToast();
  
  const handleGeneratePaper = async (formData: PaperFormData) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Gemini API key first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const content = await generateQuestionPaper(formData, apiKey);
      
      const newPaper: QuestionPaper = {
        id: Date.now().toString(),
        subject: formData.subject,
        class: formData.class,
        totalMarks: formData.totalMarks,
        difficulty: formData.difficulty,
        board: formData.board,
        chapters: formData.chapters,
        topics: formData.topics || '',
        instructions: formData.instructions || '',
        pattern: formData.pattern,
        questions: content,
        createdAt: new Date(),
      };

      setCurrentPaper(newPaper);
      setPaperHistory(prev => [newPaper, ...prev]);
      setActiveTab('answer');
      
      toast({
        title: "Question Paper Generated!",
        description: "Your paper has been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating paper:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate paper. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSolutions = async () => {
    if (!currentPaper || !apiKey) return;
    
    setLoading(true);
    try {
      const solutionContent = await generateSolutions(currentPaper.questions, apiKey);
      setSolutions(solutionContent);
      toast({
        title: "Solutions Generated!",
        description: "Solutions have been generated successfully.",
      });
    } catch (error: any) {
      console.error('Error generating solutions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate solutions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = async (answers: string[]) => {
    if (!currentPaper || !apiKey) return;
    
    setLoading(true);
    try {
      const result = await evaluateAnswers(currentPaper.questions, answers, apiKey);
      setEvaluationResult(result);
      setActiveTab('evaluate');
      toast({
        title: "Answers Evaluated!",
        description: "Your answers have been evaluated successfully.",
      });
    } catch (error: any) {
      console.error('Error evaluating answers:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to evaluate answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaper = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setSolutions('');
    setEvaluationResult('');
    setActiveTab('answer');
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: '✨' },
    { id: 'answer', label: 'Answer', icon: '✏️' },
    { id: 'evaluate', label: 'Evaluate', icon: '📊' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  const getChatbotContext = () => {
    if (currentPaper) {
      return `Current Question Paper:\n${currentPaper.questions}${solutions ? `\n\nSolutions:\n${solutions}` : ''}`;
    }
    return undefined;
  };

  const renderContent = () => {
    if (!apiKey) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
          <ApiKeyInput onSave={saveApiKey} />
        </div>
      );
    }

    switch (activeTab) {
      case 'generate':
        return <PaperForm onSubmit={handleGeneratePaper} loading={loading} />;
      
      case 'answer':
        return (
          <AnswerTab
            currentPaper={currentPaper}
            solutions={solutions}
            loading={loading}
            onGenerateSolutions={handleGenerateSolutions}
            onSubmitAnswers={handleSubmitAnswers}
            onNavigateToGenerate={() => setActiveTab('generate')}
          />
        );
      
      case 'evaluate':
        return (
          <EvaluateTab
            evaluationResult={evaluationResult}
            onNavigateToAnswer={() => setActiveTab('answer')}
          />
        );
      
      case 'resources':
        return <ResourcesTab />;
      
      case 'history':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 mx-3 md:mx-0">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Paper History</h2>
            {paperHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No papers generated yet.</p>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {paperHistory.map((paper) => (
                  <div
                    key={paper.id}
                    className="border rounded-lg p-3 md:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => handleSelectPaper(paper)}
                  >
                    <h3 className="font-medium text-sm md:text-base">{paper.subject} - Class {paper.class}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {paper.chapters.join(', ')} • {paper.totalMarks} marks • {paper.difficulty}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Created: {paper.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
        <Header />
        
        {apiKey && (
          <div className="absolute top-16 md:top-4 right-3 md:right-4 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={clearApiKey}
              className="text-xs px-2 md:px-3"
            >
              Change API Key
            </Button>
          </div>
        )}
        
        <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-12 px-2">
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3 md:mb-4 leading-tight">
                AI-Powered Question Papers
              </h1>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Generate, solve, and evaluate question papers with advanced AI
              </p>
            </div>
            
            {apiKey && (
              <div className="mb-4 md:mb-6">
                <TabNavigation
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            )}
            
            {loading && <LoadingSpinner />}
            
            <div className="transition-all duration-300">
              {renderContent()}
            </div>
          </div>
        </main>
        
        {apiKey && <Chatbot context={getChatbotContext()} apiKey={apiKey} />}
      </div>
    </ThemeProvider>
  );
};

export default Index;
