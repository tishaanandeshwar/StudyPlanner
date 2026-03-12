import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { sessionService, taskService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';

export function Analytics() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubSessions = sessionService.subscribeSessions(user.id, setSessions);
    const unsubTasks = taskService.subscribeTasks(user.id, setTasks);
    return () => {
      unsubSessions();
      unsubTasks();
    };
  }, [user]);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return {
      date: format(date, 'MMM dd'),
      fullDate: date,
      hours: 0,
      tasks: 0
    };
  }).reverse();

  const chartData = last7Days.map(day => {
    const daySessions = sessions.filter(s => isSameDay(new Date(s.timestamp), day.fullDate));
    const dayTasks = tasks.filter(t => t.completed && isSameDay(new Date(t.createdAt), day.fullDate));
    return {
      ...day,
      hours: daySessions.reduce((acc, s) => acc + s.duration / 60, 0),
      tasks: dayTasks.length
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-colors">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Study Hours (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 transition-colors">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Tasks Completed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: '8px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Bar dataKey="tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
