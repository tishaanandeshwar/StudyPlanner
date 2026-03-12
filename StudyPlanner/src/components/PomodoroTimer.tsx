import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { sessionService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

export function PomodoroTimer() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleComplete = async () => {
    setIsActive(false);
    if (mode === 'work' && user) {
      await sessionService.addSession({
        userId: user.id,
        duration: 25,
        subject: subject || 'General Study',
        timestamp: new Date().toISOString()
      });
      alert('Focus session complete! Take a break.');
      setMode('break');
      setTimeLeft(5 * 60);
    } else {
      alert('Break over! Ready to work?');
      setMode('work');
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center transition-colors">
      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25 * 60); setIsActive(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'work' ? 'bg-emerald-500 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => { setMode('break'); setTimeLeft(5 * 60); setIsActive(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-emerald-500 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}
        >
          Break
        </button>
      </div>

      <div className="text-8xl font-bold text-zinc-900 dark:text-white mb-8 font-mono tracking-tighter">
        {formatTime(timeLeft)}
      </div>

      <div className="mb-8">
        <input
          type="text"
          placeholder="What are you studying?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all text-center"
        />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={toggleTimer}
          className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
        >
          {isActive ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
        </button>
        <button
          onClick={resetTimer}
          className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
        >
          <RotateCcw size={28} />
        </button>
      </div>
    </div>
  );
}
