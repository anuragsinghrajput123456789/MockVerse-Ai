import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Timer, Play, Pause, RefreshCw } from 'lucide-react';

export const PomodoroTimer = () => {
  const [initialMinutes, setInitialMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            setIsActive(false);
            alert("Time's up!");
            return initialMinutes * 60;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, initialMinutes]);
  
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialMinutes * 60);
  };
  
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = parseInt(e.target.value, 10);
    if (!isNaN(newMinutes) && newMinutes > 0 && newMinutes <= 120) {
      setInitialMinutes(newMinutes);
      setTimeLeft(newMinutes * 60);
      setIsActive(false);
    } else if (e.target.value === '') {
      setInitialMinutes(0);
      setTimeLeft(0);
      setIsActive(false);
    }
  };
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const formatTime = (time: number) => time.toString().padStart(2, '0');

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-[#0E1322] border border-white/5 rounded-xl flex flex-col items-center gap-4 animate-fade-in">
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-200">
        <Timer className="w-6 h-6 text-pink-400"/>
        <h3>Pomodoro Timer</h3>
      </div>
      
      <div className="flex items-center gap-2">
        <label htmlFor="minutes" className="text-sm text-gray-400">Set Minutes:</label>
        <Input
          id="minutes"
          type="number"
          value={initialMinutes || ''}
          onChange={handleMinutesChange}
          className="w-24 text-center text-lg bg-[#0B0F19] text-white border-white/10"
          disabled={isActive}
          min="1"
          max="120"
        />
      </div>
      
      <div className="text-6xl font-bold text-white my-4 tracking-wider font-mono">
        <span>{formatTime(minutes)}</span>:<span>{formatTime(seconds)}</span>
      </div>
      
      <div className="flex gap-4">
        <Button onClick={toggleTimer} className="w-32 bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
          {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={resetTimer} variant="secondary" className="w-32 bg-white/5 hover:bg-white/10 text-white border border-white/10" size="lg">
          <RefreshCw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
