export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  title: string;
  subject: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  duration: number; // in minutes
  subject: string;
  timestamp: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  subjects: string[];
  examDates: string;
  studyHoursPerDay: number;
  difficulty: string;
  planData: any; // JSON from AI
  createdAt: string;
}

export interface UserStats {
  totalStudyHours: number;
  focusTime: number;
  streak: number;
  tasksCompleted: number;
}
