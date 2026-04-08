import { Task } from '../types';
import { format, startOfDay, addHours, isSameDay } from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface CalendarProps {
  tasks: Task[];
}

export const CalendarView = ({ tasks }: CalendarProps) => {
  const today = startOfDay(new Date());
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const todayTasks = tasks.filter(t => isSameDay(new Date(t.date), today));

  return (
    <div className="py-6 h-full flex flex-col space-y-10">
      <header className="space-y-1">
        <p className="text-primary font-display font-bold uppercase tracking-[0.2em] text-[10px]">Timeline Analysis</p>
        <h2 className="editorial-lead text-on-surface">
          {format(today, 'EEEE,')} <br />
          <span className="text-primary/60">{format(today, 'MMMM do')}</span>
        </h2>
      </header>

      <div className="flex-1 relative overflow-y-auto no-scrollbar pb-20">
        <div className="absolute left-[60px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/20 via-primary/5 to-transparent h-full z-0" />
        
        <div className="space-y-0 relative z-10">
          {hours.map((hour) => {
            const hourTasks = todayTasks.filter(t => new Date(t.date).getHours() === hour);
            
            return (
              <div key={hour} className="relative min-h-[100px] flex group transition-all">
                <div className="w-[60px] pr-6 text-right pt-1">
                  <span className="text-[10px] font-display font-bold text-on-surface-variant/30 group-hover:text-primary/60 transition-colors uppercase tracking-widest">
                    {format(addHours(today, hour), 'HH:00')}
                  </span>
                </div>
                
                <div className="flex-1 pl-8 pb-6 border-t border-outline-variant/3">
                  <div className="space-y-3 pt-3">
                    {hourTasks.length === 0 ? (
                      <div className="h-4 w-full flex items-center">
                         <div className="h-px w-full bg-outline-variant/5 group-hover:bg-outline-variant/20 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                    ) : (
                      hourTasks.map((task, tidx) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: tidx * 0.1 }}
                          className={cn(
                            "p-5 rounded-2xl shadow-ambient border-none relative overflow-hidden group/item",
                            task.priority === 'high' ? "bg-red-500/5 text-on-surface" :
                            task.priority === 'medium' ? "bg-primary/5 text-on-surface" :
                            "bg-surface-low/40 text-on-surface"
                          )}
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover/item:bg-primary transition-all" 
                               style={{ backgroundColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.4)' : undefined }} />
                          
                          <div className="flex justify-between items-start pl-2">
                            <div className="space-y-1">
                               <span className="text-base font-sans font-medium">{task.title}</span>
                               <div className="flex items-center gap-3">
                                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-on-surface-variant/40">
                                    {format(new Date(task.date), 'h:mm a')}
                                  </span>
                                  <div className="h-1 w-1 rounded-full bg-outline-variant/20" />
                                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-primary/40">
                                    {task.category}
                                  </span>
                               </div>
                            </div>
                            <div className={cn(
                              "size-3 rounded-full shadow-lg",
                              task.priority === 'high' ? "bg-red-500 shadow-red-500/20" :
                              task.priority === 'medium' ? "bg-primary shadow-primary/20" :
                              "bg-outline-variant/40"
                            )} />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
