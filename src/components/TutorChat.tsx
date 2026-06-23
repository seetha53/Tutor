import { useState } from 'react';
import { Send, GraduationCap, X } from 'lucide-react';
import { getTutorResponse } from '../data/fairContent';

export default function TutorChat({ contextHint }: { contextHint?: string }) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setReply(null);
    setTyping(true);
    setTimeout(() => {
      setReply(getTutorResponse(text + ' ' + (contextHint ?? '')));
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <div className="px-4 py-3 relative">
      {/* Latest reply — single floating bubble above the input */}
      {(reply || typing) && (
        <div className="absolute bottom-full left-4 right-4 mb-2 flex justify-start">
          <div className="flex gap-2 max-w-[85%] bg-white border border-slate-200 shadow-lg rounded-xl rounded-bl-sm px-3 py-2.5">
            <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <GraduationCap size={10} className="text-white" />
            </div>
            {typing ? (
              <div className="flex gap-1 items-center py-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
              <p className="text-slate-700 text-xs leading-relaxed">{reply}</p>
            )}
            {!typing && (
              <button onClick={() => setReply(null)} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask your Tutor…"
          className="flex-1 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-teal-500 transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white p-2.5 rounded-lg transition-colors flex-shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
