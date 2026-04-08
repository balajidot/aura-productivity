import { useState } from 'react';
import { Plus, Trash2, Filter, MoreVertical, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Priority, Category } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface TasksProps {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const TasksView = ({ tasks, addTask, updateTask, deleteTask }: TasksProps) => {
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    priority: 'medium' as Priority,
    category: 'personal' as Category,
  });

  const filteredTasks = tasks
    .filter(t => filter === 'all' || t.category === filter)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleAddTask = () => {
    if (!newTask.title) return;
    addTask({
      id: Math.random().toString(36).substr(2, 9),
      ...newTask,
      status: 'pending',
    });
    setNewTask({
      title: '',
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      priority: 'medium',
      category: 'personal',
    });
    setIsAddOpen(false);
  };

  const priorityColors = {
    low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <div className="space-y-10 py-6">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-primary font-display font-bold uppercase tracking-[0.2em] text-[10px]">Registry</p>
          <h2 className="editorial-lead text-on-surface">Planned <br /> <span className="text-primary/60">Execution.</span></h2>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={<Button size="icon" className="size-14 rounded-2xl shadow-ambient" />}>
            <Plus size={28} />
          </DialogTrigger>
          <DialogContent className="glass border-outline-variant/10 text-on-surface rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display font-bold tracking-tight">Add New Focus</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Title</label>
                <Input
                  value={newTask.title}
                  onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="The objective is..."
                  className="bg-surface-lowest/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Timeline</label>
                <Input
                  type="datetime-local"
                  value={newTask.date}
                  onChange={e => setNewTask(prev => ({ ...prev, date: e.target.value }))}
                  className="bg-surface-lowest/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={v => setNewTask(prev => ({ ...prev, priority: v as Priority }))}
                  >
                    <SelectTrigger className="bg-surface-lowest/50 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-outline-variant/10">
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant/60 ml-1">Category</label>
                  <Select
                    value={newTask.category}
                    onValueChange={v => setNewTask(prev => ({ ...prev, category: v as Category }))}
                  >
                    <SelectTrigger className="bg-surface-lowest/50 rounded-xl h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-outline-variant/10">
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddTask} className="w-full h-14 text-lg font-bold mt-4 shadow-ambient font-display">
                Commit to Registry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
        {['all', 'work', 'personal', 'health', 'other'].map((cat) => (
          <Button
            key={cat}
            onClick={() => setFilter(cat as any)}
            className={cn(
              "h-9 px-4 rounded-full text-[10px] font-display font-bold uppercase tracking-widest transition-all",
              filter === cat
                ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105"
                : "bg-surface-low text-on-surface-variant/60 hover:text-on-surface border border-outline-variant/5"
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-20 opacity-20">
              <Filter size={48} className="mx-auto mb-4" />
              <p className="font-display uppercase tracking-widest text-xs">No entries found</p>
            </div>
          ) : (
            filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, delay: idx * 0.03 }}
                layout
              >
                <div className="group flex items-center gap-5 p-5 bg-surface-low/40 hover:bg-surface-container/60 transition-all rounded-2xl relative overflow-hidden">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className={cn(
                        "text-lg font-sans transition-all",
                        task.status === 'completed' ? "line-through opacity-30" : "text-on-surface"
                      )}>
                        {task.title}
                      </h3>
                      <Badge variant="outline" className={cn("text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 border", priorityColors[task.priority])}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-display font-bold text-primary/60 uppercase tracking-[0.1em]">
                        {format(new Date(task.date), 'MMM d • HH:mm')}
                      </p>
                      <div className="h-1 w-1 rounded-full bg-outline-variant/20" />
                      <p className="text-[10px] font-display font-bold text-on-surface-variant/40 uppercase tracking-[0.1em]">
                        {task.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 rounded-xl"
                      onClick={() => updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                    >
                      <CheckCircle2 size={20} className={cn(task.status === 'completed' && "text-primary")} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={20} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import { cn } from '@/lib/utils';
