import React from 'react';
import HeroSection from './components/HeroSection';
import QuickActionsGrid from './components/QuickActionsGrid';
import AnalyticsPanel from './components/AnalyticsPanel';
import FeaturesGrid from './components/FeaturesGrid';
import TestimonialsCarousel, { testimonials } from './components/TestimonialsCarousel';
import FaqAccordion from './components/FaqAccordion';

interface HomeTabProps {
  setActiveTab: (tab: string) => void;
  testimonialIndex: number;
  setTestimonialIndex: React.Dispatch<React.SetStateAction<number>>;
  faqOpen: Record<number, boolean>;
  toggleFaq: (index: number) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  setActiveTab,
  testimonialIndex,
  setTestimonialIndex,
  faqOpen,
  toggleFaq
}) => {
  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="space-y-20 animate-fade-in stagger-children">
      <HeroSection setActiveTab={setActiveTab} />
      <QuickActionsGrid setActiveTab={setActiveTab} />
      <AnalyticsPanel />
      <FeaturesGrid />
      <TestimonialsCarousel
        testimonialIndex={testimonialIndex}
        handlePrevTestimonial={handlePrevTestimonial}
        handleNextTestimonial={handleNextTestimonial}
      />
      <FaqAccordion faqOpen={faqOpen} toggleFaq={toggleFaq} />
    </div>
  );
};

export default HomeTab;
