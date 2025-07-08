
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs md:text-sm">MV</span>
            </div>
            <h1
              className="text-lg md:text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent cursor-pointer truncate"
              onClick={scrollToTop}
            >
              MockVerse.(AI)
            </h1>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              <span className="text-lg md:text-xl">{isDark ? "🌙" : "☀️"}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
