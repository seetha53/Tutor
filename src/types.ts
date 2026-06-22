export type Persona = 'L1' | 'L2' | 'L3' | 'L4';

export type EventStatus = 'Draft' | 'Active' | 'Completed';

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
