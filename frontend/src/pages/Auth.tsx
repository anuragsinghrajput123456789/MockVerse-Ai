import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface AuthProps {
  isInline?: boolean;
}

const Auth: React.FC<AuthProps> = ({ isInline = false }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    let success = false;

    if (isLogin) {
      success = await login(email, password);
    } else {
      if (!name) {
        setLoading(false);
        return;
      }
      success = await signup(name, email, password);
    }

    setLoading(false);
  };

  return (
    <div className={isInline ? "w-full relative font-sans" : "min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans"}>
      {/* Background Neon Glows */}
      {!isInline && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[130px] pointer-events-none" />
        </>
      )}

      {/* Main Split Grid Card */}
      <div className={isInline ? "w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 min-h-[500px]" : "w-full max-w-5xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 min-h-[600px]"}>
        
        {/* Left Side: Form Section */}
        <div className="p-8 md:p-12 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10">
          <div className="w-full max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-base">MV</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                MockVerse.<span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">(AI)</span>
              </h2>
            </div>

            <div className="mb-6">
              <h3 className="text-3xl font-extrabold text-white tracking-tight">
                {isLogin ? 'Welcome Back!' : 'Get Started'}
              </h3>
              <p className="text-slate-400 text-sm mt-2">
                {isLogin 
                  ? 'Sign in to generate and solve smart exam papers' 
                  : 'Create a free account to access AI study assistants'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 h-11"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-xs font-semibold uppercase tracking-wider">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 h-11"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-semibold h-11 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] mt-2"
              >
                {loading 
                  ? (isLogin ? 'Signing In...' : 'Registering...') 
                  : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center border-t border-white/10 pt-4">
              <p className="text-sm text-slate-400">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors duration-200"
                >
                  {isLogin ? 'Register now' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Futuristic Showcase Panel */}
        <div className="hidden md:flex p-12 flex-col justify-between bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 relative overflow-hidden">
          {/* Subtle vector mesh layer */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <div className="relative z-10 max-w-sm mx-auto text-center flex flex-col items-center justify-center h-full">
            <img 
              src="/images/mockverse_workspace_hero.png" 
              alt="Futuristic AI Workspace" 
              className="w-72 h-72 object-contain mb-8 rounded-2xl shadow-2xl border border-white/5 animate-pulse"
              style={{ animationDuration: '4s' }}
            />
            <h4 className="text-xl font-bold text-white mb-2 tracking-wide">
              Smart Study Ecosystem
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Design tailored exams, generate fully worked solutions, and evaluate results instantly. Supported securely with MongoDB database persistence.
            </p>
            
            <div className="flex items-center space-x-2 mt-6">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                Powered by Gemini AI
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;

