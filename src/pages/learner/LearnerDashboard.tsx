import { BookOpen, Clock, CheckCircle2, ChevronRight, Calendar, Target } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface LearnerEvent {
  event: LearningEvent;
  status: 'assigned' | 'in-progress' | 'completed';
  progress?: number;
  dueDate?: string;
  completedDate?: string;
}

interface LearnerDashboardProps {
  events: LearnerEvent[];
  onOpen: (id: string) => void;
}

const statusConfig = {
  assigned: { label: 'Assigned', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  'in-progress': { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
};

function EventCard({ item, onOpen }: { item: LearnerEvent; onOpen: () => void }) {
  const sc = statusConfig[item.status];
  return (
    <button
      onClick={onOpen}
      className="w-full bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md rounded-xl p-5 text-left transition-all group shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {sc.label}
            </span>
            <span className="text-slate-400 text-xs">{item.event.capability.domain}</span>
          </div>
          <h3 className="text-slate-900 font-semibold text-sm mb-1 group-hover:text-teal-700 transition-colors">{item.event.capability.name}</h3>
          <p className="text-slate-500 text-xs mb-3 line-clamp-1">{item.event.title}</p>

          {item.status === 'in-progress' && typeof item.progress === 'number' && (
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-600 font-medium">{item.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-400">
            {item.dueDate && (
              <span className="flex items-center gap-1.5"><Calendar size={11} /> Due {item.dueDate}</span>
            )}
            {item.completedDate && (
              <span className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-500" /> Completed {item.completedDate}</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-1 transition-colors" />
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
        <h1 className="text-2xl font-bold text-slate-900 mb-1">My Learning Events</h1>
        <p className="text-slate-500 text-sm">Your assigned capability learning events</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Assigned', value: assigned.length, icon: BookOpen, color: 'text-amber-600' },
          { label: 'In Progress', value: inProgress.length, icon: Clock, color: 'text-blue-600' },
          { label: 'Completed', value: completed.length, icon: Target, color: 'text-emerald-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {inProgress.length > 0 && (
        <section className="mb-6">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">In Progress</h2>
          <div className="space-y-3">
            {inProgress.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}

      {assigned.length > 0 && (
        <section className="mb-6">
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Assigned</h2>
          <div className="space-y-3">
            {assigned.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map(item => <EventCard key={item.event.id} item={item} onOpen={() => onOpen(item.event.id)} />)}
          </div>
        </section>
      )}
    </div>
  );
}
