import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, X, Loader2 } from 'lucide-react';
import { ai, taskTools } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../constants';
import { format } from 'date-fns';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface ChatbotProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'created'>) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  currentDate: Date;
}

export default function Chatbot({ tasks, onAddTask, onUpdateTask, onDeleteTask, currentDate }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    if (!chatRef.current) {
      chatRef.current = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction: `אתה עוזר אישי חכם בתוך אפליקציית יומן משימות. ענה תמיד בעברית. עליך להיות מהיר, מתומצת מאוד, ומדויק.
          התאריך של היום הוא: ${format(new Date(), 'yyyy-MM-dd')}. התאריך שהמשתמש צופה בו כעת הוא: ${format(currentDate, 'yyyy-MM-dd')}.
          יש לך גישה למשימות של המשתמש. אתה יכול להוסיף, לעדכן, למחוק ולקרוא משימות באמצעות הכלים שסופקו לך.
          כאשר המשתמש מבקש להוסיף, למחוק או לשנות משימה, השתמש בכלים (Tools) המתאימים.`,
          tools: [{ functionDeclarations: taskTools }],
        }
      });
    }
  }, [currentDate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userText }] }]);
    setInput('');
    setIsLoading(true);

    try {
      let response = await chatRef.current.sendMessage({ message: userText });

      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];

        for (const call of response.functionCalls) {
          const { name, args } = call;
          let result: any = { success: true };

          try {
            if (name === 'getTasks') {
              result = { tasks: tasksRef.current };
            } else if (name === 'addTask') {
              onAddTask({
                title: args.title,
                date: args.date,
                time: args.time || '',
                priority: args.priority || 'medium',
                done: false,
                note: ''
              });
              result = { message: "Task added successfully" };
            } else if (name === 'updateTask') {
              onUpdateTask(args.id, args);
              result = { message: "Task updated successfully" };
            } else if (name === 'deleteTask') {
              onDeleteTask(args.id);
              result = { message: "Task deleted successfully" };
            }
          } catch (err: any) {
            result = { success: false, error: err.message };
          }

          functionResponses.push({
            functionResponse: {
              name,
              response: result
            }
          });
        }

        response = await chatRef.current.sendMessage({ message: functionResponses });
      }

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "מצטער, חלה שגיאה בתקשורת." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gold rounded-full shadow-deep flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        <Bot size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 left-6 w-80 md:w-96 h-[500px] bg-white rounded-2xl shadow-deep border border-border flex flex-col z-50 overflow-hidden"
            dir="rtl"
          >
            <div className="p-4 bg-gold text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Gemini Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-void/30">
              {messages.length === 0 && (
                <div className="text-center text-text-mute mt-10">
                  <Bot size={40} className="mx-auto mb-2 opacity-20" />
                  <p>שלום! אני העוזר שלכם. איך אוכל לעזור היום?</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user'
                        ? 'bg-gold text-white rounded-tr-none'
                        : 'bg-white border border-border text-text-prime rounded-tl-none'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 opacity-60 text-[10px] font-bold uppercase tracking-wider">
                      {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                      {msg.role === 'user' ? 'אתה' : 'Gemini'}
                    </div>
                    <div className="markdown-body">
                      <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-gold" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-top border-border bg-white flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="כתוב הודעה..."
                className="flex-1 bg-bg-void border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-gold"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-gold text-white p-2 rounded-xl hover:opacity-90 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
