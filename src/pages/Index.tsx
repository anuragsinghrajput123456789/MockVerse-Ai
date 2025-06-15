import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import PaperForm from '../components/PaperForm';
import QuestionPaperDisplay from '../components/QuestionPaperDisplay';
import AnswerForm from '../components/AnswerForm';
import EvaluationResult from '../components/EvaluationResult';
import ResourceForm from '../components/ResourceForm';
import ResourceList from '../components/ResourceList';
import HistoryList from '../components/HistoryList';
import LoadingSpinner from '../components/LoadingSpinner';
import ScrollToTop from '../components/ScrollToTop';
import Chatbot from '../components/Chatbot';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateQuestionPaper, generateSolutions, evaluateAnswers } from '../services/geminiService';
import { QuestionPaper, Resource, PaperFormData } from '../types';
import { useToast } from '../hooks/use-toast';
import PomodoroTimer from '../components/PomodoroTimer';
import { supabase } from '../integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);
  const [resources, setResources] = useLocalStorage<Resource[]>('resources', []);
  
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

  const handleAddResource = (resourceData: Omit<Resource, 'id' | 'createdAt'>) => {
    const resource: Resource = {
      id: Date.now().toString(),
      ...resourceData,
      createdAt: new Date()
    };
    
    setResources(prev => [resource, ...prev]);
    
    toast({
      title: "Resource Added!",
      description: "Learning resource has been added successfully.",
    });
  };

  const handleSelectPaper = (paper: QuestionPaper) => {
    setCurrentPaper(paper);
    setActiveTab('answer');
  };

  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
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
          <div className="space-y-8">
            {currentPaper ? (
              <>
                <QuestionPaperDisplay
                  content={currentPaper.questions}
                  title="Question Paper"
                  type="question"
                  onGenerateSolutions={handleGenerateSolutions}
                  onStartAnswering={() => setShowAnswerForm(true)}
                  loading={loading}
                />
                
                {solutions && (
                  <QuestionPaperDisplay
                    content={solutions}
                    title="Solutions"
                    type="solution"
                  />
                )}
                
                {showAnswerForm && (
                  <>
                    <PomodoroTimer />
                    <AnswerForm
                      questionPaper={currentPaper.questions}
                      onSubmit={handleSubmitAnswers}
                      loading={loading}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No question paper available. Generate one first!
                </p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-lg hover:from-indigo-600 hover:to-pink-600 transition-all"
                >
                  Generate Question Paper
                </button>
              </div>
            )}
          </div>
        );
      
      case 'evaluate':
        return evaluationResult ? (
          <EvaluationResult result={evaluationResult} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No evaluation results available. Submit your answers first!
            </p>
            <button
              onClick={() => setActiveTab('answer')}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
            >
              Submit Answers
            </button>
          </div>
        );
      
      case 'resources':
        return (
          <div className="space-y-8">
            <ResourceForm onAdd={handleAddResource} />
            <ResourceList resources={resources} />
          </div>
        );
      
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
        <div className="absolute top-4 right-4 z-10">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:block font-medium">
                {session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-md hover:from-red-600 hover:to-orange-600 transition-all text-sm font-semibold"
                disabled={loading}
              >
                {loading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-md hover:from-green-600 hover:to-blue-600 transition-all text-sm font-semibold"
            >
              Login / Sign Up
            </button>
          )}
        </div>
        
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
