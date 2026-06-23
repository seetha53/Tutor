import { BookOpen, CheckCircle2, GraduationCap } from 'lucide-react';

interface LearnerSidebarProps {
  currentPage: 'dashboard' | 'event';
  onNavigate: (page: 'dashboard') => void;
}

export default function LearnerSidebar({ currentPage, onNavigate }: LearnerSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 flex flex-col z-20 border-r border-slate-800">
      <div className="px-6 pt-7 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">TUTOR</div>
            <div className="text-teal-400 text-xs font-medium">My Learning</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-5 space-y-0.5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Learning</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentPage === 'dashboard'
              ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen size={16} />
          My Events
        </button>
        {currentPage === 'event' && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/50 text-teal-300 text-sm font-medium border border-slate-700">
            <CheckCircle2 size={16} />
            In Progress
          </div>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AL
          </div>
          <div className="min-w-0">
            <div className="text-slate-300 text-xs font-semibold truncate">Alex Lin</div>
            <div className="text-slate-500 text-xs truncate">Scientist · Immunology</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
