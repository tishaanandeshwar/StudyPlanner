import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService, sessionService, planService } from '../services/firestore';
import { getMotivationalQuote } from '../services/gemini';
import { StudyTask, FocusSession, StudyPlan } from '../types';
import { format } from 'date-fns';

export function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [quote, setQuote] = useState('Loading daily motivation...');

  useEffect(() => {
    if (!user) return;
    const unsubTasks = taskService.subscribeTasks(user.id, setTasks);
    const unsubSessions = sessionService.subscribeSessions(user.id, setSessions);
    const unsubPlans = planService.subscribePlans(user.id, setPlans);
    
    getMotivationalQuote().then(q => setQuote(q || 'Keep pushing forward!'));

    return () => {
      unsubTasks();
      unsubSessions();
      unsubPlans();
    };
  }, [user]);

  const totalFocusMinutes = sessions.reduce((acc, s) => acc + s.duration, 0);
  const completedTasks = tasks.filter(t => t.completed).length;
  const latestPlan = plans[0];

  const stats = [
    { label: 'Focus Time', value: `${Math.round(totalFocusMinutes / 60)}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Tasks Done', value: completedTasks, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Day Streak', value: '5', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Study Score', value: '84', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Welcome back, {user?.displayName?.split(' ')[0]}!</h1>
          <p className="text-zinc-500 mt-1">Ready for another productive study session?</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3 rounded-2xl flex items-center gap-3 max-w-md italic text-sm text-zinc-500 dark:text-zinc-400">
          <Sparkles size={18} className="text-emerald-500 shrink-0" />
          "{quote}"
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-zinc-900 dark:text-white">Current Study Plan</h3>
              <button className="text-emerald-500 text-sm font-medium flex items-center gap-1 hover:underline">
                View Full <ChevronRight size={16} />
              </button>
            </div>
            <div className="p-6">
              {latestPlan ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">Next Session: {latestPlan.planData[0]?.sessions[0]?.subject}</p>
                      <p className="text-xs text-zinc-500">{latestPlan.planData[0]?.sessions[0]?.time} • {latestPlan.planData[0]?.sessions[0]?.topic}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-500">
                  <p>No active study plan. Head to the AI Planner to create one!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {sessions.slice(0, 3).map((session, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">{session.subject}</p>
                      <p className="text-xs text-zinc-500">{format(new Date(session.timestamp), 'MMM dd, HH:mm')}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">+{session.duration}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-emerald-500 rounded-2xl p-6 text-black">
            <h3 className="font-bold text-lg mb-2">Focus Mode</h3>
            <p className="text-sm opacity-80 mb-6 font-medium">Ready to crush your goals? Start a 25-minute Pomodoro session now.</p>
            <button className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-zinc-900 transition-all flex items-center justify-center gap-2">
              Start Timer <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-4">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {tasks.filter(t => !t.completed).slice(0, 3).map((task, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    task.priority === 'high' ? 'bg-red-500' : 'bg-blue-500'
                  )} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{task.title}</p>
                    <p className="text-xs text-zinc-500">{task.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
