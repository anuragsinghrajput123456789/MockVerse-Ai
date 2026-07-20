import React, { useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
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
  Cpu,
  LogOut
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
    { id: "answer", label: "Paper & Solutions", icon: PenTool },
    { id: "resources", label: "Study Resources", icon: BookOpen },
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
    <header className="sticky top-0 z-50 w-full bg-[#080C16] border-b border-white/10 shadow-xl shadow-black/50" style={{ transition: 'box-shadow 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
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
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-400 ${
                    isActive
                      ? "text-white bg-white/[0.08]"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                  style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
                >
                  <IconComponent className={`w-4 h-4 transition-transform duration-300 ${isActive ? "scale-110 text-indigo-400" : "group-hover:scale-110 text-slate-400"}`} />
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
            {/* Profile & Account Settings (Desktop Tabs integration) */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={() => handleTabClick("profile")}
                className={`p-2.5 rounded-xl border transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === "profile" 
                    ? "bg-indigo-500/20 border-indigo-500 text-white" 
                    : "bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/10 text-slate-300 hover:text-white"
                }`}
                title={user ? "Profile & Settings" : "Login / Sign Up"}
              >
                <User className="w-4.5 h-4.5" />
                {user ? (
                  <span className="text-xs font-semibold pr-1 max-w-[80px] truncate">
                    {user.name || "Student"}
                  </span>
                ) : (
                  <span className="text-xs font-semibold pr-1">Login / Sign Up</span>
                )}
              </button>
            </div>

            {/* Mobile Hamburger Button (Visible on screens smaller than lg) */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white transition-all duration-300"
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
            className="lg:hidden fixed inset-0 z-[90] bg-black/80 backdrop-blur-md animate-modal-overlay" 
          />
          
          {/* Slide-out Side Drawer - Fully Opaque Solid Background */}
          <div 
            className="lg:hidden fixed top-0 right-0 bottom-0 z-[100] w-80 max-w-[85vw] bg-[#0A0F1D] border-l border-white/15 p-6 pt-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-y-auto animate-slide-in"
            style={{ backgroundColor: '#0A0F1D', opacity: 1 }}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight uppercase">Navigation</h3>
                </div>
                <button 
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-xl bg-white/10 border border-white/15 text-slate-200 hover:text-white hover:bg-white/20 transition-all"
                  aria-label="Close Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                        isActive
                          ? "bg-indigo-600/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-[#13192B] hover:bg-[#1C243B] border-white/10 text-slate-200 hover:text-white"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isActive ? "bg-indigo-500/30 text-indigo-300" : "bg-white/5 text-slate-400"}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-4 border-t border-white/10">User Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTabClick("profile")}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-xl border text-xs font-semibold transition-all ${
                    activeTab === "profile"
                      ? "bg-indigo-600/30 border-indigo-500 text-white"
                      : "bg-[#13192B] border-white/10 text-slate-200 hover:text-white hover:bg-[#1C243B]"
                  }`}
                >
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>{user ? "Profile" : "Login"}</span>
                </button>
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 px-3 py-3 rounded-xl border border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30 hover:text-white transition-all disabled:opacity-50 text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{loading ? "Signing out..." : "Logout"}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleTabClick("profile");
                    }}
                    className="flex items-center justify-center space-x-2 px-3 py-3 rounded-xl border border-indigo-500/30 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 hover:text-white transition-all text-xs font-semibold"
                  >
                    <User className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-400 font-medium">
              MockVerse(AI) Engine &copy; {new Date().getFullYear()}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
