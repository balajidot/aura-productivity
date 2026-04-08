import React from 'react';
import { Home, ListTodo, Calendar, MessageSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout = ({ children, activeTab, setActiveTab }: LayoutProps) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'tasks', icon: ListTodo, label: 'Tasks' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'chat', icon: MessageSquare, label: 'AI' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
  ];

  return (
    <div className="flex flex-col h-screen bg-surface text-on-surface max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Premium Background Asset */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-screen scale-110">
        <img 
          src="/premium_abstract_bg_1775632599115.png" 
          alt="Abstract background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-[10%] -right-24 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] -left-24 w-96 h-96 bg-primary/10 blur-[150px] rounded-full pointer-events-none animate-pulse-slow delay-700" />
      
      <div className="relative z-10 flex flex-col h-full bg-surface/40 backdrop-blur-[2px]">
        {/* Editorial Header */}
        <header className="px-8 pt-12 pb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-2"
          >
            <h1 className="text-4xl font-display font-black tracking-tighter text-on-surface">Aura</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
          </motion.div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar">
          {children}
        </main>

        {/* Glassmorphism Navigation */}
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(448px-3rem)] glass rounded-full px-2 py-2 flex justify-between items-center z-50 shadow-ambient border border-outline-variant/10">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-500",
                  isActive ? "text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  />
                )}
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className="relative z-10" 
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
