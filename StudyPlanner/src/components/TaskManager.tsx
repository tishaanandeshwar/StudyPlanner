import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { taskService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { StudyTask } from '../types';
import { cn } from '../lib/utils';

export function TaskManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (!user) return;
    return taskService.subscribeTasks(user.id, setTasks);
  }, [user]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title) return;
    await taskService.addTask({
      userId: user.id,
      title,
      subject,
      priority,
      deadline,
      completed: false
    });
    setTitle('');
    setSubject('');
    setDeadline('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Add New Task</h2>
        <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Subject..."
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="bg-emerald-500 text-black font-bold py-2 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Task
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id}
            className={cn(
              "flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 border rounded-2xl transition-all",
              task.completed ? "border-zinc-200 dark:border-zinc-800 opacity-60" : "border-zinc-200 dark:border-zinc-800"
            )}
          >
            <button 
              onClick={() => taskService.toggleTask(task.id, !task.completed)}
              className={cn(
                "transition-colors",
                task.completed ? "text-emerald-500" : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-400"
              )}
            >
              {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
            <div className="flex-1">
              <h4 className={cn("font-bold text-zinc-900 dark:text-white", task.completed && "line-through")}>
                {task.title}
              </h4>
              <div className="flex gap-3 mt-1">
                <span className="text-xs text-zinc-500">{task.subject}</span>
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded",
                  task.priority === 'high' ? "bg-red-500/10 text-red-500" :
                  task.priority === 'medium' ? "bg-yellow-500/10 text-yellow-500" :
                  "bg-blue-500/10 text-blue-500"
                )}>
                  {task.priority}
                </span>
              </div>
            </div>
            <button 
              onClick={() => taskService.deleteTask(task.id)}
              className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
            <p>No tasks yet. Start by adding one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}
