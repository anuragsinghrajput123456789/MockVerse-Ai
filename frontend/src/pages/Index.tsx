import React from 'react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import PaperForm from '../features/papers/PaperForm';
import LoadingSpinner from '../shared/components/LoadingSpinner';
import Chatbot from '../features/chat/Chatbot';
import AnswerTab from '../features/papers/AnswerTab';
import EvaluateTab from '../features/papers/EvaluateTab';
import ResourcesTab from '../features/resources/ResourcesTab';

import { useIndexState } from './index/useIndexState';
import HomeTab from './index/HomeTab';
import HistoryTab from '../features/history/HistoryTab';
import ProfileTab from '../features/profile/ProfileTab';
import QuotaModal from './index/components/QuotaModal';

// Memoize subcomponents to prevent unnecessary re-renders from state changes in the parent component
const MemoizedHeader = React.memo(Header);
const MemoizedFooter = React.memo(Footer);
const MemoizedPaperForm = React.memo(PaperForm);
const MemoizedAnswerTab = React.memo(AnswerTab);
const MemoizedEvaluateTab = React.memo(EvaluateTab);
const MemoizedResourcesTab = React.memo(ResourcesTab);

export const Index = () => {
  const {
    activeTab,
    setActiveTab,
    currentPaper,
    solutions,
    evaluationResult,
    loading,
    paperHistory,
    faqOpen,
    testimonialIndex,
    setTestimonialIndex,
    apiKeyInput,
    setApiKeyInput,
    apiKeyMasked,
    hasStoredApiKey,
    apiKeyLoading,
    showApiKeyInput,
    setShowApiKeyInput,
    showQuotaModal,
    setShowQuotaModal,
    quotaModalMessage,
    quotaModalKeyInput,
    setQuotaModalKeyInput,
    user,
    logout,
    handleQuotaModalSave,
    handleGeneratePaper,
    handleGenerateSolutions,
    handleSubmitAnswers,
    handleSaveApiKey,
    handleDeleteApiKey,
    handleSelectPaper,
    handleDeletePaper,
    toggleFaq,
    handleSaveSettings
  } = useIndexState();

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab
            setActiveTab={setActiveTab}
            testimonialIndex={testimonialIndex}
            setTestimonialIndex={setTestimonialIndex}
            faqOpen={faqOpen}
            toggleFaq={toggleFaq}
          />
        );

      case 'generate':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-6 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <span className="text-2xl text-indigo-400 font-bold">★</span>
              <h2 className="text-2xl font-bold text-white">Create Custom Exam Sheet</h2>
            </div>
            <MemoizedPaperForm onSubmit={handleGeneratePaper} loading={loading} />
          </div>
        );
      
      case 'answer':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <span className="text-2xl text-pink-400 font-bold">✎</span>
              <h2 className="text-2xl font-bold text-white">Paper & Solutions</h2>
            </div>
            <MemoizedAnswerTab
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
              <span className="text-2xl text-purple-400 font-bold">📊</span>
              <h2 className="text-2xl font-bold text-white">Smart Answer Evaluation</h2>
            </div>
            <MemoizedEvaluateTab
              evaluationResult={evaluationResult}
              onNavigateToAnswer={() => setActiveTab('answer')}
            />
          </div>
        );
      
      case 'resources':
        return (
          <div className="glass-panel rounded-3xl p-6 md:p-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-4">
              <span className="text-2xl text-blue-400 font-bold">📖</span>
              <h2 className="text-2xl font-bold text-white">Study Library & Resources</h2>
            </div>
            <MemoizedResourcesTab />
          </div>
        );
      
      case 'history':
        return (
          <HistoryTab
            paperHistory={paperHistory}
            handleSelectPaper={handleSelectPaper}
            handleDeletePaper={handleDeletePaper}
          />
        );

      case 'profile':
        return (
          <ProfileTab
            user={user}
            logout={logout}
            paperHistory={paperHistory}
            hasStoredApiKey={hasStoredApiKey}
            apiKeyMasked={apiKeyMasked}
            apiKeyInput={apiKeyInput}
            setApiKeyInput={setApiKeyInput}
            apiKeyLoading={apiKeyLoading}
            showApiKeyInput={showApiKeyInput}
            setShowApiKeyInput={setShowApiKeyInput}
            handleSaveApiKey={handleSaveApiKey}
            handleDeleteApiKey={handleDeleteApiKey}
            handleSaveSettings={handleSaveSettings}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0B0F19] transition-colors relative flex flex-col justify-between">
        {/* Absolute ambient vector mesh */}
        <div className="animate-mesh-1 absolute top-[10%] left-[-15%] w-[600px] h-[600px] glow-bg-indigo opacity-20 pointer-events-none rounded-full blur-[40px]" />
        <div className="animate-mesh-2 absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] glow-bg-pink opacity-15 pointer-events-none rounded-full blur-[40px]" />
        
        <div>
          <MemoizedHeader activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="container mx-auto px-4 py-8 lg:px-8 relative z-10 flex-grow">
            <div className="max-w-6xl mx-auto">
              {loading && (
                <div className="fixed inset-0 z-50 bg-[#0B0F19]/70 backdrop-blur-md flex items-center justify-center animate-modal-overlay">
                  <div className="glass-card p-8 rounded-2xl border border-white/10 flex flex-col items-center space-y-5 animate-modal-panel shadow-2xl shadow-indigo-500/10">
                    <LoadingSpinner />
                    <span className="text-sm font-semibold text-slate-300 animate-pulse">Synchronizing AI Engine...</span>
                  </div>
                </div>
              )}
              
              <div key={activeTab} className="animate-fade-in" style={{ animationDuration: '0.4s' }}>
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
        
        <Chatbot paperId={currentPaper?.id} />
        
        <MemoizedFooter onTabChange={setActiveTab} />
      </div>

      <QuotaModal
        showQuotaModal={showQuotaModal}
        setShowQuotaModal={setShowQuotaModal}
        quotaModalMessage={quotaModalMessage}
        quotaModalKeyInput={quotaModalKeyInput}
        setQuotaModalKeyInput={setQuotaModalKeyInput}
        handleQuotaModalSave={handleQuotaModalSave}
        apiKeyLoading={apiKeyLoading}
        setActiveTab={setActiveTab}
      />
    </>
  );
};

export default Index;
