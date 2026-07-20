import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqAccordionProps {
  faqOpen: Record<number, boolean>;
  toggleFaq: (index: number) => void;
}

const faqs = [
  {
    q: "How are the step-by-step worked solutions generated?",
    a: "By utilizing advanced cognitive models and subject context, MockVerse generates comprehensive solution keys, complete with logic and step-by-step answers for all questions."
  },
  {
    q: "Can I generate papers targeting specific boards and subjects?",
    a: "Absolutely! The generator panel allows you to lock in curriculum board constraints (CBSE, ICSE, etc.), classes, difficulty profiles, and selective lists of chapters."
  },
  {
    q: "Is there data persistence for my history?",
    a: "Yes. All generated exam structures and detailed solutions are securely persistent inside our backend MongoDB database for study retrospectives."
  }
];

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqOpen, toggleFaq }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl md:text-3xl font-extrabold text-white text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
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
  );
};

export default FaqAccordion;
