import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Target, BookOpen, Zap, Award, ChevronRight, RotateCcw } from 'lucide-react';
import type { LearningEvent as LearningEventType, LearnerProgress, LearningMode, MCQuestion } from '../../types';
import { fairPrinciples, baselineQuestions, practiceScenario, summativeQuestions } from '../../data/fairContent';

interface Props {
  event: LearningEventType;
  progress: LearnerProgress;
  onProgress: (p: LearnerProgress) => void;
  onBack: () => void;
}

const MODES: LearningMode[] = ['Guided Reading', 'Case Studies', 'Worked Examples', 'Interactive Q&A', 'Knowledge Checks'];
const SESSION_LENGTHS = ['Under 15 minutes', '15–30 minutes', '30–60 minutes', '1 hour or more'];
const SESSION_COUNTS = ['1–2 sessions', '3–4 sessions', '5–6 sessions', '7 or more'];

const principleColor: Record<string, { badge: string; bg: string; bar: string }> = {
  F: { badge: 'bg-violet-50 text-violet-700 border-violet-200', bg: 'bg-violet-50 border-violet-200', bar: 'bg-violet-500' },
  A: { badge: 'bg-blue-50 text-blue-700 border-blue-200', bg: 'bg-blue-50 border-blue-200', bar: 'bg-blue-500' },
  I: { badge: 'bg-cyan-50 text-cyan-700 border-cyan-200', bg: 'bg-cyan-50 border-cyan-200', bar: 'bg-cyan-500' },
  R: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
};

// ── MCQ with feedback (formative / summative) ────────────────────────────────
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
          const isCorrect = i === question.correctIndex;
          const showResult = answered !== null;
          return (
            <button
              key={i}
              onClick={() => answered === null && onAnswer(i)}
              disabled={answered !== null}
              className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                !showResult
                  ? 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  : isCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : isSelected
                      ? 'border-red-300 bg-red-50 text-red-800'
                      : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  !showResult ? 'border-slate-300 text-slate-500'
                  : isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                  : isSelected ? 'border-red-400 bg-red-400 text-white'
                  : 'border-slate-200 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <div>
                  <p>{opt.text}</p>
                  {showResult && isSelected && (
                    <p className={`text-xs mt-2 leading-relaxed ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                      {opt.feedback}
                    </p>
                  )}
                  {showResult && !isSelected && isCorrect && (
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

// ── Baseline MCQ — no feedback, just records answer ─────────────────────────
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
                isSelected
                  ? 'border-teal-400 bg-teal-50 text-teal-900'
                  : answered !== null
                    ? 'border-slate-100 bg-slate-50 text-slate-400'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
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
function OverviewStage({ event, outcomes, onStart }: { event: LearningEventType; outcomes: string[]; onStart: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-teal-600 text-xs font-semibold uppercase tracking-widest mb-1">{event.capability.domain}</p>
        <h2 className="text-xl font-bold text-slate-900 mb-2">{event.capability.name}</h2>
        <p className="text-slate-600 text-sm leading-relaxed">{event.capability.description}</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-4 flex items-center gap-2">
          <Target size={14} className="text-teal-600" />
          What you'll be able to do
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

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <p className="text-blue-700 text-sm font-medium mb-1">How this works</p>
        <p className="text-blue-600 text-sm">You'll start with a short baseline assessment so the Tutor can personalise your learning path. From there, you'll work through content at your own pace. Your Tutor is always available at the bottom of the screen.</p>
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-900 font-bold text-lg">Baseline Assessment</h2>
          <span className="text-slate-500 text-sm">{current + 1} / {baselineQuestions.length}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4">These questions help the Tutor personalise your learning — just pick the answer that feels most right to you.</p>
        <div className="flex gap-1.5 mb-6">
          {baselineQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              answers[i] !== null ? 'bg-teal-500' : i === current ? 'bg-blue-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {q.principle && (
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-4 ${principleColor[q.principle].badge}`}>
            {q.principle === 'F' ? 'Findable' : q.principle === 'A' ? 'Accessible' : q.principle === 'I' ? 'Interoperable' : 'Reusable'}
          </span>
        )}
        <BaselineMCQ question={q} answered={answered ?? null} onAnswer={(ai) => onAnswer(current, ai)} />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Previous
        </button>
        {current < baselineQuestions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => c + 1)}
            disabled={answered === null}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allDone}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
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

  const toggleMode = (m: LearningMode) => setModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-slate-900 font-bold text-lg mb-1">Customise Your Learning</h2>
        <p className="text-slate-500 text-sm">Tell the Tutor how you'd like to learn. Your path will be adapted to these preferences.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm flex items-center gap-2"><BookOpen size={13} className="text-teal-600" /> Preferred Learning Modes</h3>
        <p className="text-slate-400 text-xs">Select all that suit you — your content will lean on these formats.</p>
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
          <label className="text-slate-500 text-xs font-medium mb-2 block">How long is a typical learning session for you?</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_LENGTHS.map(l => (
              <button key={l} onClick={() => setLength(l)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                length === l ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-slate-500 text-xs font-medium mb-2 block">How many sessions can you dedicate to this topic?</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_COUNTS.map(c => (
              <button key={c} onClick={() => setCount(c)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                count === c ? 'border-teal-300 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onConfirm(modes, length, count)}
        disabled={modes.length === 0}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        Start Learning <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ── Stage: Learning ──────────────────────────────────────────────────────────
function LearningStage({ section, showingFormative, formativeAnswer, onFormativeAnswer, onNext }: {
  section: number;
  showingFormative: boolean;
  formativeAnswer: number | null;
  onFormativeAnswer: (i: number) => void;
  onNext: () => void;
}) {
  const principle = fairPrinciples[section];
  const pc = principleColor[principle.id];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress pills */}
      <div className="flex items-center gap-2">
        {fairPrinciples.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            i < section ? `${principleColor[p.id].badge} opacity-60` :
            i === section ? principleColor[p.id].badge :
            'border-slate-200 text-slate-300 bg-white'
          }`}>
            {i < section && <CheckCircle2 size={10} />}
            {p.id} — {p.title}
          </div>
        ))}
      </div>

      {!showingFormative ? (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
            <div>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-3 ${pc.badge}`}>{principle.id} — {principle.title}</span>
              <p className="text-slate-900 text-xl font-semibold leading-snug mb-1">"{principle.tagline}"</p>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">{principle.concept}</p>
            <div className={`border rounded-lg p-4 ${pc.bg}`}>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-2">In your lab</p>
              <p className="text-slate-700 text-sm leading-relaxed">{principle.labExample}</p>
            </div>
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <p className="text-slate-700 text-sm font-medium">{principle.keyTakeaway}</p>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Check my understanding <ArrowRight size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${pc.badge}`}>{principle.id} — Check</span>
              <span className="text-slate-400 text-xs">Formative assessment</span>
            </div>
            <MCQCard
              question={principle.formativeQuestion}
              answered={formativeAnswer}
              onAnswer={onFormativeAnswer}
            />
          </div>

          {formativeAnswer !== null && (
            <button
              onClick={onNext}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              {section < fairPrinciples.length - 1 ? `Continue to ${fairPrinciples[section + 1].title}` : 'Move to Practice'} <ArrowRight size={14} />
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
    <div className="max-w-2xl mx-auto space-y-5">
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
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${principleColor[step.principle]?.badge ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{step.principle}</span>
          <span className="text-slate-400 text-xs">Step {practiceStep + 1} of {practiceScenario.steps.length}</span>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed">{step.scenario}</p>
        <MCQCard question={{ id: `p${practiceStep}`, stem: step.stem, options: step.options, correctIndex: step.correctIndex }} answered={answered} onAnswer={onAnswer} />
      </div>

      {answered !== null && (
        <button
          onClick={isLast ? onComplete : onNext}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
        >
          {isLast ? 'Take Final Assessment' : 'Next step'} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

// ── Stage: Summative ─────────────────────────────────────────────────────────
function SummativeStage({ answers, onAnswer, onComplete }: {
  answers: (number | null)[];
  onAnswer: (qi: number, ai: number) => void;
  onComplete: (score: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const q = summativeQuestions[current];
  const answered = answers[current];
  const allDone = answers.every(a => a !== null);
  const score = answers.filter((a, i) => a === summativeQuestions[i].correctIndex).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-slate-900 font-bold text-lg">Final Assessment</h2>
          <span className="text-slate-500 text-sm">{current + 1} / {summativeQuestions.length}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4">Apply what you've learned. These questions assess your independent use of FAIR principles in research scenarios.</p>
        <div className="flex gap-1.5 mb-6">
          {summativeQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              answers[i] !== null ? (answers[i] === summativeQuestions[i].correctIndex ? 'bg-emerald-500' : 'bg-red-400') :
              i === current ? 'bg-blue-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <MCQCard question={q} answered={answered ?? null} onAnswer={(ai) => onAnswer(current, ai)} />
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="flex items-center gap-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 text-sm">
          <ArrowLeft size={14} /> Previous
        </button>
        {current < summativeQuestions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={answered === null} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-sm font-semibold px-5 py-2 rounded-lg">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={() => onComplete(score)} disabled={!allDone} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            See my results <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stage: Complete ──────────────────────────────────────────────────────────
function CompleteStage({ score, total, outcomes, onBack }: {
  score: number;
  total: number;
  outcomes: string[];
  onBack: () => void;
}) {
  const pct = Math.round((score / total) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div>
        <div className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-400 flex items-center justify-center mx-auto mb-4">
          <Award size={36} className="text-teal-600" />
        </div>
        <h2 className="text-slate-900 font-bold text-2xl mb-1">Learning Complete</h2>
        <p className="text-slate-500 text-sm">You scored {score} out of {total} on your final assessment</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-600 text-sm font-medium">Final score</span>
          <span className="text-slate-900 font-bold">{pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 text-left shadow-sm">
        <h3 className="text-slate-900 font-semibold text-sm mb-3">Tutor Feedback</h3>
        {pct >= 75 && <p className="text-slate-700 text-sm leading-relaxed">Excellent work. You've demonstrated a strong, independent command of FAIR principles — including the nuances around restricted data, interoperability, and long-term reusability. You're well-placed to apply these consistently and to support colleagues in doing the same.</p>}
        {pct >= 50 && pct < 75 && <p className="text-slate-700 text-sm leading-relaxed">Good progress. You've built a solid working understanding of FAIR and can apply the principles in straightforward scenarios. Revisiting interoperability and long-term accessibility in practice will help consolidate your learning further.</p>}
        {pct < 50 && <p className="text-slate-700 text-sm leading-relaxed">You've been introduced to all four FAIR principles. The concepts take time to embed — revisiting the learning sections and the practice scenario will help reinforce what you've covered. Don't hesitate to ask your Tutor for a recap on any principle.</p>}
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

// ── Main component ───────────────────────────────────────────────────────────
export default function LearningEvent({ event, progress, onProgress, onBack }: Props) {
  const outcomes = event.outcomes.find(o => o.persona === 'L2')?.outcomes ?? event.outcomes[0]?.outcomes ?? [];

  const update = (partial: Partial<LearnerProgress>) => onProgress({ ...progress, ...partial });

  const handleBaselineAnswer = (qi: number, ai: number) => {
    const next = [...progress.baselineAnswers];
    next[qi] = ai;
    update({ baselineAnswers: next });
  };

  const handleBaselineComplete = () => {
    const score = progress.baselineAnswers.filter((a, i) => a === baselineQuestions[i].correctIndex).length;
    update({ stage: 'customise', baselineScore: score });
  };

  const handleFormativeAnswer = (i: number) => {
    update({ formativeAnswers: { ...progress.formativeAnswers, [progress.currentSection]: i } });
  };

  const handleLearningNext = () => {
    if (!progress.showingFormative) {
      update({ showingFormative: true });
    } else {
      if (progress.currentSection < fairPrinciples.length - 1) {
        update({ currentSection: progress.currentSection + 1, showingFormative: false });
      } else {
        update({ stage: 'practice' });
      }
    }
  };

  const handlePracticeAnswer = (ai: number) => {
    const next = [...progress.practiceAnswers];
    next[progress.practiceStep] = ai;
    update({ practiceAnswers: next });
  };

  const handleSummativeAnswer = (qi: number, ai: number) => {
    const next = [...progress.summativeAnswers];
    next[qi] = ai;
    update({ summativeAnswers: next });
  };

  return (
    <div className="pb-32">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-teal-600 text-xs font-semibold">{event.capability.domain}</p>
          <h1 className="text-slate-900 font-bold text-lg truncate">{event.capability.name}</h1>
        </div>
      </div>

      {progress.stage === 'overview' && (
        <OverviewStage event={event} outcomes={outcomes} onStart={() => update({ stage: 'baseline' })} />
      )}
      {progress.stage === 'baseline' && (
        <BaselineStage answers={progress.baselineAnswers} onAnswer={handleBaselineAnswer} onComplete={handleBaselineComplete} />
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
        <SummativeStage answers={progress.summativeAnswers} onAnswer={handleSummativeAnswer} onComplete={(score) => update({ stage: 'complete', summativeScore: score, completed: true })} />
      )}
      {progress.stage === 'complete' && (
        <CompleteStage score={progress.summativeScore} total={summativeQuestions.length} outcomes={outcomes} onBack={onBack} />
      )}
    </div>
  );
}
