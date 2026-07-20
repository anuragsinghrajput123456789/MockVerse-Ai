import React, { useState } from "react";
import { Github, Twitter, Linkedin, Mail, Send, Cpu, Heart } from "lucide-react";
import { useToast } from "../hooks/use-toast";

interface FooterProps {
  onTabChange?: (tabId: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onTabChange }) => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    toast({
      title: "Subscribed Successfully!",
      description: "Welcome to MockVerse Insider. You will receive AI feature updates soon.",
    });
    setEmail("");
  };

  const handleLinkClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#080C16]/80 backdrop-blur-xl py-16 text-slate-400 overflow-hidden">
      {/* Background neon flares */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-4 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                MockVerse.<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">(AI)</span>
              </h2>
            </div>
            
            <p className="text-sm leading-relaxed text-slate-400">
              MockVerse(AI) is a production-grade smart ecosystem for instant, highly structured exam paper generation, robust solution keys, and comprehensive grading analysis, securely backed by a relational database framework.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-400 hover:text-indigo-400"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-400 hover:text-pink-400"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 flex items-center justify-center transition-all duration-300 hover:scale-110 text-slate-400 hover:text-purple-400"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Features</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleLinkClick("home")} className="hover:text-indigo-400 transition-colors duration-200 text-left">
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("generate")} className="hover:text-indigo-400 transition-colors duration-200 text-left">
                  Generate Paper
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("answer")} className="hover:text-indigo-400 transition-colors duration-200 text-left">
                  Paper & Solutions
                </button>
              </li>
            </ul>
          </div>

          {/* Support / Docs */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => handleLinkClick("resources")} className="hover:text-pink-400 transition-colors duration-200 text-left">
                  Study Library
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("history")} className="hover:text-pink-400 transition-colors duration-200 text-left">
                  Saved Papers
                </button>
              </li>
              <li>
                <a href="#docs" className="hover:text-pink-400 transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#help" className="hover:text-pink-400 transition-colors duration-200">
                  Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter subscription form */}
          <div className="col-span-1 md:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">MockVerse Insider</h3>
            <p className="text-sm text-slate-400">
              Subscribe to stay updated with advanced AI tools, question sets, and evaluation frameworks.
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2 mt-2">
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 text-sm"
              />
              <button
                type="submit"
                disabled={subscribed}
                className="px-4 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white flex items-center justify-center transition-all duration-300 font-medium hover:scale-105 shrink-0"
              >
                {subscribed ? "Subbed" : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs text-slate-500">
          <div className="flex items-center space-x-1">
            <span>&copy; {new Date().getFullYear()} MockVerse(AI). Built for excellence with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 inline fill-pink-500" />
            <span>and Gemini 1.5 Pro.</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-slate-400 transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
