import { useState } from 'react';
import type { LearningEvent, LearnerProgress } from './types';
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
    proficiencyLevel: null,
    targetLevel: null,
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
  { eventId: mockEvents[2]?.id, status: 'completed' as const, completedDate: '10 Jun 2026', proficiency: 'Competent' },
].filter(e => e.eventId);

export default function App() {
  const [view, setView] = useState<View>('admin');

  // ── Admin state ──
  const [adminPage, setAdminPage] = useState<AdminPage>('dashboard');
  const [events, setEvents] = useState<LearningEvent[]>(mockEvents);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // ── Learner state ──
  const [learnerPage, setLearnerPage] = useState<LearnerPage>('dashboard');
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, LearnerProgress>>({});

  // Admin handlers
  const handleOpenEvent = (id: string) => { setSelectedEventId(id); setAdminPage('detail'); };
  const handleComplete = (data: Omit<LearningEvent, 'id' | 'createdAt' | 'status' | 'assignedCount'> & { assignedCount?: number }) => {
    const newEvent: LearningEvent = { ...data, id: `evt-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), status: 'Active', assignedCount: data.assignedCount ?? 0 };
    setEvents(prev => [newEvent, ...prev]);
    setAdminPage('dashboard');
  };

  // Learner handlers
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
    return { event: ev, status: resolvedStatus, progress: le.progress, dueDate: le.dueDate, completedDate: le.completedDate, proficiency: le.proficiency };
  }).filter(Boolean) as { event: LearningEvent; status: 'assigned' | 'in-progress' | 'completed'; progress?: number; dueDate?: string; completedDate?: string; proficiency?: string }[];

  const tutorContext = learnerPage === 'event' && activeEvent
    ? `The learner is currently in the ${activeProgress?.stage ?? 'overview'} stage of FAIR data principles.`
    : undefined;

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar — switches based on view */}
      {view === 'admin' ? (
        <Sidebar currentPage={adminPage === 'create' ? 'create' : 'dashboard'} onNavigate={(p) => setAdminPage(p)} />
      ) : (
        <LearnerSidebar currentPage={learnerPage} onNavigate={() => setLearnerPage('dashboard')} />
      )}

      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-8 py-3.5 flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-300 font-semibold">Tutor</span>
            <span className="text-slate-700">/</span>
            {view === 'admin' ? (
              <>
                <span className="text-slate-300 font-semibold">Admin</span>
                {adminPage === 'create' && <><span className="text-slate-700">/</span><span className="text-blue-400 font-semibold">New Event</span></>}
                {adminPage === 'detail' && selectedAdminEvent && <><span className="text-slate-700">/</span><span className="text-slate-300 font-semibold truncate max-w-xs">{selectedAdminEvent.title}</span></>}
              </>
            ) : (
              <>
                <span className="text-teal-400 font-semibold">Learner</span>
                {learnerPage === 'event' && activeEvent && <><span className="text-slate-700">/</span><span className="text-slate-300 font-semibold truncate max-w-xs">{activeEvent.capability.name}</span></>}
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* Admin / Learner toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setView('admin')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => setView('learner')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  view === 'learner' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Learner
              </button>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              AI Active
            </div>
          </div>
        </header>

        {/* Page content */}
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
              {learnerPage === 'dashboard' && (
                <LearnerDashboard events={learnerEventItems} onOpen={handleOpenLearnerEvent} />
              )}
              {learnerPage === 'event' && activeEvent && activeProgress && (
                <LearningEvent
                  event={activeEvent}
                  progress={activeProgress}
                  onProgress={handleUpdateProgress}
                  onBack={() => setLearnerPage('dashboard')}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Tutor chat — only in learner view */}
      {view === 'learner' && <TutorChat contextHint={tutorContext} />}
    </div>
  );
}
