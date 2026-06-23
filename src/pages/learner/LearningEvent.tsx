import { useState } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Target, BookOpen, Zap, Award,
  RotateCcw, Clock, AlertCircle, Eye, ClipboardList, Settings2,
  FlaskConical, FileCheck,
} from 'lucide-react';
import type { LearningEvent as LearningEventType, LearnerProgress, LearningMode, MCQuestion } from '../../types';
import { fairPrinciples, baselineQuestions, practiceScenario, summativeQuestions } from '../../data/fairContent';
import TutorChat from '../../components/TutorChat';

interface Props {
  event: LearningEventType;
  progress: LearnerProgress;
  onProgress: (p: LearnerProgress) => void;
  onBack: () => void;
}

const MODES: LearningMode[] = ['Guided Reading', 'Case Studies', 'Worked Examples', 'Interactive Q&A', 'Knowledge Checks'];
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

// ── Stage: Learning ──────────────────────────────────────────────────────────
function LearningStage({ section, showingFormative, formativeAnswer, onFormativeAnswer, onNext, completedSections }: {
  section: number;
  showingFormative: boolean;
  formativeAnswer: number | null;
  onFormativeAnswer: (i: number) => void;
  onNext: () => void;
  completedSections: number;
}) {
  const principle = fairPrinciples[section];
  const color = pc[principle.id];
  const meta = PRINCIPLE_META[section];

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
        {/* Overall progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${(completedSections / PRINCIPLE_META.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {!showingFormative ? (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
            <div>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-3 ${color.badge}`}>{principle.id} — {principle.title}</span>
              <p className="text-slate-900 text-xl font-semibold leading-snug">"{principle.tagline}"</p>
            </div>

            {/* Sub-topics */}
            <div className="flex gap-2 flex-wrap">
              {meta.topics.map(t => (
                <span key={t} className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{t}</span>
              ))}
            </div>

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

          <button onClick={onNext}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
            Check my understanding <ArrowRight size={14} />
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
              completedSections={progress.currentSection + (progress.showingFormative && progress.formativeAnswers[progress.currentSection] !== undefined ? 0 : 0)}
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

      {/* Always-visible chat panel */}
      <div className="flex-shrink-0 border-t border-slate-200 bg-white" style={{ height: '260px' }}>
        <TutorChat contextHint={tutorContext} />
      </div>
    </div>
  );
}
