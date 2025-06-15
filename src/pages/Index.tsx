import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import HistoryList from '../components/HistoryList';
import LoadingSpinner from '../components/LoadingSpinner';
import ScrollToTop from '../components/ScrollToTop';
import Chatbot from '../components/Chatbot';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateQuestionPaper, generateSolutions, evaluateAnswers } from '../services/geminiService';
import { QuestionPaper, PaperFormData } from '../types';
import { useToast } from '../hooks/use-toast';
import PomodoroTimer from '../components/PomodoroTimer';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import AnswerTab from '../components/tabs/AnswerTab';
import EvaluateTab from '../components/tabs/EvaluateTab';
import ResourcesTab from '../components/tabs/ResourcesTab';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchHistory();
    } else {
      setPaperHistory([]);
    }
  }, [session]);

  const fetchHistory = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('question_papers')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedPapers: QuestionPaper[] = data.map(p => ({
          id: p.id,
          subject: p.subject,
          class: p.class,
          totalMarks: p.total_marks,
          difficulty: p.difficulty as any,
          board: p.board,
          chapters: p.chapters,
          topics: p.topics || '',
          instructions: p.instructions || '',
          pattern: p.pattern,
          questions: p.questions,
          createdAt: new Date(p.created_at),
        }));
        setPaperHistory(formattedPapers);
      }
    } catch (error) {
      console.error('Error fetching paper history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch paper history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleGeneratePaper = async (formData: PaperFormData) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please log in to generate and save a question paper.",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const content = await generateQuestionPaper(formData);
      
      const newPaperDataForDb = {
        user_id: session.user.id,
        subject: formData.subject,
        class: formData.class,
        total_marks: formData.totalMarks,
        difficulty: formData.difficulty,
        board: formData.board,
        chapters: formData.chapters,
        topics: formData.topics,
        instructions: formData.instructions,
        pattern: formData.pattern,
        questions: content,
      };

      const { data: savedPaper, error: insertError } = await supabase
        .from('question_papers')
        .insert(newPaperDataForDb)
        .select()
        .single();
      
      if (insertError) throw insertError;

      const paper: QuestionPaper = {
        id: savedPaper.id,
        subject: savedPaper.subject,
        class: savedPaper.class,
        totalMarks: savedPaper.total_marks,
        difficulty: savedPaper.difficulty as any,
        board: savedPaper.board,
        chapters: savedPaper.chapters,
        topics: savedPaper.topics || '',
        instructions: savedPaper.instructions || '',
        pattern: savedPaper.pattern,
        questions: savedPaper.questions,
        createdAt: new Date(savedPaper.created_at),
      };
      
      setCurrentPaper(paper);
      setPaperHistory(prev => [paper, ...prev]);
      setActiveTab('answer');
      
      toast({
        title: "Question Paper Generated!",
        description: "Your question paper has been generated and saved successfully.",
      });
    } catch (error) {
      console.error('Error generating paper:', error);
      toast({
        title: "Error",
        description: "Failed to generate question paper. Please try again.",
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
      const solutionContent = await generateSolutions(currentPaper.questions);
      setSolutions(solutionContent);
      
      toast({
        title: "Solutions Generated!",
        description: "Solutions have been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating solutions:', error);
      toast({
        title: "Error",
        description: "Failed to generate solutions. Please try again.",
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
      const result = await evaluateAnswers(currentPaper.questions, answers);
      setEvaluationResult(result);
      setActiveTab('evaluate');
      
      toast({
        title: "Answers Evaluated!",
        description: "Your answers have been evaluated successfully.",
      });
    } catch (error) {
      console.error('Error evaluating answers:', error);
      toast({
        title: "Error",
        description: "Failed to evaluate answers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaper = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setActiveTab('answer');
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    const { error } = await supabase.auth.signOut();
    setLogoutLoading(false);
    if (error) {
      toast({ title: "Logout Error", description: error.message, variant: "destructive" });
    } else {
      setSession(null);
      setCurrentPaper(null);
      setSolutions('');
      setEvaluationResult('');
      setPaperHistory([]);
      setActiveTab('generate');
      navigate('/');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    }
  };

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
        return <HistoryList papers={paperHistory} onSelect={handleSelectPaper} />;
      
      default:
        return null;
    }
  };

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
        
        <ScrollToTop />
        <Chatbot context={getChatbotContext()} />
      </div>
    </ThemeProvider>
  );
};

export default Index;
