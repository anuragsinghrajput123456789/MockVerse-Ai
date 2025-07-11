
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react';

interface ApiKeyInputProps {
  onSave: (key: string) => void;
  currentKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSave, currentKey }) => {
  const [key, setKey] = useState(currentKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <KeyIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Gemini API Key
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Enter your Gemini API key to unlock AI-powered question paper generation.{' '}
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium underline decoration-2 underline-offset-2 transition-colors"
            >
              Get your API key here →
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Enter your Gemini API key (AIza...)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="pr-12 h-12 text-base border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-300"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
              disabled={!key.trim()}
            >
              🚀 Start Generating Papers
            </Button>
          </form>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored securely in your browser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiKeyInput;
