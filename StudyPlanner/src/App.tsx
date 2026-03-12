import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudyPlanner } from './components/StudyPlanner';
import { TaskManager } from './components/TaskManager';
import { Analytics } from './components/Analytics';
import { PomodoroTimer } from './components/PomodoroTimer';
import { LandingPage } from './pages/LandingPage';
import { Loader2, Moon, Sun } from 'lucide-react';

function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="flex items-center justify-between p-6 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div>
          <p className="font-bold text-lg">Appearance</p>
          <p className="text-sm text-zinc-500">Toggle between light and dark mode</p>
        </div>
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
      <Loader2 className="text-emerald-500 animate-spin" size={48} />
    </div>
  );

  if (!user) return <LandingPage />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'planner': return <StudyPlanner />;
      case 'tasks': return <TaskManager />;
      case 'analytics': return <Analytics />;
      case 'timer': return <PomodoroTimer />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white transition-colors duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-12">
        <div className="max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

