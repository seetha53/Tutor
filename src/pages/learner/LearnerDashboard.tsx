import { BookOpen, Clock, CheckCircle2, ChevronRight, Calendar, Target } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface LearnerEvent {
  event: LearningEvent;
  status: 'assigned' | 'in-progress' | 'completed';
  proficiency?: string;
  progress?: number;
  dueDate?: string;
  completedDate?: string;
}

interface LearnerDashboardProps {
  events: LearnerEvent[];
  onOpen: (id: string) => void;
}

const statusConfig = {
  assigned: { label: 'Assigned', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', dot: 'bg-amber-400' },
  'in-progress': { label: 'In Progress', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20', dot: 'bg-blue-400' },
  completed: { label: 'Completed', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
};

function EventCard({ item, onOpen }: { item: LearnerEvent; onOpen: () => void }) {
  const sc = statusConfig[item.status];
  return (
    <button
      onClick={onOpen}
      className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 text-left transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
            <span className="text-slate-500 text-xs">{item.event.capability.domain}</span>
          </div>
          <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-teal-300 transition-colors">{item.event.capability.name}</h3>
          <p className="text-slate-500 text-xs mb-3 line-clamp-1">{item.event.title}</p>

          {item.status === 'in-progress' && typeof item.progress === 'number' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Progress</span>
                <span className="text-slate-400">{item.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {item.dueDate && (
              <span className="flex items-center gap-1.5"><Calendar size={11} /> Due {item.dueDate}</span>
            )}
            {item.completedDate && (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-400" /> Completed {item.completedDate}</span>
            )}
            {item.proficiency && (
              <span className="flex items-center gap-1.5"><Target size={11} className="text-teal-400" /> {item.proficiency}</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}

export default function LearnerDashboard({ events, onOpen }: LearnerDashboardProps) {
  const assigned = events.filter(e => e.status === 'assigned');
  const inProgress = events.filter(e => e.status === 'in-progress');
  const completed = events.filter(e => e.status === 'completed');

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">My Learning Events</h1>
        <p className="text-slate-400 text-sm">Your assigned capability learning events</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Assigned', value: assigned.length, icon: BookOpen, color: 'text-amber-400' },
          { label: 'In Progress', value: inProgress.length, icon: Clock, color: 'text-blue-400' },
          { label: 'Completed', value: completed.length, icon: CheckCircle2, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* In Progress */}
      {inProgress.length > 0 && (
        <section className="mb-6">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">In Progress</h2>
          <div className="space-y-3">
            {inProgress.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}

      {/* Assigned */}
      {assigned.length > 0 && (
        <section className="mb-6">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Assigned</h2>
          <div className="space-y-3">
            {assigned.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
