export type Priority = 'low' | 'medium' | 'high';
export type Category = 'work' | 'personal' | 'health' | 'other';
export type Status = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  date: string; // ISO string
  priority: Priority;
  category: Category;
  status: Status;
  description?: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompleted?: string; // ISO date string (YYYY-MM-DD)
  history: string[]; // List of completed dates
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface DailyInsight {
  score: number;
  completedCount: number;
  missedCount: number;
  aiText: string;
}
