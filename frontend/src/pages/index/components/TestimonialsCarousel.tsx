import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialsCarouselProps {
  testimonialIndex: number;
  handlePrevTestimonial: () => void;
  handleNextTestimonial: () => void;
}

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

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  testimonialIndex,
  handlePrevTestimonial,
  handleNextTestimonial
}) => {
  const activeTestimonial = testimonials[testimonialIndex] || testimonials[0];

  return (
    <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] glow-bg-pink opacity-20 pointer-events-none rounded-full blur-[30px]" />
      
      <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
        <Quote className="w-12 h-12 text-slate-700 mx-auto opacity-40 animate-pulse" />
        
        {/* Active Testimonial Card */}
        <div className="space-y-6 animate-fade-in" key={testimonialIndex}>
          <p className="text-xl text-slate-200 font-medium leading-relaxed italic">
            "{activeTestimonial.feedback}"
          </p>
          
          <div className="flex items-center justify-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center font-bold text-white text-sm">
              {activeTestimonial.avatar}
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm leading-none">{activeTestimonial.name}</h4>
              <span className="text-xs text-slate-500 mt-1 block">{activeTestimonial.role}</span>
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
  );
};

export default TestimonialsCarousel;
export { testimonials };
