import { useState } from 'react';
import type { LearningEvent as LearningEventType, LearnerProgress } from './types';
import { mockEvents } from './data/mockData';
import { baselineQuestions, summativeQuestions } from './data/fairContent';

// Admin
import Sidebar from './components/Sidebar';
import Dashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import EventDetail from './pages/admin/EventDetail';

// Learner
import LearnerSidebar from './components/LearnerSidebar';
import LearnerDashboard from './pages/learner/LearnerDashboard';
import LearningEvent from './pages/learner/LearningEvent';
import TutorChat from './components/TutorChat';

type View = 'admin' | 'learner';
type AdminPage = 'dashboard' | 'create' | 'detail';
type LearnerPage = 'dashboard' | 'event';

function makeProgress(eventId: string): LearnerProgress {
  return {
    eventId,
    stage: 'overview',
    currentSection: 0,
    showingFormative: false,
    baselineAnswers: Array(baselineQuestions.length).fill(null),
    baselineScore: 0,
    learningModes: [],
    sessionLength: '',
    sessionsAvailable: '',
    formativeAnswers: {},
    practiceStep: 0,
    practiceAnswers: [],
    summativeAnswers: Array(summativeQuestions.length).fill(null),
    summativeScore: 0,
    completed: false,
  };
}

const LEARNER_EVENTS = [
  { eventId: mockEvents[0]?.id, status: 'in-progress' as const, progress: 35, dueDate: '15 Jul 2026' },
  { eventId: mockEvents[1]?.id, status: 'assigned' as const, dueDate: '30 Jul 2026' },
  { eventId: mockEvents[2]?.id, status: 'completed' as const, completedDate: '10 Jun 2026' },
].filter(e => e.eventId);

export default function App() {
  const [view, setView] = useState<View>('admin');

  // ── Admin state ──
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [events, setEvents] = useState<LearningEventType[]>(mockEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // ── Learner state ──
  const [learnerPage, setLearnerPage] = useState<LearnerPage>('dashboard');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, LearnerProgress>>({});

  const handleOpenEvent = (id: string) => { setSelectedEventId(id); setAdminPage('detail'); };
  const handleComplete = (data: Omit<LearningEventType, 'id' | 'createdAt' | 'status' | 'assignedCount'> & { assignedCount?: number }) => {
    const newEvent: LearningEventType = { ...data, id: `evt-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), status: 'Active', assignedCount: data.assignedCount ?? 0 };
    setEvents(prev => [newEvent, ...prev]);
    setAdminPage('dashboard');
  };

  const handleOpenLearnerEvent = (id: string) => {
    setActiveEventId(id);
    if (!progressMap[id]) setProgressMap(prev => ({ ...prev, [id]: makeProgress(id) }));
    setLearnerPage('event');
  };
  const handleUpdateProgress = (p: LearnerProgress) => setProgressMap(prev => ({ ...prev, [p.eventId]: p }));

  const selectedAdminEvent = events.find(e => e.id === selectedEventId);
  const activeEvent = events.find(e => e.id === activeEventId);
  const activeProgress = activeEventId ? (progressMap[activeEventId] ?? makeProgress(activeEventId)) : null;

  const learnerEventItems = LEARNER_EVENTS.map(le => {
    const ev = events.find(e => e.id === le.eventId);
    if (!ev) return null;
    const prog = progressMap[le.eventId!];
    const resolvedStatus = prog?.completed ? 'completed' : prog && prog.stage !== 'overview' ? 'in-progress' : le.status;
    return { event: ev, status: resolvedStatus, progress: le.progress, dueDate: le.dueDate, completedDate: le.completedDate };
  }).filter(Boolean) as { event: LearningEventType; status: 'assigned' | 'in-progress' | 'completed'; progress?: number; dueDate?: string; completedDate?: string }[];

  const tutorContext = learnerPage === 'event' && activeEvent
    ? `The learner is currently in the ${activeProgress?.stage ?? 'overview'} stage of FAIR data principles.`
    : undefined;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {view === 'admin' ? (
        <Sidebar currentPage={adminPage === 'create' ? 'create' : 'dashboard'} onNavigate={(p) => setAdminPage(p)} />
      ) : (
        <LearnerSidebar currentPage={learnerPage} onNavigate={() => setLearnerPage('dashboard')} />
      )}

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-3.5 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-slate-700 font-semibold">Tutor</span>
            <span className="text-slate-300">/</span>
            {view === 'admin' ? (
              <>
                <span className="text-slate-700 font-semibold">Admin</span>
                {adminPage === 'create' && <><span className="text-slate-300">/</span><span className="text-blue-600 font-semibold">New Event</span></>}
                {adminPage === 'detail' && selectedAdminEvent && <><span className="text-slate-300">/</span><span className="text-slate-700 font-semibold truncate max-w-xs">{selectedAdminEvent.title}</span></>}
              </>
            ) : (
              <>
                <span className="text-teal-600 font-semibold">Learner</span>
                {learnerPage === 'event' && activeEvent && <><span className="text-slate-300">/</span><span className="text-slate-700 font-semibold truncate max-w-xs">{activeEvent.capability.name}</span></>}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setView('learner')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === 'learner' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Learner
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Active
            </div>
          </div>
        </header>

        <div className="flex-1 px-8 py-8">
          {view === 'admin' && (
            <>
              {adminPage === 'dashboard' && <Dashboard events={events} onCreateNew={() => setAdminPage('create')} onOpenEvent={handleOpenEvent} />}
              {adminPage === 'create' && <CreateEvent onCancel={() => setAdminPage('dashboard')} onComplete={handleComplete} />}
              {adminPage === 'detail' && selectedAdminEvent && <EventDetail event={selectedAdminEvent} onBack={() => setAdminPage('dashboard')} />}
            </>
          )}

          {view === 'learner' && (
            <>
              {learnerPage === 'dashboard' && <LearnerDashboard events={learnerEventItems} onOpen={handleOpenLearnerEvent} />}
              {learnerPage === 'event' && activeEvent && activeProgress && (
                <LearningEvent event={activeEvent} progress={activeProgress} onProgress={handleUpdateProgress} onBack={() => setLearnerPage('dashboard')} />
              )}
            </>
          )}
        </div>
      </main>

      {view === 'learner' && <TutorChat contextHint={tutorContext} />}
    </div>
  );
}
