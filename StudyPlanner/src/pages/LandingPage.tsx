import React from 'react';
import { Sparkles, Clock, Target, BarChart2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold">F</div>
            <span className="text-xl font-bold tracking-tight">FocusFlow</span>
          </div>
          <button 
            onClick={signIn}
            className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-emerald-500 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium mb-8">
            <Sparkles size={16} className="text-emerald-500" />
            <span>Powered by Gemini AI</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            STUDY SMARTER,<br />
            <span className="text-emerald-500">NOT HARDER.</span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            The all-in-one AI study companion that builds your schedule, tracks your focus, and coaches you to peak productivity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={signIn}
              className="w-full sm:w-auto bg-emerald-500 text-black px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              Start Your Journey <ArrowRight size={20} />
            </button>
            <button className="w-full sm:w-auto bg-zinc-900 text-white px-10 py-5 rounded-2xl font-bold text-lg border border-zinc-800 hover:bg-zinc-800 transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Study Plans</h3>
              <p className="text-zinc-500 leading-relaxed">
                Input your subjects and exam dates, and our AI generates a personalized study timetable optimized for your learning pace.
              </p>
            </div>
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-6">
                <Clock size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Focus Timer</h3>
              <p className="text-zinc-500 leading-relaxed">
                Built-in Pomodoro timer with deep work tracking to help you maintain concentration and avoid burnout.
              </p>
            </div>
            <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-3xl">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500 mb-6">
                <BarChart2 size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Deep Analytics</h3>
              <p className="text-zinc-500 leading-relaxed">
                Visualize your progress with detailed charts. Track study hours, task completion, and efficiency over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20 px-6 bg-emerald-500 text-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <p className="text-5xl font-bold mb-2">10k+</p>
            <p className="font-bold opacity-70 uppercase text-xs tracking-widest">Active Students</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">500k+</p>
            <p className="font-bold opacity-70 uppercase text-xs tracking-widest">Focus Hours</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">98%</p>
            <p className="font-bold opacity-70 uppercase text-xs tracking-widest">Success Rate</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">4.9/5</p>
            <p className="font-bold opacity-70 uppercase text-xs tracking-widest">Student Rating</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black font-bold">F</div>
            <span className="text-xl font-bold tracking-tight">FocusFlow</span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
          <p className="text-sm text-zinc-600">© 2026 FocusFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
