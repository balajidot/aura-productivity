import { useState } from 'react';
import { Layout } from './components/Layout';
import { HomeView } from './components/Home';
import { TasksView } from './components/Tasks';
import { CalendarView } from './components/CalendarView';
import { AIChatView } from './components/AIChatView';
import { InsightsView } from './components/Insights';
import { useStore } from './hooks/useStore';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const store = useStore();

  if (!store.isLoaded) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-zinc-500 uppercase tracking-[0.2em] text-sm"
        >
          Aura
        </motion.div>
      </div>
    );
  }

  // Initialize some habits if empty
  if (store.habits.length === 0) {
    store.addHabit({ id: '1', name: 'Morning Meditation', streak: 5, history: [] });
    store.addHabit({ id: '2', name: 'Read 20 Pages', streak: 12, history: [] });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView {...store} />;
      case 'tasks':
        return <TasksView {...store} />;
      case 'calendar':
        return <CalendarView tasks={store.tasks} />;
      case 'chat':
        return <AIChatView messages={store.messages} tasks={store.tasks} addMessage={store.addMessage} />;
      case 'insights':
        return <InsightsView tasks={store.tasks} />;
      default:
        return <HomeView {...store} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
