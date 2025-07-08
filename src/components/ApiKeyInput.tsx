
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-lg md:text-xl">Gemini API Key</CardTitle>
        <CardDescription className="text-sm md:text-base leading-relaxed">
          Enter your Gemini API key to generate question papers.{' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Get your API key here
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              placeholder="Enter your Gemini API key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="pr-12 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
          <Button type="submit" className="w-full" disabled={!key.trim()}>
            Save API Key
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
