import { ArrowLeft, CheckCircle2, Tag } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface EventDetailProps {
  event: LearningEvent;
  onBack: () => void;
}

const personaColors: Record<string, string> = {
  L1: 'bg-violet-50 text-violet-700 border border-violet-200',
  L2: 'bg-blue-50 text-blue-700 border border-blue-200',
  L3: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  L4: 'bg-amber-50 text-amber-700 border border-amber-200',
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
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-blue-600 text-xs font-semibold uppercase tracking-widest mb-1">{event.capability.domain}</p>
            <h1 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              {event.capability.tags.map(t => (
                <span key={t} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{t}</span>
              ))}
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
            event.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            event.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {event.status}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Team</p>
            <p className="text-slate-900 text-sm font-medium">{event.teamName}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Learners Assigned</p>
            <p className="text-slate-900 text-sm font-medium">{event.assignedCount}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-0.5">Created</p>
            <p className="text-slate-900 text-sm font-medium">{event.createdAt}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-sm mb-3 flex items-center gap-2">
          <Tag size={14} className="text-blue-600" />
          Team Context
        </h2>
        <p className="text-slate-700 text-sm leading-relaxed">{event.context}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-slate-900 font-semibold text-sm mb-5 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-blue-600" />
          Learning Outcomes by Persona
        </h2>
        <div className="space-y-4">
          {event.outcomes.map(({ persona, outcomes }) => (
            <div key={persona} className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2 bg-slate-50 border-b border-slate-200">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${personaColors[persona]}`}>{persona}</span>
                <span className="text-slate-700 text-sm font-medium">{personaLabel[persona]}</span>
              </div>
              <div className="p-4 space-y-2">
                {outcomes.map((o, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <p className="text-slate-700 text-sm">{o}</p>
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
