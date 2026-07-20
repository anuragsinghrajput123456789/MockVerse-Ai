import React from 'react';
import { Printer } from 'lucide-react';

export const PrintButton: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-pink-500/30 text-pink-400 hover:text-pink-300 rounded-xl transition-all duration-300 text-xs font-bold flex items-center gap-2"
    >
      <Printer className="w-4 h-4" />
      <span>Print Paper</span>
    </button>
  );
};

export default PrintButton;
