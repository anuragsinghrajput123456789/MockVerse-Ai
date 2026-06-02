import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
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
import { 
  Sparkles, 
  PenTool, 
  BarChart2, 
  BookOpen, 
  History, 
  ArrowRight, 
  Award, 
  Brain, 
  TrendingUp, 
  User as UserIcon, 
  CheckCircle2, 
  Settings as SettingsIcon,
  HelpCircle,
  ChevronDown,
  Quote,
  Zap,
  Clock,
  Target,
  FileText,
  ShieldAlert
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentPaper, setCurrentPaper] = useState<QuestionPaper | null>(null);
  const [solutions, setSolutions] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [paperHistory, setPaperHistory] = useState<QuestionPaper[]>([]);
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  
  const { user, logout } = useAuth();
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

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const testimonials = [
    {
      name: "Aditya Sharma",
      role: "Class 12 Student (CBSE)",
      avatar: "AS",
      feedback: "MockVerse completely changed how I prepare for my boards. The AI generates questions that align perfectly with the CBSE curriculum, and the evaluation details show exactly where I lost marks."
    },
    {
      name: "Sneha Patel",
      role: "EdTech Curriculum Designer",
      avatar: "SP",
      feedback: "The speed and high accuracy of the question paper generation is remarkable. It supports custom mark patterns, chapter filters, and the detailed answer key is an absolute lifesaver for educators."
    },
    {
      name: "Rohan Das",
      role: "JEE Aspirant",
      avatar: "RD",
      feedback: "Using the AI chatbot while solving papers feels like having a personal tutor next to me. I can ask questions about the generated solutions and get instant, helpful explanations."
    }
  ];

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-20 animate-fade-in">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden glass-panel p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
              {/* Decorative glows */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] glow-bg-indigo opacity-30 pointer-events-none rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] glow-bg-pink opacity-20 pointer-events-none rounded-full blur-[100px]" />

              <div className="space-y-6 md:w-3/5 relative z-10">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider animate-pulse-glow">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Powered by Gemini 1.5 Pro</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                  Master Your Exams With <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">MockVerse.(AI)</span>
                </h1>
                
                <p className="text-lg text-slate-300 leading-relaxed max-w-xl">
                  The ultimate smart study companion. Instantly generate balanced custom question papers, fetch itemized worked solutions, and evaluate your answers with deep AI feedback.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    onClick={() => setActiveTab('generate')}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                  >
                    <span>Create Custom Exam</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('resources')}
                    className="px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    Explore Library
                  </button>
                </div>

                <div className="flex items-center space-x-6 pt-6 border-t border-white/5 text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Relational DB Security</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    <span>Bloom's Taxonomy Compliant</span>
                  </div>
                </div>
              </div>

              {/* Showcase Hero Image Container */}
              <div className="md:w-2/5 flex justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-2xl blur-3xl pointer-events-none" />
                <img 
                  src="/images/mockverse_workspace_hero.png" 
                  alt="MockVerse Futuristic Screen" 
                  className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl animate-float relative z-10"
                />
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">
                Launch Core Tools
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Generate Paper",
                    desc: "Configure subject, marks, and parameters to instantly build balanced exam papers.",
                    tab: "generate",
                    icon: Sparkles,
                    color: "border-indigo-500/20 text-indigo-400 hover:shadow-indigo-500/10",
                  },
                  {
                    title: "Solve & Answer",
                    desc: "Simulate test conditions, solve questions under a Pomodoro clock, and get prompt keys.",
                    tab: "answer",
                    icon: PenTool,
                    color: "border-pink-500/20 text-pink-400 hover:shadow-pink-500/10",
                  },
                  {
                    title: "Smart Evaluate",
                    desc: "Submit your written answers to get instant line-by-line AI grading and constructive reviews.",
                    tab: "evaluate",
                    icon: BarChart2,
                    color: "border-purple-500/20 text-purple-400 hover:shadow-purple-500/10",
                  },
                  {
                    title: "Resource Library",
                    desc: "Save papers, write books list, keep structured reference materials close to you.",
                    tab: "resources",
                    icon: BookOpen,
                    color: "border-blue-500/20 text-blue-400 hover:shadow-blue-500/10",
                  }
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <div 
                      key={idx}
                      onClick={() => setActiveTab(action.tab)}
                      className={`glass-card glass-card-hover p-6 rounded-2xl border cursor-pointer ${action.color}`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">{action.desc}</p>
                      <span className="text-xs font-semibold inline-flex items-center space-x-1 hover:underline">
                        <span>Launch Tool</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advanced Analytics Section */}
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[300px] h-[300px] glow-bg-indigo opacity-20 pointer-events-none rounded-full blur-[80px]" />
              
              <div className="relative z-10 flex flex-col lg:flex-row gap-10 items-center justify-between">
                <div className="lg:w-1/3 space-y-4">
                  <h2 className="text-3xl font-extrabold text-white">Your Analytics & Progress</h2>
                  <p className="text-sm leading-relaxed text-slate-400">
                    Track your prep level across chapters. Our system correlates your answer reviews and visualizes overall subject completeness metrics.
                  </p>
                  
                  {/* Circular Progress Metre */}
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="transparent" />
                        <circle cx="32" cy="32" r="28" className="stroke-indigo-500" strokeWidth="4" fill="transparent"
                          strokeDasharray={175} strokeDashoffset={175 - (175 * 84) / 100} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-sm font-bold text-white">84%</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Weekly Prep Completion</h4>
                      <p className="text-xs text-slate-500">Goal: 5 Exam Sets • Active</p>
                    </div>
                  </div>
                </div>

                <div className="lg:w-2/3 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "AI Evaluated Sheets", value: "984", trend: "+18%", color: "text-indigo-400" },
                    { label: "Generated Papers", value: "1,250", trend: "+24%", color: "text-pink-400" },
                    { label: "Saved Notes/Library", value: "42", trend: "+8%", color: "text-purple-400" }
                  ].map((stat, idx) => (
                    <div key={idx} className="glass-card p-6 rounded-2xl border border-white/5 relative flex flex-col justify-between min-h-[140px]">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                        <h3 className={`text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value}</h3>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-4 text-xs">
                        <span className="text-emerald-400 font-bold">{stat.trend} this week</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Showcase List */}
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-3xl font-extrabold text-white">Platform Core Ecosystem Capabilities</h2>
                <p className="text-sm text-slate-400">
                  Comprehensive smart classroom integrations built for student curriculum mastery.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "AI Question Generation",
                    desc: "Constructs multi-part questions matching CBSE, ICSE, or generic boards using cognitive depth parameters.",
                    icon: Brain
                  },
                  {
                    title: "Smart Evaluation System",
                    desc: "Checks semantic alignment, lists correct keywords, and marks exactly where structural improvements are needed.",
                    icon: Award
                  },
                  {
                    title: "Live Chatbot Tutor",
                    desc: "Interactive assistant loaded dynamically with your active question sheet context to explain answers line-by-line.",
                    icon: CheckCircle2
                  }
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div key={idx} className="glass-card p-8 rounded-2xl border border-white/5 space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{feat.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Testimonials Carousel Section */}
            <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] glow-bg-pink opacity-20 pointer-events-none rounded-full blur-[80px]" />
              
              <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
                <Quote className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />
                
                {/* Active Testimonial Card */}
                <div className="space-y-6 animate-fade-in" key={testimonialIndex}>
                  <p className="text-xl text-slate-200 font-medium leading-relaxed italic">
                    "{testimonials[testimonialIndex].feedback}"
                  </p>
                  
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
                      {testimonials[testimonialIndex].avatar}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-white text-sm leading-none">{testimonials[testimonialIndex].name}</h4>
                      <span className="text-xs text-slate-500 mt-1 block">{testimonials[testimonialIndex].role}</span>
                    </div>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="flex items-center justify-center space-x-3 pt-4">
                  <button 
                    onClick={handlePrevTestimonial}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                  >
                    &larr;
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    {testimonialIndex + 1} / {testimonials.length}
                  </span>
                  <button 
                    onClick={handleNextTestimonial}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                  >
                    &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive FAQ Accordion */}
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "How does the AI grading engine evaluate my answers?",
                    a: "By utilizing advanced semantic analysis coupled with customized criteria metrics, MockVerse reads your written lines, checks against standard solutions, maps keywords, and returns an itemized scorecard."
                  },
                  {
                    q: "Can I generate papers targeting specific boards and subjects?",
                    a: "Absolutely! The generator panel allows you to lock in curriculum board constraints (CBSE, ICSE, etc.), classes, difficulty profiles, and selective lists of chapters."
                  },
                  {
                    q: "Is there data persistence for my history?",
                    a: "Yes. All generated exam structures, solutions, and evaluated scorecards are securely persistent inside our backend MySQL server for study retrospectives."
                  }
                ].map((faq, idx) => (
                  <div key={idx} className="glass-card rounded-xl border border-white/5 overflow-hidden transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full flex items-center justify-between p-6 text-left text-white font-semibold focus:outline-none"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${faqOpen[idx] ? "rotate-180 text-pink-400" : ""}`} />
                    </button>
                    {faqOpen[idx] && (
                      <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'generate':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Create Custom Exam Sheet</h2>
            </div>
            <PaperForm onSubmit={handleGeneratePaper} loading={loading} />
          </div>
        );
      
      case 'answer':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <PenTool className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Solve & Answering Tab</h2>
            </div>
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
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <BarChart2 className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Smart Answer Evaluation</h2>
            </div>
            <EvaluateTab
              evaluationResult={evaluationResult}
              onNavigateToAnswer={() => setActiveTab('answer')}
            />
          </div>
        );
      
      case 'resources':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Study Library & Resources</h2>
            </div>
            <ResourcesTab />
          </div>
        );
      
      case 'history':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <History className="w-6 h-6 text-orange-400" />
              <h2 className="text-2xl font-bold text-white">Relational Paper History</h2>
            </div>
            {paperHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-400">No question papers generated yet. Generate one first!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paperHistory.map((paper) => (
                  <div
                    key={paper.id}
                    className="glass-card p-5 rounded-xl border border-white/5 cursor-pointer hover:bg-slate-800/40 hover:border-indigo-500/20 transition-all hover:scale-[1.01] flex items-center justify-between"
                    onClick={() => handleSelectPaper(paper)}
                  >
                    <div>
                      <h3 className="font-bold text-white text-base">{paper.subject} - Class {paper.class}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        {paper.chapters.join(', ')} • {paper.totalMarks} marks • {paper.difficulty}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        Generated: {new Date(paper.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'profile':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <UserIcon className="w-6 h-6 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Student Profile Settings</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl">
                {user?.name ? user.name.substring(0,2).toUpperCase() : "ST"}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-bold text-white">{user?.name || "Student User"}</h3>
                <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase">MockVerse Gold Member</span>
                  <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase">AI Explorer</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-3 text-sm">Account Achievements</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>Generated first 5 papers</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>Perfect score evaluated once</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> <span>Active for 7 straight days</span></li>
                </ul>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <h4 className="font-bold text-white mb-3 text-sm">Session Meta</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Persistent relational authentication secured by backend JWT configurations. Logout securely when using collective study monitors.
                </p>
                <button
                  onClick={logout}
                  className="mt-4 px-4 py-2 border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs font-bold rounded-lg transition-all"
                >
                  Sign Out Securely
                </button>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <SettingsIcon className="w-6 h-6 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">MockVerse Engine Configuration</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm">AI Engine Configurations</h4>
                <p className="text-xs text-slate-400">Tweak generative parameters. Warning: higher limits require enhanced billing credentials.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Temperature Profile</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white text-xs">
                      <option>Balanced Precision (0.7 - Default)</option>
                      <option>Strict Verification (0.3 - Focused)</option>
                      <option>Creative Exploration (0.9 - Diverse)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase tracking-wider block mb-1">AI Model Anchor</label>
                    <select className="w-full h-10 px-3 rounded-lg bg-[#0B0F19] border border-white/10 text-white text-xs">
                      <option>Gemini 1.5 Pro (Recommended)</option>
                      <option>Gemini 1.5 Flash (Performance)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="font-bold text-white text-sm">Notifications & Prompts</h4>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <h5 className="font-bold text-white">Push Email Reports</h5>
                    <p className="text-slate-500">Send graded sheets automatically to parents/educators.</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 bg-black border-slate-700" defaultChecked />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0B0F19] transition-colors relative flex flex-col justify-between">
        {/* Absolute ambient vector mesh */}
        <div className="animate-mesh-1 absolute top-[10%] left-[-15%] w-[600px] h-[600px] glow-bg-indigo opacity-20 pointer-events-none rounded-full blur-[130px]" />
        <div className="animate-mesh-2 absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] glow-bg-pink opacity-15 pointer-events-none rounded-full blur-[130px]" />
        
        <div>
          <Header activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="container mx-auto px-4 py-8 lg:px-8 relative z-10 flex-grow">
            <div className="max-w-6xl mx-auto">
              {loading && (
                <div className="fixed inset-0 z-50 bg-[#0B0F19]/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col items-center space-y-4">
                    <LoadingSpinner />
                    <span className="text-sm font-semibold text-slate-300">Synchronizing AI Engine...</span>
                  </div>
                </div>
              )}
              
              <div className="transition-all duration-500">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
        
        <Chatbot paperId={currentPaper?.id} />
        
        <Footer onTabChange={setActiveTab} />
      </div>
    </>
  );
};

export default Index;
