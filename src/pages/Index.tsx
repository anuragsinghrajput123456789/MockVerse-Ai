import React, { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  
  const [paperHistory, setPaperHistory] = useLocalStorage<QuestionPaper[]>('paperHistory', []);
  const [resources, setResources] = useLocalStorage<Resource[]>('resources', []);
  
  const { toast } = useToast();

  const tabs = [
    { id: 'generate', label: 'Generate', icon: '✨' },
    { id: 'answer', label: 'Answer', icon: '✏️' },
    { id: 'evaluate', label: 'Evaluate', icon: '📊' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'history', label: 'History', icon: '📜' }
  ];

  // Get context for chatbot based on current content
  const getChatbotContext = () => {
    if (currentPaper) {
      return `Current Question Paper:\n${currentPaper.questions}${solutions ? `\n\nSolutions:\n${solutions}` : ''}`;
    }
    return undefined;
  };

  const handleGeneratePaper = async (formData: PaperFormData) => {
    setLoading(true);
    try {
      const content = await generateQuestionPaper(formData);
      const paper: QuestionPaper = {
        id: Date.now().toString(),
        ...formData,
        questions: content,
        createdAt: new Date()
      };
      
      setCurrentPaper(paper);
      setPaperHistory(prev => [paper, ...prev]);
      setActiveTab('answer');
      
      toast({
        title: "Question Paper Generated!",
        description: "Your question paper has been generated successfully.",
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
                  <AnswerForm
                    questionPaper={currentPaper.questions}
                    onSubmit={handleSubmitAnswers}
                    loading={loading}
                  />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
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
