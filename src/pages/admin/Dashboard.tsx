import React from 'react';
import { Plus, ChevronRight, Users, Calendar, CheckCircle2, Clock, FileEdit, Zap } from 'lucide-react';
import type { LearningEvent } from '../../types';

interface DashboardProps {
  events: LearningEvent[];
  onCreateNew: () => void;
  onOpenEvent: (id: string) => void;
}

const statusConfig = {
  Active: { label: 'Active', dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border border-emerald-400/20' },
  Completed: { label: 'Completed', dot: 'bg-blue-400', text: 'text-blue-400', bg: 'bg-blue-400/10 border border-blue-400/20' },
  Draft: { label: 'Draft', dot: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-400/10 border border-slate-400/20' },
};

const personaColors: Record<string, string> = {
  L1: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
  L2: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  L3: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  L4: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
};

export default function Dashboard({ events, onCreateNew, onOpenEvent }: DashboardProps) {
  const active = events.filter(e => e.status === 'Active').length;
  const draft = events.filter(e => e.status === 'Draft').length;
  const completed = events.filter(e => e.status === 'Completed').length;
  const totalAssigned = events.reduce((s, e) => s + e.assignedCount, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Learning Events</h1>
          <p className="text-slate-400 text-sm">Manage and track all capability-based learning events</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-900/30"
        >
          <Plus size={15} />
          New Learning Event
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length, icon: Zap, color: 'text-blue-400' },
          { label: 'Active', value: active, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Drafts', value: draft, icon: FileEdit, color: 'text-slate-400' },
          { label: 'Learners Assigned', value: totalAssigned, icon: Users, color: 'text-violet-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4">
            <div className={`${color} mb-2`}><Icon size={18} /></div>
            <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
            <div className="text-slate-500 text-xs font-medium">{label}</div>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Plus size={20} className="text-slate-500" />
            </div>
            <p className="text-slate-400 text-sm mb-3">No learning events yet</p>
            <button onClick={onCreateNew} className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
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
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 text-left transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="text-slate-500 text-xs">{event.capability.domain}</span>
                    </div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-blue-300 transition-colors">{event.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-1 mb-3">{event.context}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
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
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
