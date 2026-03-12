import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  CheckSquare, 
  BarChart2, 
  Settings, 
  LogOut,
  Timer,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { logout, user } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'AI Planner', icon: Sparkles },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'timer', label: 'Focus Timer', icon: Timer },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold">
          F
        </div>
        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">FocusFlow</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
              activeTab === item.id 
                ? "bg-emerald-500/10 text-emerald-500 font-medium" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-xs">
              {user?.displayName?.[0]}
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{user?.displayName}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

