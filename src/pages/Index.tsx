
import React, { useState } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Chatbot from '../components/Chatbot';
import ApiKeyInput from '../components/ApiKeyInput';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
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
        description: "Your complete paper has been generated successfully.",
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="w-full max-w-md">
            <ApiKeyInput onSave={saveApiKey} />
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'generate':
        return (
          <div className="w-full max-w-4xl mx-auto px-4">
            <PaperForm onSubmit={handleGeneratePaper} loading={loading} />
          </div>
        );
      
      case 'answer':
        return (
          <div className="w-full max-w-6xl mx-auto px-4">
            <AnswerTab
              currentPaper={currentPaper}
              solutions={solutions}
              loading={loading}
              onGenerateSolutions={handleGenerateSolutions}
              onSubmitAnswers={handleSubmitAnswers}
              onNavigateToGenerate={() => setActiveTab('generate')}
            />
          </div>
        );
      
      case 'evaluate':
        return (
          <div className="w-full max-w-6xl mx-auto px-4">
            <EvaluateTab
              evaluationResult={evaluationResult}
              onNavigateToAnswer={() => setActiveTab('answer')}
            />
          </div>
        );
      
      case 'resources':
        return (
          <div className="w-full max-w-6xl mx-auto px-4">
            <ResourcesTab />
          </div>
        );
      
      case 'history':
        return (
          <div className="w-full max-w-4xl mx-auto px-4">
            <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Paper History
                </h2>
                {paperHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No papers generated yet.</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      Create your first question paper to see it here!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {paperHistory.map((paper) => (
                      <Card
                        key={paper.id}
                        className="cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                        onClick={() => handleSelectPaper(paper)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                                {paper.subject} - Class {paper.class}
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                                  {paper.totalMarks} marks
                                </span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                                  {paper.difficulty}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs">
                                  {paper.board}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Chapters: {paper.chapters.join(', ')}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                Created: {paper.createdAt.toLocaleDateString()} at {paper.createdAt.toLocaleTimeString()}
                              </p>
                            </div>
                            <div className="text-2xl opacity-50">📄</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-all duration-500">
        <Header />
        
        {apiKey && (
          <div className="fixed top-20 right-4 z-40">
            <Button
              variant="outline"
              size="sm"
              onClick={clearApiKey}
              className="text-xs px-3 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 shadow-lg"
            >
              Change API Key
            </Button>
          </div>
        )}
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12 px-4">
              <div className="inline-block mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <span className="text-white font-bold text-2xl md:text-3xl">📝</span>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6 leading-tight">
                AI Question Paper Generator
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Generate comprehensive question papers with complete questions and proper mark distribution
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🎯 Complete Papers</span>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📊 Proper Marks</span>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">💡 Instant Solutions</span>
                </div>
              </div>
            </div>
            
            {apiKey && (
              <div className="mb-8">
                <TabNavigation
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
              </div>
            )}
            
            {loading && (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
                  <LoadingSpinner />
                </div>
              </div>
            )}
            
            <div className="transition-all duration-500 ease-in-out">
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
