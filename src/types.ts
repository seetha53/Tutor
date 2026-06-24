export type Persona = 'L1' | 'L2' | 'L3' | 'L4';
export type EventStatus = 'Draft' | 'Active' | 'Completed';
export type LearningMode = 'Guided Reading' | 'Case Studies' | 'Worked Examples' | 'Interactive Q&A with the Tutor' | 'Video' | 'Quizzes / Knowledge Checks';
export type LearnerStage = 'overview' | 'baseline' | 'customise' | 'learning' | 'practice' | 'summative' | 'complete';

export interface Capability {
  id: string;
  name: string;
  domain: string;
  description: string;
  tags: string[];
  isCustom?: boolean;
}

export interface LearningOutcome {
  persona: Persona;
  outcomes: string[];
}

export interface LearningEvent {
  id: string;
  title: string;
  capability: Capability;
  context: string;
  selectedPersonas: Persona[];
  teamName: string;
  outcomes: LearningOutcome[];
  status: EventStatus;
  createdAt: string;
  assignedCount: number;
}

export type WizardStep = 'capability' | 'context' | 'personas' | 'generate' | 'assign';

export interface MCQOption {
  text: string;
  feedback: string;
}

export interface MCQuestion {
  id: string;
  stem: string;
  options: MCQOption[];
  correctIndex: number;
  principle?: string;
}

export interface LearnerProgress {
  eventId: string;
  stage: LearnerStage;
  currentSection: number;
  showingFormative: boolean;
  baselineAnswers: (number | null)[];
  baselineScore: number;
  sessionPacing: 'single' | 'chunked';
  formativeAnswers: Record<number, number | null>;
  practiceStep: number;
  practiceAnswers: (number | null)[];
  summativeAnswers: (number | null)[];
  summativeScore: number;
  summativeAttempts: number;
  completed: boolean;
}
