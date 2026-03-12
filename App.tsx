import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Timer, 
  BarChart3, 
  CheckCircle2, 
  Plus, 
  BrainCircuit,
  Clock,
  Trash2,
  LogOut,
  LogIn,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  Timestamp,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { generateStudySchedule } from './services/geminiService';
import { Task, StudySession, ScheduleItem } from './types';

// Error Handling Spec for Firestore Permissions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsed = JSON.parse(this.state.error?.message || "{}");
        if (parsed.error) errorMessage = parsed.error;
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Error</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AuthPage({ type, onToggle }: { type: 'login' | 'signup', onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-black/5 w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
            <BrainCircuit className="w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-light text-center mb-2">
          {type === 'login' ? 'Welcome Back' : 'Join EduCoach'}
        </h2>
        <p className="text-gray-500 text-center mb-8">
          {type === 'login' ? 'Sign in to continue your study journey' : 'Start your personalized AI study journey'}
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Email Address</label>
            <input 
              type="email"
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Password</label>
            <input 
              type="password"
              required
              className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : (type === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            {loading ? '' : (type === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onToggle}
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            {type === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function MainApp({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<StudySession[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', deadline: '', priority: 'medium', category: 'Study' });
  const [timer, setTimer] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [aiSchedule, setAiSchedule] = useState<ScheduleItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Validate Connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
  }, []);

  // Real-time Tasks
  useEffect(() => {
    const q = query(
      collection(db, 'tasks'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setTasks(taskData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });
    return () => unsubscribe();
  }, [user.uid]);

  // Real-time Sessions
  useEffect(() => {
    const q = query(
      collection(db, 'sessions'), 
      where('userId', '==', user.uid),
      orderBy('completedAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData = snapshot.docs.map(doc => doc.data() as any);
      
      // Group by date for analytics
      const grouped: { [key: string]: { total_minutes: number, focus_score_sum: number, count: number } } = {};
      sessionData.forEach(s => {
        const date = s.completedAt.split('T')[0];
        if (!grouped[date]) grouped[date] = { total_minutes: 0, focus_score_sum: 0, count: 0 };
        grouped[date].total_minutes += s.durationMinutes;
        grouped[date].focus_score_sum += s.focusScore;
        grouped[date].count += 1;
      });

      const formatted = Object.keys(grouped).map(date => ({
        date,
        total_minutes: grouped[date].total_minutes,
        avg_focus: Math.round(grouped[date].focus_score_sum / grouped[date].count)
      })).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

      setAnalytics(formatted);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });
    return () => unsubscribe();
  }, [user.uid]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setNewTask({ title: '', deadline: '', priority: 'medium', category: 'Study' });
      setIsAddingTask(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: string) => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        status: currentStatus === 'pending' ? 'completed' : 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const schedule = await generateStudySchedule(tasks.filter(t => t.status === 'pending'), 4);
      setAiSchedule(schedule);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      addDoc(collection(db, 'sessions'), {
        userId: user.uid,
        taskId: null,
        durationMinutes: 25,
        focusScore: 85,
        completedAt: new Date().toISOString()
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, 'sessions'));
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer, user.uid]);

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tasks Pending</h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-light">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Study Time (Today)</h3>
            <Clock className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-light">
            {analytics.find(a => a.date === format(new Date(), 'yyyy-MM-dd'))?.total_minutes || 0}m
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Focus Score</h3>
            <BrainCircuit className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-light">
            {analytics.length > 0 ? Math.round(analytics.reduce((acc, curr) => acc + curr.avg_focus, 0) / analytics.length) : 0}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-lg font-medium mb-6">Productivity Trend (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="total_minutes" stroke="#10b981" fillOpacity={1} fill="url(#colorMin)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanner = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium">Study Tasks</h3>
            <button 
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl group">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <div>
                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-400' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {task.deadline}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-600' : 
                        task.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            AI Schedule Generator
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Let AI create an optimized study plan based on your pending tasks.
          </p>
          <button 
            onClick={handleGenerateSchedule}
            disabled={isGenerating || tasks.filter(t => t.status === 'pending').length === 0}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Today\'s Plan'}
          </button>

          {aiSchedule.length > 0 && (
            <div className="mt-6 space-y-4">
              {aiSchedule.map((item, idx) => (
                <div key={idx} className="border-l-2 border-indigo-200 pl-4 py-1">
                  <p className="text-xs text-indigo-500 font-bold">{item.time} ({item.duration})</p>
                  <p className="text-sm font-medium">{item.activity}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isAddingTask && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h2 className="text-2xl font-light mb-6">New Study Task</h2>
              <form onSubmit={addTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Title</label>
                  <input 
                    required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
                    value={newTask.title}
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                    placeholder="e.g., Advanced Calculus Review"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Deadline</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
                      value={newTask.deadline}
                      onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Priority</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-black"
                      value={newTask.priority}
                      onChange={e => setNewTask({...newTask, priority: e.target.value as any})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 py-3 text-gray-500 font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-black text-white rounded-xl font-medium"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderTimer = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-black/5 text-center w-full max-w-md">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-8">Focus Timer</h3>
        <div className="text-8xl font-light tracking-tighter mb-12 font-mono">
          {formatTime(timer)}
        </div>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isTimerRunning ? 'bg-red-50 text-red-500' : 'bg-black text-white shadow-lg shadow-black/20'
            }`}
          >
            {isTimerRunning ? (
              <div className="w-6 h-6 bg-current rounded-sm" />
            ) : (
              <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[20px] border-l-current ml-1" />
            )}
          </button>
          <button 
            onClick={() => {
              setIsTimerRunning(false);
              setTimer(25 * 60);
            }}
            className="w-20 h-20 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Clock className="w-8 h-8" />
          </button>
        </div>
        <div className="mt-12 flex justify-center gap-8">
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Mode</p>
            <p className="text-sm font-medium">Pomodoro</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Goal</p>
            <p className="text-sm font-medium">4 Sessions</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans">
      <nav className="fixed left-0 top-0 h-full w-20 bg-white border-r border-black/5 flex flex-col items-center py-8 gap-8 z-40">
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white mb-4">
          <BrainCircuit className="w-6 h-6" />
        </div>
        {[
          { id: 'dashboard', icon: LayoutDashboard },
          { id: 'planner', icon: Calendar },
          { id: 'timer', icon: Timer },
          { id: 'analytics', icon: BarChart3 },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-3 rounded-xl transition-all ${
              activeTab === item.id ? 'bg-gray-100 text-black' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
        ))}
        <div className="mt-auto mb-8">
          <button 
            onClick={() => signOut(auth)}
            className="p-3 rounded-xl text-gray-400 hover:text-red-500 transition-all"
            title="Sign Out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <main className="pl-20 pt-8 pb-20 px-8 max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-2">
              {activeTab === 'dashboard' && `Welcome back, ${user.email?.split('@')[0]}`}
              {activeTab === 'planner' && 'Study Planner'}
              {activeTab === 'timer' && 'Focus Session'}
              {activeTab === 'analytics' && 'Performance Analytics'}
            </h1>
            <p className="text-gray-500">{format(new Date(), 'EEEE, MMMM do')}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-400">Student Plan</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
              {user.email?.substring(0, 2)}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'planner' && renderPlanner()}
            {activeTab === 'timer' && renderTimer()}
            {activeTab === 'analytics' && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-black/5">
                <h3 className="text-xl font-medium mb-8">Detailed Performance</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total_minutes" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                      <Line type="monotone" dataKey="avg_focus" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl">
                    <p className="text-xs font-bold text-emerald-600 uppercase mb-1">Total Minutes</p>
                    <p className="text-2xl font-light">{analytics.reduce((acc, curr) => acc + curr.total_minutes, 0)}</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-2xl">
                    <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Avg Focus</p>
                    <p className="text-2xl font-light">
                      {analytics.length > 0 ? Math.round(analytics.reduce((acc, curr) => acc + curr.avg_focus, 0) / analytics.length) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-black border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {!user ? (
        <AuthPage 
          type={authType} 
          onToggle={() => setAuthType(authType === 'login' ? 'signup' : 'login')} 
        />
      ) : (
        <MainApp user={user} />
      )}
    </ErrorBoundary>
  );
}
