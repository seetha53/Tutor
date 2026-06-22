import { LayoutDashboard, Plus, BookOpen, Settings, Users, GraduationCap } from 'lucide-react';

type AdminPage = 'dashboard' | 'create';

interface SidebarProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as AdminPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create' as AdminPage, label: 'New Learning Event', icon: Plus },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 flex flex-col z-20 border-r border-slate-800">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">TUTOR</div>
            <div className="text-blue-400 text-xs font-medium">Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-5 space-y-0.5">
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Learning Events</p>
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          );
        })}

        <div className="pt-5">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest px-3 mb-2">Resources</p>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <BookOpen size={16} />
            Capability Catalog
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <Users size={16} />
            Teams & Personas
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-all">
          <Settings size={16} />
          Settings
        </button>
        <div className="flex items-center gap-3 px-3 pt-2">
          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            MP
          </div>
          <div className="min-w-0">
            <div className="text-slate-300 text-xs font-semibold truncate">Maya Patel</div>
            <div className="text-slate-500 text-xs truncate">Programme Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
