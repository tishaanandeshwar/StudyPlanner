import React, { useState } from 'react';
import { Sparkles, Loader2, Calendar, Clock, BookOpen } from 'lucide-react';
import { generateStudyPlan } from '../services/gemini';
import { planService } from '../services/firestore';
import { useAuth } from '../context/AuthContext';

export function StudyPlanner() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState('');
  const [examDates, setExamDates] = useState('');
  const [hours, setHours] = useState(4);
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const subjectsList = subjects.split(',').map(s => s.trim());
      const plan = await generateStudyPlan({
        subjects: subjectsList,
        examDates,
        studyHoursPerDay: hours,
        difficulty
      });
      setGeneratedPlan(plan);
      await planService.savePlan({
        userId: user.id,
        subjects: subjectsList,
        examDates,
        studyHoursPerDay: hours,
        difficulty,
        planData: plan
      });
    } catch (error) {
      console.error(error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">AI Study Planner</h2>
            <p className="text-zinc-500">Generate a personalized timetable in seconds</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Subjects (comma separated)</label>
            <input
              type="text"
              required
              placeholder="Math, Physics, History..."
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Exam Dates / Period</label>
            <input
              type="text"
              required
              placeholder="Next month, May 15-20..."
              value={examDates}
              onChange={(e) => setExamDates(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Study Hours per Day</label>
            <input
              type="number"
              required
              min="1"
              max="16"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {loading ? 'Generating Your Plan...' : 'Generate Study Plan'}
          </button>
        </form>
      </div>

      {generatedPlan && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Your Generated Plan</h3>
          <div className="grid grid-cols-1 gap-6">
            {generatedPlan.map((day, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                  <span className="font-bold text-emerald-500">{day.day}</span>
                </div>
                <div className="p-6 space-y-4">
                  {day.sessions.map((session: any, sIdx: number) => (
                    <div key={sIdx} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg text-zinc-500">
                        <Clock size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-900 dark:text-white">{session.subject}</h4>
                          <span className="text-xs font-medium px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">
                            {session.duration}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{session.topic}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 italic">{session.time}</p>
                      </div>
                    </div>
                  ))}
                  {day.tips && day.tips.length > 0 && (
                    <div className="mt-4 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Pro Tips</p>
                      <ul className="list-disc list-inside text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
                        {day.tips.map((tip: string, tIdx: number) => (
                          <li key={tIdx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
