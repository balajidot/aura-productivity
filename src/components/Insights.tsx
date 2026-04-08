import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Task } from '../types';
import { Card } from './ui/card';
import { getWeeklyInsights } from '../lib/gemini';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';

interface InsightsProps {
  tasks: Task[];
}

export const InsightsView = ({ tasks }: InsightsProps) => {
  const [aiInsight, setAiInsight] = useState('Generating your weekly productivity analysis...');
  const [isLoading, setIsLoading] = useState(true);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const total = tasks.length;
  const score = total > 0 ? Math.round((completed / total) * 100) : 0;

  useEffect(() => {
    const fetchInsight = async () => {
      setIsLoading(true);
      const insight = await getWeeklyInsights(tasks);
      setAiInsight(insight);
      setIsLoading(false);
    };
    if (tasks.length > 0) fetchInsight();
    else {
      setAiInsight("Start adding tasks to see your productivity insights.");
      setIsLoading(false);
    }
  }, [tasks]);

  const data = [
    { name: 'Completed', value: completed, color: '#7c3aed' },
    { name: 'Pending', value: pending, color: 'rgba(124, 58, 237, 0.1)' },
  ];

  const categoryData = ['work', 'personal', 'health', 'other'].map(cat => ({
    name: cat,
    count: tasks.filter(t => t.category === cat).length
  }));

  return (
    <div className="space-y-12 py-8">
      <header className="space-y-1">
        <p className="text-primary font-display font-bold uppercase tracking-[0.2em] text-[10px]">Analytics Meta</p>
        <h2 className="editorial-lead text-on-surface">Momentum <br /> <span className="text-primary/60">Decoded.</span></h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card className="bg-surface-low border-none p-10 flex flex-col items-center justify-center gap-4 shadow-ambient rounded-3xl group hover:bg-surface-container transition-all">
          <div className="relative">
             <span className="text-7xl font-display font-bold text-on-surface group-hover:scale-110 transition-transform block">{score}%</span>
             <div className="absolute -inset-4 bg-primary/5 blur-2xl rounded-full -z-10" />
          </div>
          <span className="text-[11px] font-display font-bold text-primary/60 uppercase tracking-[0.2em]">Efficiency Coefficient</span>
        </Card>
        
        <div className="space-y-6">
           <Card className="bg-surface-low border-none p-6 flex items-center gap-6 shadow-ambient rounded-3xl">
              <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <TrendingUp size={32} />
              </div>
              <div>
                <span className="text-xl font-display font-bold block text-on-surface">Accelerating</span>
                <span className="text-[10px] font-display font-bold text-on-surface-variant/40 uppercase tracking-widest">Growth Velocity</span>
              </div>
           </Card>

           <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Sparkles size={16} className="text-primary/60" />
              <h3 className="text-[10px] font-display font-bold uppercase tracking-widest text-on-surface-variant/60">Intelligence Summary</h3>
            </div>
            <Card className="glass p-6 relative overflow-hidden rounded-3xl border-outline-variant/10">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 opacity-50" />
              <p className="text-sm leading-relaxed text-on-surface/90 font-serif italic">
                "{aiInsight}"
              </p>
            </Card>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h3 className="text-[10px] font-display font-bold text-on-surface-variant/40 uppercase tracking-widest text-center px-4">Registry Allocation</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-display font-bold text-on-surface">{total}</span>
              <span className="text-[9px] font-display font-bold text-on-surface-variant/30 uppercase tracking-tighter">Units Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-8">
            <div className="flex items-center gap-3 bg-surface-lowest px-4 py-2 rounded-full border border-outline-variant/5">
              <div className="size-2 rounded-full bg-primary" />
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">{completed} Optimized</span>
            </div>
            <div className="flex items-center gap-3 bg-surface-lowest px-4 py-2 rounded-full border border-outline-variant/5">
              <div className="size-2 rounded-full bg-primary/20" />
              <span className="text-[10px] font-display font-bold text-on-surface-variant uppercase">{pending} Latent</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-display font-bold text-on-surface-variant/40 uppercase tracking-widest px-4">Category Metrics</h3>
          <div className="h-64 w-full bg-surface-low/20 rounded-3xl p-6 border border-outline-variant/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.4, fontWeight: 'bold' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(124, 58, 237, 0.05)', radius: 12 }}
                  contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', border: 'none', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                />
                <Bar dataKey="count" fill="url(#primaryGradient)" radius={[10, 10, 10, 10]} barSize={32} >
                  <defs>
                    <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
};
