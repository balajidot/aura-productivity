import { useState, useEffect } from 'react';
import { Task, Habit, ChatMessage } from '../types';

export const useStore = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('aura_tasks');
    const savedHabits = localStorage.getItem('aura_habits');
    const savedMessages = localStorage.getItem('aura_messages');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('aura_tasks', JSON.stringify(tasks));
      localStorage.setItem('aura_habits', JSON.stringify(habits));
      localStorage.setItem('aura_messages', JSON.stringify(messages));
    }
  }, [tasks, habits, messages, isLoaded]);

  const addTask = (task: Task) => setTasks(prev => [...prev, task]);
  const updateTask = (id: string, updates: Partial<Task>) => 
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const addHabit = (habit: Habit) => setHabits(prev => [...prev, habit]);
  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const isCompletedToday = h.lastCompleted === today;
        if (isCompletedToday) {
          // Undo completion
          return {
            ...h,
            streak: Math.max(0, h.streak - 1),
            lastCompleted: h.history[h.history.length - 2],
            history: h.history.filter(d => d !== today)
          };
        } else {
          // Mark as completed
          return {
            ...h,
            streak: h.streak + 1,
            lastCompleted: today,
            history: [...h.history, today]
          };
        }
      }
      return h;
    }));
  };

  const addMessage = (msg: ChatMessage) => setMessages(prev => [...prev, msg]);

  return {
    tasks,
    habits,
    messages,
    addTask,
    updateTask,
    deleteTask,
    addHabit,
    toggleHabit,
    addMessage,
    isLoaded
  };
};
