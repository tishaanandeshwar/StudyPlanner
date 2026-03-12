export interface Task {
  id: string;
  title: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  category: string;
  created_at: string;
}

export interface StudySession {
  date: string;
  total_minutes: number;
  avg_focus: number;
}

export interface ScheduleItem {
  time: string;
  activity: string;
  duration: string;
}
