
import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import HistoryList from '../components/HistoryList';
import LoadingSpinner from '../components/LoadingSpinner';
import Chatbot from '../components/Chatbot';
import { QuestionPaper, PaperFormData } from '../types';
import { useToast } from '../hooks/use-toast';
import UserMenu from '../components/UserMenu';
import AnswerTab from '../components/tabs/AnswerTab';
import EvaluateTab from '../components/tabs/EvaluateTab';
import ResourcesTab from '../components/tabs/ResourcesTab';
import { useAuthSession } from '../hooks/useAuthSession';
import { usePaperHistory } from '../hooks/usePaperHistory';
import { usePaperActions } from '../hooks/usePaperActions';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [logoutLoading, setLogoutLoading] = useState(false);
  
  const { session, checkingSession } = useAuthSession();
  const { data: paperHistory = [], isLoading: historyLoading } = usePaperHistory(session);
  const { generatePaperMutation, generateSolutionsMutation, evaluateAnswersMutation } = usePaperActions(session);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      setCurrentPaper(null);
      setSolutions('');
      setEvaluationResult('');
      setActiveTab('generate');
    }
  }, [session]);
  
  const handleGeneratePaper = (formData: PaperFormData) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate a paper.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    generatePaperMutation.mutate(formData, {
      onSuccess: (paper) => {
        setCurrentPaper(paper);
        setActiveTab('answer');
        toast({
          title: "Question Paper Generated!",
          description: "Your paper has been generated and saved.",
        });
      },
      onError: (error) => {
        console.error('Error generating paper:', error);
        toast({
          title: "Error",
          description: "Failed to generate paper. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleGenerateSolutions = () => {
    if (!currentPaper) return;
    generateSolutionsMutation.mutate(currentPaper.questions, {
      onSuccess: (solutionContent) => {
        setSolutions(solutionContent);
        toast({
          title: "Solutions Generated!",
          description: "Solutions have been generated successfully.",
        });
      },
      onError: (error) => {
        console.error('Error generating solutions:', error);
        toast({
          title: "Error",
          description: "Failed to generate solutions. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSubmitAnswers = (answers: string[]) => {
    if (!currentPaper) return;
    evaluateAnswersMutation.mutate({ questions: currentPaper.questions, answers }, {
      onSuccess: (result) => {
        setEvaluationResult(result);
        setActiveTab('evaluate');
        toast({
          title: "Answers Evaluated!",
          description: "Your answers have been evaluated successfully.",
        });
      },
      onError: (error) => {
        console.error('Error evaluating answers:', error);
        toast({
          title: "Error",
          description: "Failed to evaluate answers. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  const handleSelectPaper = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setSolutions('');
    setEvaluationResult('');
    setActiveTab('answer');
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    const { error } = await supabase.auth.signOut();
    setLogoutLoading(false);
    if (error) {
      toast({ title: "Logout Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    }
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
  
  const loading = historyLoading || generatePaperMutation.isPending || generateSolutionsMutation.isPending || evaluateAnswersMutation.isPending;

  const renderContent = () => {
    switch (activeTab) {
      case 'generate':
        return <PaperForm onSubmit={handleGeneratePaper} loading={generatePaperMutation.isPending} />;
      
      case 'answer':
        return (
          <AnswerTab
            currentPaper={currentPaper}
            solutions={solutions}
            loading={generateSolutionsMutation.isPending}
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
        return <HistoryList papers={paperHistory} onSelect={handleSelectPaper} />;
      
      default:
        return null;
    }
  };

  if (checkingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
        <Header />
        <UserMenu session={session} onLogout={handleLogout} loading={logoutLoading} />
        
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
            
            <div className="transition-all duration-300">
              {renderContent()}
            </div>
          </div>
        </main>
        
        <Chatbot context={getChatbotContext()} />
      </div>
    </ThemeProvider>
  );
};

export default Index;
