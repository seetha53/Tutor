import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Target, BookOpen, Zap, Award, ChevronRight, RotateCcw } from 'lucide-react';
import type { LearningEvent as LearningEventType, LearnerProgress, ProficiencyLevel, LearningMode, MCQuestion } from '../../types';
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
const LEVELS: ProficiencyLevel[] = ['Beginner', 'Competent', 'Expert'];

const proficiencyColor: Record<ProficiencyLevel, string> = {
  Beginner: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  Competent: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  Expert: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
};

const principleColor: Record<string, string> = {
  F: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  A: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  I: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  R: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
};

function computeProficiency(score: number): ProficiencyLevel {
  if (score <= 1) return 'Beginner';
  if (score <= 3) return 'Competent';
  return 'Expert';
}

// ── MCQ component ───────────────────────────────────────────────────────────
function MCQCard({ question, onAnswer, answered }: {
  question: MCQuestion;
  onAnswer: (index: number) => void;
  answered: number | null;
}) {
  return (
    <div className="space-y-4">
      <p className="text-white text-sm font-medium leading-relaxed">{question.stem}</p>
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
                  ? 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 text-slate-300'
                  : isCorrect
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : isSelected
                      ? 'border-red-500/50 bg-red-500/10 text-red-300'
                      : 'border-slate-800 bg-slate-900 text-slate-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${
                  !showResult ? 'border-slate-600 text-slate-500'
                  : isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                  : isSelected ? 'border-red-500 bg-red-500 text-white'
                  : 'border-slate-700 text-slate-600'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <div>
                  <p>{opt.text}</p>
                  {showResult && isSelected && (
                    <p className={`text-xs mt-2 leading-relaxed ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {opt.feedback}
                    </p>
                  )}
                  {showResult && !isSelected && isCorrect && (
                    <p className="text-xs mt-2 leading-relaxed text-emerald-400">{opt.feedback}</p>
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

// ── Stage: Overview ──────────────────────────────────────────────────────────
function OverviewStage({ event, outcomes, onStart }: { event: LearningEventType; outcomes: string[]; onStart: () => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-teal-400 text-xs font-semibold uppercase tracking-widest mb-1">{event.capability.domain}</p>
        <h2 className="text-xl font-bold text-white mb-2">{event.capability.name}</h2>
        <p className="text-slate-400 text-sm leading-relaxed">{event.capability.description}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Target size={14} className="text-teal-400" />
          What you'll be able to do
        </h3>
        <div className="space-y-3">
          {outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-teal-600/20 border border-teal-600/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-teal-400 text-xs font-bold">{i + 1}</div>
              <p className="text-slate-300 text-sm leading-relaxed">{o}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
        <p className="text-blue-300 text-sm font-medium mb-1">How this works</p>
        <p className="text-slate-400 text-sm">You'll start with a short baseline assessment so the Tutor can understand where you are. From there, you'll customise your learning path and work through the content at your own pace. Your Tutor is always available at the bottom of the screen.</p>
      </div>

      <button onClick={onStart} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
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
          <h2 className="text-white font-bold text-lg">Baseline Assessment</h2>
          <span className="text-slate-400 text-sm">{current + 1} / {baselineQuestions.length}</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">These questions help the Tutor understand your starting point — there are no wrong answers that affect your learning, just a starting point.</p>
        <div className="flex gap-1.5 mb-6">
          {baselineQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < current ? 'bg-teal-500' : i === current ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        {q.principle && (
          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-4 ${principleColor[q.principle]}`}>
            {q.principle === 'F' ? 'Findable' : q.principle === 'A' ? 'Accessible' : q.principle === 'I' ? 'Interoperable' : 'Reusable'}
          </span>
        )}
        <MCQCard
          question={q}
          answered={answered ?? null}
          onAnswer={(ai) => onAnswer(current, ai)}
        />
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Previous
        </button>
        {current < baselineQuestions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => c + 1)}
            disabled={answered === null}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={onComplete}
            disabled={!allDone}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            See my result <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stage: Proficiency Result ────────────────────────────────────────────────
function ProficiencyStage({ level, score, onContinue }: { level: ProficiencyLevel; score: number; onContinue: () => void }) {
  const messages: Record<ProficiencyLevel, string> = {
    Beginner: 'You\'re at the start of your FAIR journey — which is a great place to be. The Tutor will build your understanding from the ground up with concrete examples from your lab context.',
    Competent: 'You have a working understanding of FAIR principles. Your learning path will focus on deepening your application skills and filling in specific gaps the assessment revealed.',
    Expert: 'You already have a strong grasp of FAIR. Your learning will focus on nuanced application, edge cases, and leading others — you may move through foundational content quickly.',
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div>
        <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-teal-500 flex items-center justify-center mx-auto mb-4">
          <Award size={32} className="text-teal-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-1">Your Starting Point</h2>
        <p className="text-slate-400 text-sm">Based on {score} out of {baselineQuestions.length} correct</p>
      </div>

      <div className={`inline-flex items-center gap-2 text-lg font-bold px-5 py-2.5 rounded-full border ${proficiencyColor[level]}`}>
        {level}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-left">
        <p className="text-slate-300 text-sm leading-relaxed">{messages[level]}</p>
      </div>

      <button onClick={onContinue} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
        Customise My Learning Path <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ── Stage: Customise ─────────────────────────────────────────────────────────
function CustomiseStage({ currentLevel, onConfirm }: {
  currentLevel: ProficiencyLevel;
  onConfirm: (target: ProficiencyLevel, modes: LearningMode[], length: string, count: string) => void;
}) {
  const [target, setTarget] = useState<ProficiencyLevel>(currentLevel === 'Expert' ? 'Expert' : LEVELS[LEVELS.indexOf(currentLevel) + 1] ?? 'Expert');
  const [modes, setModes] = useState<LearningMode[]>(['Guided Reading', 'Case Studies']);
  const [length, setLength] = useState('15–30 minutes');
  const [count, setCount] = useState('3–4 sessions');

  const toggleMode = (m: LearningMode) => setModes(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Customise Your Learning</h2>
        <p className="text-slate-400 text-sm">Tell the Tutor how you'd like to learn. Your path will be adapted to these preferences.</p>
      </div>

      {/* Target proficiency */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Target size={13} className="text-teal-400" /> Target Proficiency</h3>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setTarget(l)} className={`py-2.5 rounded-lg border text-sm font-semibold transition-all ${
              target === l ? proficiencyColor[l] : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}>{l}</button>
          ))}
        </div>
      </div>

      {/* Learning modes */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><BookOpen size={13} className="text-teal-400" /> Preferred Learning Modes</h3>
        <p className="text-slate-500 text-xs">Select all that suit you — your content will lean on these formats.</p>
        <div className="flex flex-wrap gap-2">
          {MODES.map(m => (
            <button key={m} onClick={() => toggleMode(m)} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              modes.includes(m) ? 'bg-teal-600/20 border-teal-500/50 text-teal-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Time commitment */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2"><Zap size={13} className="text-teal-400" /> Time Commitment</h3>
        <div>
          <label className="text-slate-400 text-xs font-medium mb-2 block">How long is a typical learning session for you?</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_LENGTHS.map(l => (
              <button key={l} onClick={() => setLength(l)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                length === l ? 'border-teal-500/50 bg-teal-500/10 text-teal-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-slate-400 text-xs font-medium mb-2 block">How many sessions can you dedicate to this topic?</label>
          <div className="grid grid-cols-2 gap-2">
            {SESSION_COUNTS.map(c => (
              <button key={c} onClick={() => setCount(c)} className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all text-left ${
                count === c ? 'border-teal-500/50 bg-teal-500/10 text-teal-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}>{c}</button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onConfirm(target, modes, length, count)}
        disabled={modes.length === 0}
        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
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

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Progress pills */}
      <div className="flex items-center gap-2">
        {fairPrinciples.map((p, i) => (
          <div key={p.id} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
            i < section ? 'border-teal-500/50 bg-teal-500/10 text-teal-300' :
            i === section ? `border ${principleColor[p.id]}` :
            'border-slate-700 text-slate-600'
          }`}>
            {i < section && <CheckCircle2 size={10} />}
            {p.id} — {p.title}
          </div>
        ))}
      </div>

      {!showingFormative ? (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div>
              <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mb-3 ${principleColor[principle.id]}`}>{principle.id} — {principle.title}</span>
              <p className="text-slate-300 text-2xl font-semibold leading-snug mb-1">"{principle.tagline}"</p>
            </div>

            <div>
              <p className="text-slate-300 text-sm leading-relaxed">{principle.concept}</p>
            </div>

            <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/40">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">In your lab</p>
              <p className="text-slate-300 text-sm leading-relaxed">{principle.labExample}</p>
            </div>

            <div className={`border rounded-lg p-3 flex items-start gap-2 ${principleColor[principle.id].replace('text-', 'border-').split(' ')[0]} bg-opacity-10`}>
              <ChevronRight size={13} className="mt-0.5 flex-shrink-0 text-slate-400" />
              <p className="text-slate-300 text-sm font-medium">{principle.keyTakeaway}</p>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            Check my understanding <ArrowRight size={14} />
          </button>
        </>
      ) : (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${principleColor[principle.id]}`}>{principle.id} — Check</span>
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
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
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
        <h2 className="text-white font-bold text-lg mb-1">Practice Scenario</h2>
        <p className="text-slate-400 text-sm mb-4">{practiceScenario.setup}</p>
        <div className="flex gap-1.5">
          {practiceScenario.steps.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              i < practiceStep ? 'bg-teal-500' : i === practiceStep ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${principleColor[step.principle]}`}>{step.principle}</span>
          <span className="text-slate-400 text-xs">Step {practiceStep + 1} of {practiceScenario.steps.length}</span>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{step.scenario}</p>
        <MCQCard question={{ id: `p${practiceStep}`, stem: step.stem, options: step.options, correctIndex: step.correctIndex }} answered={answered} onAnswer={onAnswer} />
      </div>

      {answered !== null && (
        <button
          onClick={isLast ? onComplete : onNext}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
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
          <h2 className="text-white font-bold text-lg">Final Assessment</h2>
          <span className="text-slate-400 text-sm">{current + 1} / {summativeQuestions.length}</span>
        </div>
        <p className="text-slate-400 text-sm mb-4">Apply what you've learned. These questions assess independent use of FAIR principles in research scenarios.</p>
        <div className="flex gap-1.5 mb-6">
          {summativeQuestions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${
              answers[i] !== null ? (answers[i] === summativeQuestions[i].correctIndex ? 'bg-emerald-500' : 'bg-red-500') :
              i === current ? 'bg-blue-500' : 'bg-slate-700'
            }`} />
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <MCQCard question={q} answered={answered ?? null} onAnswer={(ai) => onAnswer(current, ai)} />
      </div>

      <div className="flex justify-between">
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 text-sm">
          <ArrowLeft size={14} /> Previous
        </button>
        {current < summativeQuestions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} disabled={answered === null} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button onClick={() => onComplete(score)} disabled={!allDone} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded-lg">
            See my results <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Stage: Complete ──────────────────────────────────────────────────────────
function CompleteStage({ score, total, proficiency, outcomes, onBack }: {
  score: number;
  total: number;
  proficiency: ProficiencyLevel;
  outcomes: string[];
  onBack: () => void;
}) {
  const finalLevel: ProficiencyLevel = score >= total * 0.75 ? 'Expert' : score >= total * 0.5 ? 'Competent' : 'Beginner';

  return (
    <div className="max-w-xl mx-auto space-y-6 text-center">
      <div>
        <div className="w-20 h-20 rounded-full bg-teal-600/20 border-2 border-teal-500 flex items-center justify-center mx-auto mb-4">
          <Award size={36} className="text-teal-400" />
        </div>
        <h2 className="text-white font-bold text-2xl mb-1">Learning Complete</h2>
        <p className="text-slate-400 text-sm">You scored {score} out of {total} on your final assessment</p>
      </div>

      <div className={`inline-flex items-center gap-2 text-lg font-bold px-5 py-2.5 rounded-full border ${proficiencyColor[finalLevel]}`}>
        {finalLevel} — Proficiency Achieved
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-4">
        <h3 className="text-white font-semibold text-sm">Tutor Feedback</h3>
        {finalLevel === 'Expert' && (
          <p className="text-slate-300 text-sm leading-relaxed">Excellent work. You've demonstrated a strong, independent command of FAIR principles — including the nuances around restricted data, interoperability, and long-term reusability. You're well-placed to apply these consistently and to support colleagues in doing the same.</p>
        )}
        {finalLevel === 'Competent' && (
          <p className="text-slate-300 text-sm leading-relaxed">Good progress. You've built a solid working understanding of FAIR and can apply the principles in straightforward scenarios. Revisiting interoperability and long-term accessibility in practice will help consolidate your learning further.</p>
        )}
        {finalLevel === 'Beginner' && (
          <p className="text-slate-300 text-sm leading-relaxed">You've made a good start and have been introduced to all four FAIR principles. The concepts take time to embed — revisiting the learning sections and the practice scenario will help reinforce what you've covered. Don't hesitate to ask your Tutor for a recap on any principle.</p>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left">
        <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
          <Target size={13} className="text-teal-400" /> What this means day-to-day
        </h3>
        <div className="space-y-3">
          {outcomes.map((o, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 size={14} className="text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-slate-300 text-sm">{o}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors mx-auto">
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
    const level = computeProficiency(score);
    update({ stage: 'proficiency', baselineScore: score, proficiencyLevel: level });
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

  const handlePracticeNext = () => update({ practiceStep: progress.practiceStep + 1 });

  const handleSummativeAnswer = (qi: number, ai: number) => {
    const next = [...progress.summativeAnswers];
    next[qi] = ai;
    update({ summativeAnswers: next });
  };

  const handleSummativeComplete = (score: number) => {
    update({ stage: 'complete', summativeScore: score, completed: true });
  };

  return (
    <div className="pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-teal-400 text-xs font-semibold">{event.capability.domain}</p>
          <h1 className="text-white font-bold text-lg truncate">{event.capability.name}</h1>
        </div>
        {progress.proficiencyLevel && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${proficiencyColor[progress.proficiencyLevel]}`}>
            {progress.proficiencyLevel}
          </span>
        )}
      </div>

      {progress.stage === 'overview' && (
        <OverviewStage event={event} outcomes={outcomes} onStart={() => update({ stage: 'baseline' })} />
      )}
      {progress.stage === 'baseline' && (
        <BaselineStage answers={progress.baselineAnswers} onAnswer={handleBaselineAnswer} onComplete={handleBaselineComplete} />
      )}
      {progress.stage === 'proficiency' && progress.proficiencyLevel && (
        <ProficiencyStage level={progress.proficiencyLevel} score={progress.baselineScore} onContinue={() => update({ stage: 'customise' })} />
      )}
      {progress.stage === 'customise' && progress.proficiencyLevel && (
        <CustomiseStage currentLevel={progress.proficiencyLevel} onConfirm={(t, m, l, c) => update({ stage: 'learning', targetLevel: t, learningModes: m, sessionLength: l, sessionsAvailable: c })} />
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
          onNext={handlePracticeNext}
          onComplete={() => update({ stage: 'summative' })}
        />
      )}
      {progress.stage === 'summative' && (
        <SummativeStage answers={progress.summativeAnswers} onAnswer={handleSummativeAnswer} onComplete={handleSummativeComplete} />
      )}
      {progress.stage === 'complete' && (
        <CompleteStage score={progress.summativeScore} total={summativeQuestions.length} proficiency={progress.proficiencyLevel ?? 'Beginner'} outcomes={outcomes} onBack={onBack} />
      )}
    </div>
  );
}
