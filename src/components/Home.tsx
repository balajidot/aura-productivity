import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Flame, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Habit } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { extractTaskFromText } from '../lib/gemini';
import { format } from 'date-fns';

interface HomeProps {
  tasks: Task[];
  habits: Habit[];
  addTask: (task: Task) => void;
  toggleHabit: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
}

export const HomeView = ({ tasks, habits, addTask, toggleHabit, updateTask }: HomeProps) => {
  const [input, setInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsExtracting(true);
    const extracted = await extractTaskFromText(input);
    setIsExtracting(false);

    if (extracted) {
      addTask({
        id: Math.random().toString(36).substr(2, 9),
        title: extracted.title || input,
        date: extracted.date || new Date().toISOString(),
        priority: extracted.priority || 'medium',
        category: extracted.category || 'other',
        status: 'pending',
      });
      setInput('');
    }
  };

  const todayTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0];
    return t.date.startsWith(today);
  });

  return (
    <div className="h-full overflow-y-auto no-scrollbar scroll-smooth">
      <div className="space-y-12 py-8 pb-20">
        {/* Editorial Lead Greeting */}
        <section className="space-y-2">
          <motion.p 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-primary font-display font-bold uppercase tracking-[0.3em] text-[10px]"
          >
            Daily Overview
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="editorial-lead text-on-surface"
          >
            Flow with <br /> <span className="text-primary/60">Intelligence.</span>
          </motion.h2>
        </section>

        {/* ... rest of content ... */}
        {/* Glassmorphic Quick Add */}
        <section className="space-y-4">
          <form onSubmit={handleQuickAdd} className="relative group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's your next move?"
              className="glass h-16 rounded-2xl border-none pl-8 pr-16 text-lg transition-all duration-500 focus:ring-primary/20 placeholder:text-on-surface-variant/30 font-display"
              disabled={isExtracting}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 size-12 bg-primary text-on-primary rounded-xl shadow-ambient hover:scale-105 active:scale-95 transition-all"
              disabled={isExtracting}
            >
              {isExtracting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={20} />
                </motion.div>
              ) : (
                <Plus size={24} />
              )}
            </Button>
          </form>
        </section>

        {/* Focus & Habits Grid - Asymmetric Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Today's Focus */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-outline-variant/10" />
              <h3 className="text-xs font-display font-medium uppercase tracking-widest text-on-surface-variant/60">Focus</h3>
            </div>
            <div className="space-y-4">
              {todayTasks.length === 0 ? (
                <div className="bg-surface-lowest p-8 rounded-xl border border-dashed border-outline-variant/10 text-center">
                  <p className="text-on-surface-variant/40 text-sm italic font-sans">The void is yours. Rest or create.</p>
                </div>
              ) : (
                todayTasks.map((task, idx) => (
                  <motion.div 
                    key={task.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div 
                      className="group flex items-center gap-5 p-5 bg-surface-low/30 hover:bg-surface-container/50 transition-all cursor-pointer rounded-2xl"
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        task.status === 'completed' ? "bg-primary border-primary scale-110" : "border-outline-variant/30 group-hover:border-primary/50"
                      )}>
                        {task.status === 'completed' && <CheckCircle2 size={12} className="text-on-primary" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <h4 className={cn(
                          "text-base transition-all font-sans",
                          task.status === 'completed' ? 'line-through opacity-40' : 'text-on-surface'
                        )}>
                          {task.title}
                        </h4>
                        <p className="text-[11px] font-display font-bold text-primary/60 uppercase tracking-widest mt-0.5">
                          {format(new Date(task.date), 'HH:mm')} • {task.category}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </div>
          </section>

          {/* Habits - Smaller, grid-like but layered */}
          <section className="space-y-6">
             <div className="flex items-center gap-3">
              <h3 className="text-xs font-display font-medium uppercase tracking-widest text-on-surface-variant/60 whitespace-nowrap">Consistency</h3>
              <div className="h-px flex-1 bg-outline-variant/10" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {habits.map((habit, idx) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                >
                  <Card 
                    size="sm"
                    onClick={() => toggleHabit(habit.id)}
                    className="bg-surface-lowest hover:bg-surface-low p-5 flex items-center justify-between group cursor-pointer transition-all border border-outline-variant/5"
                  >
                    <div className="space-y-1">
                      <span className="text-sm font-medium font-sans">{habit.name}</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 text-primary">
                          <Flame size={12} fill="currentColor" />
                          <span className="text-[11px] font-bold font-display">{habit.streak}</span>
                        </div>
                        <span className="text-[10px] text-on-surface-variant/40 uppercase tracking-tighter">Day Streak</span>
                      </div>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                      habit.lastCompleted === new Date().toISOString().split('T')[0] 
                        ? "bg-primary/20 text-primary scale-110 shadow-lg shadow-primary/10" 
                        : "bg-surface-highest/50 text-on-surface-variant/30 group-hover:scale-105"
                    )}>
                      <CheckCircle2 size={24} />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
