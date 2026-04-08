import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, Task } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { getAIChatResponse } from '../lib/gemini';
import { cn } from '@/lib/utils';

interface AIChatProps {
  messages: ChatMessage[];
  tasks: Task[];
  addMessage: (msg: ChatMessage) => void;
}

export const AIChatView = ({ messages, tasks, addMessage }: AIChatProps) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    addMessage(userMsg);
    setInput('');
    setIsLoading(true);

    const response = await getAIChatResponse([...messages, userMsg], tasks);

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response || "I'm here to help you stay productive.",
      timestamp: Date.now(),
    };

    addMessage(assistantMsg);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] py-6">
      <header className="mb-8 space-y-1">
        <p className="text-primary font-display font-bold uppercase tracking-[0.2em] text-[10px]">Neural Sync</p>
        <h2 className="editorial-lead text-on-surface">Ask <br /> <span className="text-primary/60">Aura.</span></h2>
      </header>

      <div className="flex-1 flex flex-col glass rounded-3xl overflow-hidden border-outline-variant/10 shadow-ambient">
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-8 pb-4">
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Bot size={40} className="text-primary/60" strokeWidth={1.5} />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <p className="text-on-surface font-display font-bold text-lg">Aura Intelligence</p>
                  <p className="text-xs text-on-surface-variant/40 leading-relaxed">
                    Synchronize your goals. Ask me to optimize your schedule or distill complex tasks.
                  </p>
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className={cn(
                    "flex gap-4 items-end",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-ambient",
                    msg.role === 'user' ? "bg-surface-highest" : "bg-primary text-on-primary"
                  )}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] p-5 rounded-2xl text-sm leading-relaxed font-sans shadow-sm",
                    msg.role === 'user'
                      ? "bg-surface-highest text-on-surface rounded-br-none"
                      : "bg-surface-low/30 text-on-surface border border-outline-variant/5 rounded-bl-none backdrop-blur-md"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex gap-4 items-end">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-ambient">
                  <Bot size={18} />
                </div>
                <div className="bg-surface-low/30 p-4 rounded-2xl rounded-bl-none flex gap-1.5 backdrop-blur-md border border-outline-variant/5">
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-2 h-2 bg-primary/60 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-surface-lowest/40 backdrop-blur-xl border-t border-outline-variant/5">
          <div className="relative group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire with Aura..."
              className="bg-surface-lowest/80 border-none h-14 pl-6 pr-14 rounded-2xl text-base transition-all duration-300 focus:ring-primary/10 shadow-inner font-sans"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 size-10 rounded-xl transition-all duration-300",
                input.trim() ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-105" : "bg-transparent text-on-surface-variant/20"
              )}
              disabled={!input.trim() || isLoading}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
