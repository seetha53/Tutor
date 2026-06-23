import { useState, useRef, useEffect } from 'react';
import { Send, GraduationCap } from 'lucide-react';
import { getTutorResponse } from '../data/fairContent';

interface Message {
  id: string;
  role: 'learner' | 'tutor';
  text: string;
}

interface TutorChatProps {
  contextHint?: string;
}

export default function TutorChat({ contextHint }: TutorChatProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'tutor',
      text: 'Hi! Ask me anything about FAIR data principles at any point — a quick question, a concept you want explained differently, or just "why does this matter?"',
    },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: `l-${Date.now()}`, role: 'learner', text }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const response = getTutorResponse(text + ' ' + (contextHint ?? ''));
      setMessages(prev => [...prev, { id: `t-${Date.now()}`, role: 'tutor', text: response }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
          <GraduationCap size={12} className="text-white" />
        </div>
        <span className="text-slate-700 text-sm font-semibold">Ask your Tutor</span>
        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse ml-1" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'learner' ? 'flex-row-reverse' : ''}`}>
            {msg.role === 'tutor' && (
              <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <GraduationCap size={10} className="text-white" />
              </div>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              msg.role === 'tutor'
                ? 'bg-slate-100 text-slate-700 rounded-tl-sm'
                : 'bg-teal-600 text-white rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap size={10} className="text-white" />
            </div>
            <div className="bg-slate-100 px-3 py-2.5 rounded-xl rounded-tl-sm flex gap-1 items-center">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-slate-200 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about FAIR, the assessments, or anything on your mind…"
          className="flex-1 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500 transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white p-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}
