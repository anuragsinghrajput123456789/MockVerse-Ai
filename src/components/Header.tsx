
import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm md:text-base">MV</span>
            </div>
            <div className="flex flex-col">
              <h1
                className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer transition-all duration-300 hover:scale-105"
                onClick={scrollToTop}
              >
                MockVerse.(AI)
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Smart Question Paper Generator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md"
              aria-label="Toggle theme"
            >
              <span className="text-xl transition-transform duration-300 hover:scale-110">
                {isDark ? "🌙" : "☀️"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
