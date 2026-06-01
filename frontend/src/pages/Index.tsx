import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Chatbot from '../components/Chatbot';
import { QuestionPaper, PaperFormData } from '../types';
import { useToast } from '../hooks/use-toast';
import AnswerTab from '../components/tabs/AnswerTab';
import EvaluateTab from '../components/tabs/EvaluateTab';
import ResourcesTab from '../components/tabs/ResourcesTab';
import { generateQuestionPaper, generateSolutions, evaluateAnswers, getPapers } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Load paper history from backend MySQL on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getPapers();
        setPaperHistory(history);
      } catch (error: any) {
        console.error('Error fetching paper history:', error);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [user]);
  
  const handleGeneratePaper = async (formData: PaperFormData) => {
    setLoading(true);
    try {
      const newPaper = await generateQuestionPaper(formData);
      
      setCurrentPaper(newPaper);
      setPaperHistory(prev => [newPaper, ...prev]);
      setSolutions('');
      setEvaluationResult('');
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
    if (!currentPaper) return;
    
    setLoading(true);
    try {
      const solutionContent = await generateSolutions(currentPaper.id);
      setSolutions(solutionContent);
      setCurrentPaper(prev => prev ? { ...prev, solutions: solutionContent } : null);
      setPaperHistory(prev => prev.map(p => p.id === currentPaper.id ? { ...p, solutions: solutionContent } : p));
      
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
    if (!currentPaper) return;
    
    setLoading(true);
    try {
      const result = await evaluateAnswers(currentPaper.id, answers);
      setEvaluationResult(result);
      setCurrentPaper(prev => prev ? { ...prev, evaluationResult: result } : null);
      setPaperHistory(prev => prev.map(p => p.id === currentPaper.id ? { ...p, evaluationResult: result } : p));
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
    setSolutions(paper.solutions || '');
    setEvaluationResult((paper as any).evaluationResult || '');
    setActiveTab('answer');
  };

  const tabs = [
    { id: 'generate', label: 'Generate', icon: '✨' },
    { id: 'answer', label: 'Answer', icon: '✏️' },
    { id: 'evaluate', label: 'Evaluate', icon: '📊' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  const renderContent = () => {
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-4">Paper History</h2>
            {paperHistory.length === 0 ? (
              <p className="text-gray-500">No papers generated yet.</p>
            ) : (
              <div className="space-y-4">
                {paperHistory.map((paper) => (
                  <div
                    key={paper.id}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-[1.01]"
                    onClick={() => handleSelectPaper(paper)}
                  >
                    <h3 className="font-medium text-indigo-600 dark:text-indigo-400">{paper.subject} - Class {paper.class}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {paper.chapters.join(', ')} • {paper.totalMarks} marks • {paper.difficulty}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative pb-16">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
                AI-Powered Question Papers
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Generate, solve, and evaluate question papers with advanced AI
              </p>
            </div>
            
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            
            {loading && <LoadingSpinner />}
            
            <div className="transition-all duration-300 mt-6">
              {renderContent()}
            </div>
          </div>
        </main>
        
        <Chatbot paperId={currentPaper?.id} />
      </div>
    </ThemeProvider>
  );
};

export default Index;

