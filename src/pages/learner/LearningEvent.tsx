import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Target, BookOpen, Zap, Award,
  RotateCcw, Clock, AlertCircle, Eye, ClipboardList, Settings2,
  FlaskConical, FileCheck, Play, Pause, Film, Lightbulb, MessagesSquare,
  Sparkles, ListChecks,
} from 'lucide-react';
import type { LearningEvent as LearningEventType, LearnerProgress, LearningMode, MCQuestion } from '../../types';
import { fairPrinciples, baselineQuestions, practiceScenario, summativeQuestions, getTutorResponse, type FairPrinciple } from '../../data/fairContent';
import TutorChat from '../../components/TutorChat';

interface Props {
  event: LearningEventType;
  progress: LearnerProgress;
  onProgress: (p: LearnerProgress) => void;
  onBack: () => void;
}

const MODES: LearningMode[] = ['Guided Reading', 'Case Studies', 'Worked Examples', 'Interactive Q&A with the Tutor', 'Video', 'Quizzes / Knowledge Checks'];
const SESSION_LENGTHS = ['Under 15 minutes', '15–30 minutes', '30–60 minutes', '1 hour or more'];
const SESSION_COUNTS = ['1–2 sessions', '3–4 sessions', '5–6 sessions', '7 or more'];
const PASS_THRESHOLD = 0.75; // 75%
const MAX_ATTEMPTS = 3;

// ── Stage metadata ───────────────────────────────────────────────────────────
const STAGES = [
  { id: 'overview',   label: 'Overview',    icon: Eye },
  { id: 'baseline',   label: 'Baseline',    icon: ClipboardList },
  { id: 'customise',  label: 'Personalise', icon: Settings2 },
  { id: 'learning',   label: 'Learn',       icon: BookOpen },
  { id: 'practice',   label: 'Practice',    icon: FlaskConical },
  { id: 'summative',  label: 'Assessment',  icon: FileCheck },
  { id: 'complete',   label: 'Complete',    icon: Award },
] as const;

// ── FAIR principle metadata ──────────────────────────────────────────────────
const PRINCIPLE_META = [
  { id: 'F', title: 'Findable',       minutes: 10, topics: ['Persistent identifiers', 'Rich metadata', 'Searchable registration'] },
  { id: 'A', title: 'Accessible',     minutes: 10, topics: ['Open protocols', 'Authentication & authorisation', 'Metadata persistence'] },
  { id: 'I', title: 'Interoperable',  minutes: 10, topics: ['Shared vocabularies', 'Linked data', 'Qualified references'] },
  { id: 'R', title: 'Reusable',       minutes: 10, topics: ['Provenance & context', 'Community standards', 'Clear licenses'] },
] as const;

const pc: Record<string, { badge: string; bg: string; bar: string }> = {
  F: { badge: 'bg-violet-50 text-violet-700 border-violet-200', bg: 'bg-violet-50 border-violet-200', bar: 'bg-violet-500' },
  A: { badge: 'bg-blue-50 text-blue-700 border-blue-200',   bg: 'bg-blue-50 border-blue-200',   bar: 'bg-blue-500'   },
  I: { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',   bg: 'bg-cyan-50 border-cyan-200',   bar: 'bg-cyan-500'   },
  R: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
};

// ── Stage progress bar ───────────────────────────────────────────────────────
function StageProgressBar({ current }: { current: string }) {
  const idx = STAGES.findIndex(s => s.id === current);
  return (
    <div className="flex items-center gap-0 mb-6">
      {STAGES.map((s, i) => {
        const done = i < idx;
        const active = s.id === current;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                done   ? 'bg-teal-600 border-teal-600 text-white' :
                active ? 'border-teal-500 bg-teal-50 text-teal-600' :
                         'border-slate-200 bg-white text-slate-300'
              }`}>
                {done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
              </div>
              <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                active ? 'text-teal-600' : done ? 'text-slate-500' : 'text-slate-300'
              }`}>{s.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < idx ? 'bg-teal-500' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── MCQ with feedback ────────────────────────────────────────────────────────
function MCQCard({ question, onAnswer, answered }: {
  question: MCQuestion;
  onAnswer: (index: number) => void;
  answered: number | null;
}) {
  return (
    <div className="space-y-3">
      <p className="text-slate-900 text-sm font-medium leading-relaxed">{question.stem}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = answered === i;
          const isCorrect  = i === question.correctIndex;
          const show       = answered !== null;
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                !show    ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700' :
                isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-800' :
                isSelected ? 'border-red-300 bg-red-50 text-red-800' :
                             'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  !show      ? 'border-slate-300 text-slate-500' :
                  isCorrect  ? 'border-emerald-500 bg-emerald-500 text-white' :
                  isSelected ? 'border-red-400 bg-red-400 text-white' :
                               'border-slate-200 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <div>
                  <p>{opt.text}</p>
                  {show && isSelected && (
                    <p className={`text-xs mt-2 leading-relaxed ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>{opt.feedback}</p>
                  )}
                  {show && !isSelected && isCorrect && (
                    <p className="text-xs mt-2 leading-relaxed text-emerald-700">{opt.feedback}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Baseline MCQ — no feedback ───────────────────────────────────────────────
function BaselineMCQ({ question, onAnswer, answered }: {
  question: MCQuestion;
  onAnswer: (index: number) => void;
  answered: number | null;
}) {
  return (
    <div className="space-y-3">
      <p className="text-slate-900 text-sm font-medium leading-relaxed">{question.stem}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = answered === i;
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                isSelected  ? 'border-teal-400 bg-teal-50 text-teal-900' :
                answered !== null ? 'border-slate-100 bg-slate-50 text-slate-400' :
                'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                  isSelected ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 text-slate-500'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <p>{opt.text}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Stage: Overview ──────────────────────────────────────────────────────────
function OverviewStage({ event, outcomes, onStart }: {
  event: LearningEventType; outcomes: string[]; onStart: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest mb-1">{event.capability.domain}</p>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{event.capability.name}</h2>
        <p className="text-slate-600 text-sm leading-relaxed">{event.capability.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-4 flex items-center gap-2">
          <Target size={14} className="text-teal-600" /> What you'll be able to do
        </h3>
        <div className="space-y-3">
          {outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-700 text-xs font-bold">{i + 1}</div>
              <p className="text-slate-700 text-sm leading-relaxed">{o}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journey overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-4 flex items-center gap-2">
          <Clock size={14} className="text-teal-600" /> Your learning journey — approx. 55 min
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Baseline assessment',  time: '~5 min',  desc: '4 diagnostic questions to personalise your path' },
            { label: 'Personalise',          time: '~2 min',  desc: 'Set your learning modes and time commitment' },
            { label: 'Learn — F, A, I, R',  time: '~40 min', desc: '4 principles, each with a concept card, lab example, and knowledge check' },
            { label: 'Practice scenario',    time: '~5 min',  desc: 'Apply FAIR to a real cytokine dataset submission' },
            { label: 'Final assessment',     time: '~5 min',  desc: '4 questions — pass at 75% or retry up to 3 times' },
          ].map(({ label, time, desc }) => (
            <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
              <span className="text-slate-400 text-xs w-14 flex-shrink-0 pt-0.5">{time}</span>
              <div>
                <p className="text-slate-800 text-sm font-medium">{label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onStart} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
        Begin Baseline Assessment <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ── Stage: Baseline ──────────────────────────────────────────────────────────
function BaselineStage({ answers, onAnswer, onComplete }: {
  answers: (number | null)[];
  onAnswer: (qi: number, ai: number) => void;
  onComplete: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const q = baselineQuestions[current];
  const answered = answers[current];
  const allDone = answers.every(a => a !== null);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-900 font-bold text-lg">Baseline Assessment</h2>
          <span className="text-slate-500 text-sm">{current + 1} / {baselineQuestions.length}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4">These questions help personalise your learning — just pick the answer that feels most right.</p>
        <div className="flex gap-1.5 mb-2">
          {baselineQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              answers[i] !== null ? 'bg-teal-500' : i === current ? 'bg-blue-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {q.principle && (
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-4 ${pc[q.principle].badge}`}>
            {q.principle === 'F' ? 'Findable' : q.principle === 'A' ? 'Accessible' : q.principle === 'I' ? 'Interoperable' : 'Reusable'}
          </span>
        )}
        <BaselineMCQ question={q} answered={answered ?? null} onAnswer={ai => onAnswer(current, ai)} />
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-sm transition-colors">
          <ArrowLeft size={14} /> Previous
        </button>
        {current < baselineQuestions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={answered === null}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={onComplete} disabled={!allDone}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            Personalise my learning <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stage: Customise ─────────────────────────────────────────────────────────
function CustomiseStage({ onConfirm }: {
  onConfirm: (modes: LearningMode[], length: string, count: string) => void;
}) {
  const [modes, setModes] = useState<LearningMode[]>(['Guided Reading', 'Case Studies']);
  const [length, setLength] = useState('15–30 minutes');
  const [count, setCount] = useState('3–4 sessions');
  const toggleMode = (m: LearningMode) => setModes(p => p.includes(m) ? p.filter(x => x !== m) : [...p, m]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-900 font-bold text-lg mb-1">Personalise Your Learning</h2>
        <p className="text-slate-500 text-sm">Tell the Tutor how you'd like to learn — your path adapts to these preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm flex items-center gap-2"><BookOpen size={13} className="text-teal-600" /> Preferred Learning Modes</h3>
        <p className="text-slate-400 text-xs">Select all that suit you.</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map(m => (
            <button key={m} onClick={() => toggleMode(m)} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              modes.includes(m) ? 'bg-teal-50 border-teal-300 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
            }`}>{m}</button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm flex items-center gap-2"><Zap size={13} className="text-teal-600" /> Time Commitment</h3>
        <div>
          <p className="text-slate-500 text-xs font-medium mb-2">How long is a typical learning session for you?</p>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_LENGTHS.map(l => (
              <button key={l} onClick={() => setLength(l)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                length === l ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-slate-500 text-xs font-medium mb-2">How many sessions can you dedicate to this topic?</p>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_COUNTS.map(c => (
              <button key={c} onClick={() => setCount(c)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                count === c ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={() => onConfirm(modes, length, count)} disabled={modes.length === 0}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
        Start Learning <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ── Learning format: Read ────────────────────────────────────────────────────
function ReadBlock({ principle, color }: { principle: FairPrinciple; color: typeof pc[string] }) {
  return (
    <div className="space-y-5">
      <p className="text-slate-700 text-sm leading-relaxed">{principle.concept}</p>
      <div className={`border rounded-lg p-4 ${color.bg}`}>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">In your lab</p>
        <p className="text-slate-700 text-sm leading-relaxed">{principle.labExample}</p>
      </div>
      <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <ArrowRight size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
        <p className="text-slate-700 text-sm font-medium">{principle.keyTakeaway}</p>
      </div>
    </div>
  );
}

// ── Learning format: Video (simulated) ───────────────────────────────────────
function VideoBlock({ principle, color }: { principle: FairPrinciple; color: typeof pc[string] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mm, ss] = principle.video.duration.split(':').map(Number);
  const totalSec = mm * 60 + ss;
  const activeChapter = Math.min(principle.video.chapters.length - 1, Math.floor((progress / 100) * principle.video.chapters.length));

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(false); return 100; }
          return p + 100 / (totalSec * 4); // ~ quarter-speed sim so it finishes in a few seconds
        });
      }, 100);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, totalSec]);

  const elapsed = Math.round((progress / 100) * totalSec);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Player */}
      <div className={`relative rounded-lg overflow-hidden border ${color.bg}`}>
        <div className="aspect-video flex items-center justify-center relative">
          {/* simulated frame */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Film size={56} className="text-slate-400" />
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="bg-black/60 text-white text-xs font-medium px-2 py-0.5 rounded">Simulated · prototype</span>
          </div>
          <button
            onClick={() => setPlaying(p => !p)}
            className="relative z-10 w-14 h-14 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all"
          >
            {playing ? <Pause size={22} className="text-slate-800" /> : <Play size={22} className="text-slate-800 ml-1" />}
          </button>
          {/* current chapter label */}
          <div className="absolute bottom-10 left-3 right-3">
            <p className="text-slate-700 text-sm font-semibold bg-white/80 inline-block px-2 py-1 rounded">{principle.video.chapters[activeChapter]}</p>
          </div>
        </div>
        {/* scrubber */}
        <div className="bg-white px-3 py-2.5 border-t border-slate-200">
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
            <div className={`h-full ${color.bar} rounded-full`} style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>{fmt(elapsed)}</span>
            <span>{principle.video.duration}</span>
          </div>
        </div>
      </div>

      {/* chapters */}
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">Chapters</p>
        <div className="space-y-1.5">
          {principle.video.chapters.map((c, i) => (
            <div key={c} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm transition-all ${
              i === activeChapter && progress > 0 ? `${color.bg} border` : 'border-slate-200 bg-white'
            }`}>
              <span className="text-slate-400 text-xs w-4">{i + 1}</span>
              {i < activeChapter || progress >= 100 ? <CheckCircle2 size={13} className="text-teal-500 flex-shrink-0" /> : <Play size={11} className="text-slate-400 flex-shrink-0" />}
              <span className={i === activeChapter && progress > 0 ? 'text-slate-800 font-medium' : 'text-slate-600'}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Learning format: Worked Example (progressive reveal) ─────────────────────
function WorkedExampleBlock({ principle, color }: { principle: FairPrinciple; color: typeof pc[string] }) {
  const { workedExample: we } = principle;
  const [revealed, setRevealed] = useState(0); // number of steps revealed
  const allRevealed = revealed >= we.steps.length;

  return (
    <div className="space-y-4">
      <h4 className="text-slate-900 font-semibold text-sm flex items-center gap-2"><Lightbulb size={14} className="text-amber-500" /> {we.title}</h4>

      {/* Before */}
      <div className="border border-red-200 bg-red-50 rounded-lg p-3">
        <p className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-1">Starting point</p>
        <p className="text-slate-700 text-sm font-mono leading-relaxed">{we.before}</p>
      </div>

      {/* Steps revealed progressively */}
      <div className="space-y-2">
        {we.steps.slice(0, revealed).map((s, i) => (
          <div key={i} className="flex items-start gap-3 border border-slate-200 bg-white rounded-lg p-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color.badge} border`}>{i + 1}</span>
            <div>
              <p className="text-slate-900 text-sm font-medium">{s.label}</p>
              <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {!allRevealed ? (
        <button onClick={() => setRevealed(r => r + 1)}
          className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          {revealed === 0 ? 'Walk me through it' : 'Reveal next step'} <ArrowRight size={13} />
        </button>
      ) : (
        <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-3">
          <p className="text-emerald-700 text-xs font-semibold uppercase tracking-wide mb-1">Result</p>
          <p className="text-slate-700 text-sm leading-relaxed">{we.after}</p>
        </div>
      )}
    </div>
  );
}

// ── Learning format: Case Study ──────────────────────────────────────────────
function CaseStudyBlock({ principle }: { principle: FairPrinciple }) {
  const { caseStudy: cs } = principle;
  const [showExpert, setShowExpert] = useState(false);

  return (
    <div className="space-y-4">
      <h4 className="text-slate-900 font-semibold text-sm flex items-center gap-2"><FlaskConical size={14} className="text-cyan-600" /> {cs.title}</h4>
      <p className="text-slate-700 text-sm leading-relaxed">{cs.narrative}</p>

      <div className="border-l-2 border-teal-400 bg-teal-50 rounded-r-lg p-3">
        <p className="text-teal-700 text-xs font-semibold uppercase tracking-wide mb-1">Your call</p>
        <p className="text-slate-800 text-sm font-medium">{cs.question}</p>
      </div>

      {!showExpert ? (
        <button onClick={() => setShowExpert(true)}
          className="w-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Eye size={13} /> Reveal the expert view
        </button>
      ) : (
        <div className="border border-slate-200 bg-white rounded-lg p-3">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">Expert view</p>
          <p className="text-slate-700 text-sm leading-relaxed">{cs.expertView}</p>
        </div>
      )}
    </div>
  );
}

// ── Learning format: Interactive Q&A ─────────────────────────────────────────
function QABlock({ principle }: { principle: FairPrinciple }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const ask = (q: string) => {
    if (answers[q]) return;
    setAnswers(prev => ({ ...prev, [q]: '...' }));
    setTimeout(() => setAnswers(prev => ({ ...prev, [q]: getTutorResponse(q) })), 500);
  };

  return (
    <div className="space-y-3">
      <p className="text-slate-600 text-sm flex items-center gap-2"><MessagesSquare size={14} className="text-teal-600" /> Tap a question to ask your Tutor — or type your own in the box below.</p>
      <div className="space-y-2">
        {principle.qaPrompts.map(q => (
          <div key={q}>
            <button
              onClick={() => ask(q)}
              disabled={!!answers[q]}
              className="w-full text-left px-3 py-2.5 rounded-lg border border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50 disabled:hover:bg-white disabled:hover:border-slate-200 text-slate-700 text-sm transition-all flex items-center gap-2"
            >
              <MessagesSquare size={13} className="text-teal-500 flex-shrink-0" />
              {q}
            </button>
            {answers[q] && (
              <div className="flex gap-2 mt-2 ml-3">
                <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={10} className="text-white" />
                </div>
                <div className="bg-slate-100 text-slate-700 text-xs leading-relaxed px-3 py-2 rounded-xl rounded-tl-sm">
                  {answers[q] === '...'
                    ? <span className="flex gap-1 items-center py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    : answers[q]}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stage: Learning ──────────────────────────────────────────────────────────
type FormatId = 'read' | 'video' | 'worked' | 'case' | 'qa';

interface FormatAccent { ring: string; tint: string; iconWrap: string; text: string }

const FORMAT_FOR_MODE: { mode: LearningMode; id: FormatId; label: string; desc: string; icon: typeof Eye; accent: FormatAccent }[] = [
  { mode: 'Guided Reading',                 id: 'read',   label: 'Read',           desc: 'Concept, lab example & key takeaway', icon: BookOpen,       accent: { ring: 'ring-blue-400 border-blue-300',   tint: 'bg-blue-50',   iconWrap: 'bg-blue-100 text-blue-600',     text: 'text-blue-700' } },
  { mode: 'Video',                          id: 'video',  label: 'Watch',          desc: 'A short guided video walkthrough',    icon: Film,           accent: { ring: 'ring-rose-400 border-rose-300',   tint: 'bg-rose-50',   iconWrap: 'bg-rose-100 text-rose-600',     text: 'text-rose-700' } },
  { mode: 'Worked Examples',                id: 'worked', label: 'Worked Example', desc: 'Step by step, problem to fix',        icon: Lightbulb,      accent: { ring: 'ring-amber-400 border-amber-300', tint: 'bg-amber-50',  iconWrap: 'bg-amber-100 text-amber-600',   text: 'text-amber-700' } },
  { mode: 'Case Studies',                   id: 'case',   label: 'Case Study',     desc: 'Decide what you’d do for real',       icon: FlaskConical,   accent: { ring: 'ring-cyan-400 border-cyan-300',   tint: 'bg-cyan-50',   iconWrap: 'bg-cyan-100 text-cyan-600',     text: 'text-cyan-700' } },
  { mode: 'Interactive Q&A with the Tutor', id: 'qa',     label: 'Ask the Tutor',  desc: 'Get your questions answered live',    icon: MessagesSquare, accent: { ring: 'ring-teal-400 border-teal-300',   tint: 'bg-teal-50',   iconWrap: 'bg-teal-100 text-teal-600',     text: 'text-teal-700' } },
];

function LearningStage({ section, showingFormative, formativeAnswer, onFormativeAnswer, onNext, completedSections, modes }: {
  section: number;
  showingFormative: boolean;
  formativeAnswer: number | null;
  onFormativeAnswer: (i: number) => void;
  onNext: () => void;
  completedSections: number;
  modes: LearningMode[];
}) {
  const principle = fairPrinciples[section];
  const color = pc[principle.id];
  const meta = PRINCIPLE_META[section];

  // Which formats are available — always include Read, then any selected mode.
  const formats = FORMAT_FOR_MODE.filter(f => f.id === 'read' || modes.includes(f.mode));
  // No default winner — learner chooses how to engage. Single format auto-opens.
  const [active, setActive] = useState<FormatId | null>(formats.length === 1 ? 'read' : null);
  const [viewed, setViewed] = useState<Set<FormatId>>(new Set());
  // Reset when we move to a new principle section.
  useEffect(() => {
    setActive(formats.length === 1 ? 'read' : null);
    setViewed(new Set());
  }, [section]);

  const open = (id: FormatId) => {
    setActive(id);
    setViewed(prev => new Set(prev).add(id));
  };

  const totalMinutes = PRINCIPLE_META.reduce((s, p) => s + p.minutes, 0);
  const doneMinutes = PRINCIPLE_META.slice(0, completedSections).reduce((s, p) => s + p.minutes, 0);

  return (
    <div className="space-y-5">
      {/* Topic outline strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-700 text-xs font-semibold uppercase tracking-wide">Learning Path</span>
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Clock size={11} /> {doneMinutes}/{totalMinutes} min
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {PRINCIPLE_META.map((p, i) => {
            const done    = i < completedSections;
            const current = i === section;
            return (
              <div key={p.id} className={`rounded-lg border p-2.5 transition-all ${
                done    ? 'border-teal-200 bg-teal-50' :
                current ? pc[p.id].bg + ' border' :
                          'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${pc[p.id].badge}`}>{p.id}</span>
                  {done && <CheckCircle2 size={12} className="text-teal-500" />}
                  {current && !done && <div className={`w-2 h-2 rounded-full ${pc[p.id].bar} animate-pulse`} />}
                </div>
                <p className={`text-xs font-medium ${done ? 'text-teal-700' : current ? 'text-slate-800' : 'text-slate-400'}`}>{p.title}</p>
                <p className="text-slate-400 text-xs">{p.minutes} min</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(completedSections / PRINCIPLE_META.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {!showingFormative ? (
        <>
          {/* Principle header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-3 ${color.badge}`}>{principle.id} — {principle.title}</span>
            <p className="text-slate-900 text-xl font-semibold leading-snug mb-4">"{principle.tagline}"</p>
            <div className="flex gap-2 flex-wrap">
              {meta.topics.map(t => (
                <span key={t} className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{t}</span>
              ))}
            </div>
          </div>

          {/* Equal-weight format chooser — every selected mode is a first-class entry point */}
          {formats.length > 1 && (
            <div>
              <p className="text-slate-700 text-sm font-semibold mb-1">Choose how you’d like to learn this</p>
              <p className="text-slate-400 text-xs mb-3">Try as many formats as you like — they all cover the same principle.</p>
              <div className="grid grid-cols-2 gap-2.5">
                {formats.map(f => {
                  const Icon = f.icon;
                  const on = active === f.id;
                  const done = viewed.has(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => open(f.id)}
                      className={`relative text-left rounded-xl border p-3.5 transition-all ${
                        on
                          ? `${f.accent.tint} ${f.accent.ring} ring-2 shadow-sm`
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {done && !on && (
                        <CheckCircle2 size={15} className="absolute top-2.5 right-2.5 text-teal-500" />
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${f.accent.iconWrap}`}>
                          <Icon size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold ${on ? f.accent.text : 'text-slate-800'}`}>{f.label}</p>
                          <p className="text-slate-400 text-xs leading-snug">{f.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active format content */}
          {active ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              {active === 'read'   && <ReadBlock principle={principle} color={color} />}
              {active === 'video'  && <VideoBlock principle={principle} color={color} />}
              {active === 'worked' && <WorkedExampleBlock principle={principle} color={color} />}
              {active === 'case'   && <CaseStudyBlock principle={principle} />}
              {active === 'qa'     && <QABlock principle={principle} />}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-400 text-sm">Pick a format above to start learning <span className="font-semibold text-slate-500">{principle.title}</span>.</p>
            </div>
          )}

          <button onClick={onNext}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            <ListChecks size={14} /> Check my understanding <ArrowRight size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color.badge}`}>{principle.id} — Knowledge Check</span>
            </div>
            <MCQCard question={principle.formativeQuestion} answered={formativeAnswer} onAnswer={onFormativeAnswer} />
          </div>

          {formativeAnswer !== null && (
            <button onClick={onNext}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
              {section < fairPrinciples.length - 1 ? `Continue to ${PRINCIPLE_META[section + 1].title}` : 'Move to Practice'} <ArrowRight size={14} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ── Stage: Practice ──────────────────────────────────────────────────────────
function PracticeStage({ practiceStep, practiceAnswers, onAnswer, onNext, onComplete }: {
  practiceStep: number;
  practiceAnswers: (number | null)[];
  onAnswer: (i: number) => void;
  onNext: () => void;
  onComplete: () => void;
}) {
  const step = practiceScenario.steps[practiceStep];
  const answered = practiceAnswers[practiceStep] ?? null;
  const isLast = practiceStep === practiceScenario.steps.length - 1;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-slate-900 font-bold text-lg mb-1">Practice Scenario</h2>
        <p className="text-slate-500 text-sm mb-4">{practiceScenario.setup}</p>
        <div className="flex gap-1.5">
          {practiceScenario.steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < practiceStep ? 'bg-teal-500' : i === practiceStep ? 'bg-blue-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pc[step.principle]?.badge ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{step.principle}</span>
          <span className="text-slate-400 text-xs">Step {practiceStep + 1} of {practiceScenario.steps.length}</span>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{step.scenario}</p>
        <MCQCard
          question={{ id: `p${practiceStep}`, stem: step.stem, options: step.options, correctIndex: step.correctIndex }}
          answered={answered}
          onAnswer={onAnswer}
        />
      </div>

      {answered !== null && (
        <button onClick={isLast ? onComplete : onNext}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
          {isLast ? 'Take Final Assessment' : 'Next step'} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ── Stage: Summative ─────────────────────────────────────────────────────────
function SummativeStage({ answers, attempts, onAnswer, onSubmit, onRetake }: {
  answers: (number | null)[];
  attempts: number;
  onAnswer: (qi: number, ai: number) => void;
  onSubmit: (score: number) => void;
  onRetake: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const q = summativeQuestions[current];
  const answered = answers[current];
  const allDone = answers.every(a => a !== null);
  const score = answers.filter((a, i) => a === summativeQuestions[i].correctIndex).length;
  const pct = Math.round((score / summativeQuestions.length) * 100);
  const passed = pct >= PASS_THRESHOLD * 100;
  const attemptsLeft = MAX_ATTEMPTS - attempts - 1;

  if (submitted) {
    return (
      <div className="space-y-5">
        <h2 className="text-slate-900 font-bold text-lg">Assessment Result</h2>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${passed ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-amber-50 border-2 border-amber-400'}`}>
            {passed ? <CheckCircle2 size={28} className="text-emerald-600" /> : <AlertCircle size={28} className="text-amber-600" />}
          </div>
          <div>
            <p className={`text-2xl font-bold ${passed ? 'text-emerald-700' : 'text-amber-700'}`}>{pct}%</p>
            <p className="text-slate-500 text-sm">{score} out of {summativeQuestions.length} correct</p>
            <p className={`text-sm font-semibold mt-1 ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
              {passed ? 'Passed — well done!' : `Not yet — ${Math.ceil(PASS_THRESHOLD * summativeQuestions.length)} correct answers needed to pass`}
            </p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mx-8">
            <div className={`h-full rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
          </div>
          {/* Pass threshold marker */}
          <p className="text-slate-400 text-xs">Pass threshold: {Math.round(PASS_THRESHOLD * 100)}%</p>
        </div>

        {/* Per-question review */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <p className="text-slate-700 text-sm font-semibold mb-2">Question review</p>
          {summativeQuestions.map((sq, i) => {
            const correct = answers[i] === sq.correctIndex;
            return (
              <div key={sq.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                {correct
                  ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                }
                <p className="text-slate-600 text-xs leading-relaxed">{sq.stem}</p>
              </div>
            );
          })}
        </div>

        {passed ? (
          <button onClick={() => onSubmit(score)}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
            View completion <ArrowRight size={15} />
          </button>
        ) : attempts < MAX_ATTEMPTS - 1 ? (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-700 text-sm">You have <strong>{attemptsLeft} attempt{attemptsLeft > 1 ? 's' : ''}</strong> remaining. Review the questions above and try again.</p>
            </div>
            <button onClick={onRetake}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
              <RotateCcw size={15} /> Retake Assessment
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="text-slate-600 text-sm">You've used all {MAX_ATTEMPTS} attempts. Speak with your manager or revisit the learning sections before trying again.</p>
            </div>
            <button onClick={() => onSubmit(score)}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm">
              View summary <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-slate-900 font-bold text-lg">Final Assessment</h2>
          <div className="flex items-center gap-3">
            {attempts > 0 && <span className="text-amber-600 text-xs font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">Attempt {attempts + 1} of {MAX_ATTEMPTS}</span>}
            <span className="text-slate-500 text-sm">{current + 1} / {summativeQuestions.length}</span>
          </div>
        </div>
        <p className="text-slate-500 text-sm mb-4">Apply what you've learned. Pass at {Math.round(PASS_THRESHOLD * 100)}% or above.</p>
        <div className="flex gap-1.5 mb-6">
          {summativeQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              answers[i] !== null ? (answers[i] === summativeQuestions[i].correctIndex ? 'bg-emerald-500' : 'bg-red-400')
              : i === current ? 'bg-blue-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <MCQCard question={q} answered={answered ?? null} onAnswer={ai => onAnswer(current, ai)} />
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-sm">
          <ArrowLeft size={14} /> Previous
        </button>
        {current < summativeQuestions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={answered === null}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={() => setSubmitted(true)} disabled={!allDone}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Submit answers <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stage: Complete ──────────────────────────────────────────────────────────
function CompleteStage({ score, total, outcomes, onBack }: {
  score: number; total: number; outcomes: string[]; onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= PASS_THRESHOLD * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-teal-50 border-2 border-teal-400' : 'bg-slate-100 border-2 border-slate-300'}`}>
          <Award size={36} className={passed ? 'text-teal-600' : 'text-slate-500'} />
        </div>
        <h2 className="text-slate-900 font-bold text-2xl mb-1">Learning Complete</h2>
        <p className="text-slate-500 text-sm">Final score: {score}/{total} — {pct}%</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className={`h-full rounded-full transition-all ${passed ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
        </div>
        <p className={`text-sm font-semibold ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
          {passed ? 'Passed' : 'Not passed'} · threshold {Math.round(PASS_THRESHOLD * 100)}%
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-3">Tutor Feedback</h3>
        {pct >= 75 && <p className="text-slate-700 text-sm leading-relaxed">Excellent work. You've demonstrated a strong, independent command of FAIR principles and are well-placed to apply them consistently and support colleagues.</p>}
        {pct >= 50 && pct < 75 && <p className="text-slate-700 text-sm leading-relaxed">Good progress. You have a working understanding of FAIR. Revisiting interoperability and long-term accessibility in practice will help consolidate further.</p>}
        {pct < 50 && <p className="text-slate-700 text-sm leading-relaxed">You've been introduced to all four FAIR principles. Revisiting the learning sections and practice scenario will help — don't hesitate to ask your Tutor for a recap on any principle.</p>}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-4 flex items-center gap-2">
          <Target size={13} className="text-teal-600" /> What this means day-to-day
        </h3>
        <div className="space-y-3">
          {outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 size={14} className="text-teal-500 mt-0.5 flex-shrink-0" />
              <p className="text-slate-700 text-sm">{o}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm transition-colors mx-auto">
        <RotateCcw size={13} /> Back to My Learning
      </button>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function LearningEvent({ event, progress, onProgress, onBack }: Props) {
  const outcomes = event.outcomes.find(o => o.persona === 'L2')?.outcomes ?? event.outcomes[0]?.outcomes ?? [];
  const update = (partial: Partial<LearnerProgress>) => onProgress({ ...progress, ...partial });

  const handleBaselineAnswer = (qi: number, ai: number) => {
    const next = [...progress.baselineAnswers]; next[qi] = ai;
    update({ baselineAnswers: next });
  };

  const handleFormativeAnswer = (i: number) => {
    update({ formativeAnswers: { ...progress.formativeAnswers, [progress.currentSection]: i } });
  };

  const handleLearningNext = () => {
    if (!progress.showingFormative) {
      update({ showingFormative: true });
    } else {
      const nextSection = progress.currentSection + 1;
      if (nextSection < fairPrinciples.length) {
        update({ currentSection: nextSection, showingFormative: false });
      } else {
        update({ stage: 'practice' });
      }
    }
  };

  const handlePracticeAnswer = (ai: number) => {
    const next = [...progress.practiceAnswers]; next[progress.practiceStep] = ai;
    update({ practiceAnswers: next });
  };

  const handleSummativeAnswer = (qi: number, ai: number) => {
    const next = [...progress.summativeAnswers]; next[qi] = ai;
    update({ summativeAnswers: next });
  };

  const handleSummativeSubmit = (score: number) => {
    const passed = score / summativeQuestions.length >= PASS_THRESHOLD;
    update({ stage: 'complete', summativeScore: score, summativeAttempts: progress.summativeAttempts + 1, completed: passed });
  };

  const handleRetake = () => {
    update({
      summativeAnswers: Array(summativeQuestions.length).fill(null),
      summativeAttempts: progress.summativeAttempts + 1,
    });
  };

  const tutorContext = `stage:${progress.stage} section:${progress.currentSection}`;

  // ── Layout: split content / chat ─────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {/* Back + stage progress */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-teal-600 text-xs font-semibold">{event.capability.domain}</p>
            <h1 className="text-slate-900 font-bold text-base truncate">{event.capability.name}</h1>
          </div>
        </div>

        <StageProgressBar current={progress.stage} />

        <div className="max-w-2xl mx-auto">
          {progress.stage === 'overview' && (
            <OverviewStage event={event} outcomes={outcomes} onStart={() => update({ stage: 'baseline' })} />
          )}
          {progress.stage === 'baseline' && (
            <BaselineStage
              answers={progress.baselineAnswers}
              onAnswer={handleBaselineAnswer}
              onComplete={() => {
                const score = progress.baselineAnswers.filter((a, i) => a === baselineQuestions[i].correctIndex).length;
                update({ stage: 'customise', baselineScore: score });
              }}
            />
          )}
          {progress.stage === 'customise' && (
            <CustomiseStage onConfirm={(m, l, c) => update({ stage: 'learning', learningModes: m, sessionLength: l, sessionsAvailable: c })} />
          )}
          {progress.stage === 'learning' && (
            <LearningStage
              section={progress.currentSection}
              showingFormative={progress.showingFormative}
              formativeAnswer={progress.formativeAnswers[progress.currentSection] ?? null}
              onFormativeAnswer={handleFormativeAnswer}
              onNext={handleLearningNext}
              completedSections={progress.currentSection}
              modes={progress.learningModes}
            />
          )}
          {progress.stage === 'practice' && (
            <PracticeStage
              practiceStep={progress.practiceStep}
              practiceAnswers={progress.practiceAnswers}
              onAnswer={handlePracticeAnswer}
              onNext={() => update({ practiceStep: progress.practiceStep + 1 })}
              onComplete={() => update({ stage: 'summative' })}
            />
          )}
          {progress.stage === 'summative' && (
            <SummativeStage
              answers={progress.summativeAnswers}
              attempts={progress.summativeAttempts}
              onAnswer={handleSummativeAnswer}
              onSubmit={handleSummativeSubmit}
              onRetake={handleRetake}
            />
          )}
          {progress.stage === 'complete' && (
            <CompleteStage score={progress.summativeScore} total={summativeQuestions.length} outcomes={outcomes} onBack={onBack} />
          )}
        </div>
      </div>

      {/* Always-visible Tutor input bar */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white">
        <TutorChat contextHint={tutorContext} />
      </div>
    </div>
  );
}
