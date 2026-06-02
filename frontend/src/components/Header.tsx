import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserMenu from "./UserMenu";
import { 
  Home, 
  Sparkles, 
  PenTool, 
  BarChart2, 
  BookOpen, 
  History, 
  User, 
  Settings, 
  Menu, 
  X, 
  Cpu 
} from "lucide-react";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab = "home", onTabChange }) => {
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "generate", label: "Generate Paper", icon: Sparkles },
    { id: "answer", label: "Solve & Answer", icon: PenTool },
    { id: "evaluate", label: "Evaluate", icon: BarChart2 },
    { id: "resources", label: "Resources", icon: BookOpen },
    { id: "history", label: "History", icon: History },
  ];

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 cursor-pointer shrink-0 group" onClick={() => handleTabClick("home")}>
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all duration-500 group-hover:scale-105 group-hover:rotate-6 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]">
              <Cpu className="w-5 h-5 text-white transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none transition-colors duration-300 group-hover:text-indigo-300">
                MockVerse.<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent leading-none group-hover:from-indigo-300 group-hover:to-pink-300">(AI)</span>
              </h1>
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5 hidden sm:block">
                Intelligent Grading
              </span>
            </div>
          </div>

          {/* Desktop Navigation (Visible on lg (1024px) screens and wider) */}
          <nav className="hidden lg:flex items-center space-x-1 h-full mx-6">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110 text-indigo-400" : "group-hover:scale-110"}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action buttons (Settings, UserMenu) */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Profile & Settings (Desktop Tabs integration) */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={() => handleTabClick("profile")}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  activeTab === "profile" 
                    ? "bg-indigo-500/20 border-indigo-500 text-white" 
                    : "bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
                title="Profile"
              >
                <User className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => handleTabClick("settings")}
                className={`p-2.5 rounded-xl border transition-all duration-300 ${
                  activeTab === "settings" 
                    ? "bg-pink-500/20 border-pink-500 text-white" 
                    : "bg-white/5 border-white/10 hover:border-pink-500/30 hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
                title="Settings"
              >
                <Settings className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* User Dropdown Menu */}
            <UserMenu user={user} onLogout={logout} loading={loading} />

            {/* Mobile Hamburger Button (Visible on screens smaller than lg) */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Slide-In Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop Mask - Prevents interaction with page content while menu is open */}
          <div 
            onClick={toggleMobileMenu}
            className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
          />
          
          {/* Slide-out Side Drawer */}
          <div className="lg:hidden fixed top-0 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#080C16] border-l border-white/10 p-6 pt-20 shadow-2xl flex flex-col justify-between animate-slide-in">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</h3>
                <button 
                  onClick={toggleMobileMenu}
                  className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-white shadow-lg shadow-indigo-500/5"
                          : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 pt-4 border-t border-white/5">User Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTabClick("profile")}
                  className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    activeTab === "profile"
                      ? "bg-indigo-500/20 border-indigo-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => handleTabClick("settings")}
                  className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    activeTab === "settings"
                      ? "bg-pink-500/20 border-pink-500 text-white"
                      : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500">
              MockVerse(AI) Engine &copy; {new Date().getFullYear()}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
