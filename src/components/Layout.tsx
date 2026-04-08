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
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] scale-105">
        <img 
          src="/premium_bg.png" 
          alt="Abstract background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-[10%] -right-24 w-96 h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[20%] -left-24 w-96 h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse-slow delay-700" />
      
      <div className="relative z-10 flex flex-col h-full bg-surface/60 backdrop-blur-[8px]">
        {/* Editorial Header */}
        <header className="px-8 pt-10 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-baseline gap-2"
          >
            <h1 className="text-4xl font-display font-black tracking-tighter text-on-surface">Aura</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_15px_rgba(124,58,237,0.8)]" />
          </motion.div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 pb-28 no-scrollbar scroll-smooth">
          {children}
        </main>

        {/* Docked Navigation */}
        <nav className="h-20 bg-surface-container/80 backdrop-blur-xl border-t border-outline-variant/10 px-6 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-1 group transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-on-surface-variant/60 hover:text-on-surface"
                )}
              >
                <div className={cn(
                  "p-2 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className="relative z-10" 
                  />
                </div>
                <span className={cn(
                  "text-[9px] font-display font-bold uppercase tracking-widest transition-all",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
