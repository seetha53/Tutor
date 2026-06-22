import { useState } from 'react';
import type { LearningEvent } from './types';
import { mockEvents } from './data/mockData';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import EventDetail from './pages/admin/EventDetail';

type AdminPage = 'dashboard' | 'create' | 'detail';

export default function App() {
  const [page, setPage] = useState<AdminPage>('dashboard');
  const [events, setEvents] = useState<LearningEvent[]>(mockEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleOpenEvent = (id: string) => {
    setSelectedEventId(id);
    setPage('detail');
  };

  const handleComplete = (data: Omit<LearningEvent, 'id' | 'createdAt' | 'status' | 'assignedCount'> & { assignedCount?: number }) => {
    const newEvent: LearningEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'Active',
      assignedCount: data.assignedCount ?? 0,
    };
    setEvents(prev => [newEvent, ...prev]);
    setPage('dashboard');
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        currentPage={page === 'create' ? 'create' : 'dashboard'}
        onNavigate={(p) => setPage(p)}
      />

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-8 py-3.5 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-300 font-semibold">Tutor</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-300 font-semibold">Admin</span>
            {page === 'create' && <><span className="text-slate-700">/</span><span className="text-blue-400 font-semibold">New Event</span></>}
            {page === 'detail' && selectedEvent && (
              <><span className="text-slate-700">/</span><span className="text-slate-300 font-semibold truncate max-w-xs">{selectedEvent.title}</span></>
            )}
          </nav>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI Active
          </div>
        </header>

        <div className="flex-1 px-8 py-8">
          {page === 'dashboard' && (
            <Dashboard
              events={events}
              onCreateNew={() => setPage('create')}
              onOpenEvent={handleOpenEvent}
            />
          )}
          {page === 'create' && (
            <CreateEvent
              onCancel={() => setPage('dashboard')}
              onComplete={handleComplete}
            />
          )}
          {page === 'detail' && selectedEvent && (
            <EventDetail
              event={selectedEvent}
              onBack={() => setPage('dashboard')}
            />
          )}
        </div>
      </main>
    </div>
  );
}
