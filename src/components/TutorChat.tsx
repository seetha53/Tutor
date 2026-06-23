import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';
import { getTutorResponse } from '../data/fairContent';

interface Message {
  id: string;
  role: 'learner' | 'tutor';
  text: string;
  time: string;
}

interface TutorChatProps {
  contextHint?: string;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TutorChat({ contextHint }: TutorChatProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'tutor',
      text: 'Hi! I\'m your Tutor. Ask me anything about FAIR data principles at any point — a quick question, a clarification, or just a "why does this matter?" I\'m here throughout.',
      time: now(),
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const learnerMsg: Message = { id: `l-${Date.now()}`, role: 'learner', text, time: now() };
    setMessages(prev => [...prev, learnerMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = getTutorResponse(text + ' ' + (contextHint ?? ''));
      setMessages(prev => [...prev, { id: `t-${Date.now()}`, role: 'tutor', text: response, time: now() }]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  return (
    <div className="fixed bottom-0 left-64 right-0 z-30">
      {/* Collapsed tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto mr-6 mb-0 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 border-b-0 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-t-xl transition-colors shadow-lg"
        >
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <MessageCircle size={13} />
          Ask your Tutor
        </button>
      )}

      {/* Expanded drawer */}
      {open && (
        <div className="bg-slate-900 border-t border-slate-700 shadow-2xl flex flex-col" style={{ height: '320px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-white text-sm font-semibold">Tutor</span>
              <span className="text-slate-500 text-xs">· Ask anything about FAIR</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'learner' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'tutor' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">T</div>
                )}
                <div className={`max-w-lg px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'tutor'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-blue-600 text-white rounded-tr-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">T</div>
                <div className="bg-slate-800 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-3 border-t border-slate-800 flex gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about FAIR principles, the assessment, or anything on your mind…"
              className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
