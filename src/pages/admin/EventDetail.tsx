import { ArrowLeft, CheckCircle2, Tag } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface EventDetailProps {
  event: LearningEvent;
  onBack: () => void;
}

const personaColors: Record<string, string> = {
  L1: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  L2: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  L3: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  L4: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

const personaLabel: Record<string, string> = {
  L1: 'L1 — Junior / Associate',
  L2: 'L2 — Scientist / Analyst',
  L3: 'L3 — Senior Scientist',
  L4: 'L4 — Principal / Lead',
};

export default function EventDetail({ event, onBack }: EventDetailProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-1">{event.capability.domain}</p>
            <h1 className="text-xl font-bold text-white mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              {event.capability.tags.map(t => (
                <span key={t} className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">{t}</span>
              ))}
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            event.status === 'Active' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' :
            event.status === 'Completed' ? 'bg-blue-400/10 text-blue-400 border border-blue-400/20' :
            'bg-slate-400/10 text-slate-400 border border-slate-400/20'
          }`}>
            {event.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Team</p>
            <p className="text-white text-sm font-medium">{event.teamName}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Learners Assigned</p>
            <p className="text-white text-sm font-medium">{event.assignedCount}</p>
          </div>
          <div>
            <p className="text-slate-500 text-xs mb-0.5">Created</p>
            <p className="text-white text-sm font-medium">{event.createdAt}</p>
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          <Tag size={14} className="text-blue-400" />
          Team Context
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed">{event.context}</p>
      </div>

      {/* Learning Outcomes per Persona */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-blue-400" />
          Learning Outcomes by Persona
        </h2>
        <div className="space-y-5">
          {event.outcomes.map(({ persona, outcomes }) => (
            <div key={persona} className="border border-slate-800 rounded-lg overflow-hidden">
              <div className={`px-4 py-2.5 flex items-center gap-2 bg-slate-800/50`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${personaColors[persona]}`}>{persona}</span>
                <span className="text-slate-300 text-sm font-medium">{personaLabel[persona]}</span>
              </div>
              <div className="p-4 space-y-2">
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <p className="text-slate-300 text-sm">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
