import { Plus, ChevronRight, Users, Calendar, CheckCircle2, FileEdit, Zap } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface DashboardProps {
  events: LearningEvent[];
  onCreateNew: () => void;
  onOpenEvent: (id: string) => void;
}

const statusConfig = {
  Active: { label: 'Active', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border border-emerald-200' },
  Completed: { label: 'Completed', dot: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50 border border-blue-200' },
  Draft: { label: 'Draft', dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-100 border border-slate-200' },
};

const personaColors: Record<string, string> = {
  L1: 'bg-violet-50 text-violet-700 border border-violet-200',
  L2: 'bg-blue-50 text-blue-700 border border-blue-200',
  L3: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
  L4: 'bg-amber-50 text-amber-700 border border-amber-200',
};

export default function Dashboard({ events, onCreateNew, onOpenEvent }: DashboardProps) {
  const active = events.filter(e => e.status === 'Active').length;
  const draft = events.filter(e => e.status === 'Draft').length;
  const totalAssigned = events.reduce((s, e) => s + e.assignedCount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning Events</h1>
          <p className="text-slate-500 text-sm">Manage and track all capability-based learning events</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={15} />
          New Learning Event
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length, icon: Zap, color: 'text-blue-600' },
          { label: 'Active', value: active, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Drafts', value: draft, icon: FileEdit, color: 'text-slate-500' },
          { label: 'Learners Assigned', value: totalAssigned, icon: Users, color: 'text-violet-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Plus size={20} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm mb-3">No learning events yet</p>
            <button onClick={onCreateNew} className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
              Create your first event →
            </button>
          </div>
        ) : (
          events.map((event) => {
            const sc = statusConfig[event.status];
            return (
              <button
                key={event.id}
                onClick={() => onOpenEvent(event.id)}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl p-5 text-left transition-all group shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="text-slate-400 text-xs">{event.capability.domain}</span>
                    </div>
                    <h3 className="text-slate-900 font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-1 mb-3">{event.context}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users size={12} />
                        {event.assignedCount} learners
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {event.createdAt}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {event.selectedPersonas.map(p => (
                          <span key={p} className={`text-xs font-semibold px-1.5 py-0.5 rounded ${personaColors[p]}`}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
