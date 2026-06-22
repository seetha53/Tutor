import type { Capability, LearningEvent } from '../types';

export const capabilityCatalog: Capability[] = [
  {
    id: 'cap-001',
    name: 'FAIR Data Principles',
    domain: 'Data Management',
    description: 'Understanding and applying Findable, Accessible, Interoperable, and Reusable data principles in scientific research workflows.',
    tags: ['FAIR', 'Data Governance', 'GoFAIR', 'Research Data'],
  },
  {
    id: 'cap-002',
    name: 'GLP Compliance & Documentation',
    domain: 'Regulatory',
    description: 'Good Laboratory Practice standards including study plan preparation, raw data recording, and audit trail management.',
    tags: ['GLP', 'Compliance', 'Documentation', 'Regulatory'],
  },
  {
    id: 'cap-003',
    name: 'Assay Development & Validation',
    domain: 'Laboratory Science',
    description: 'Designing, developing, and validating analytical and biological assays in accordance with ICH guidelines.',
    tags: ['Assay', 'Validation', 'ICH', 'Bioanalytical'],
  },
  {
    id: 'cap-004',
    name: 'Electronic Lab Notebook (ELN) Usage',
    domain: 'Digital Tools',
    description: 'Effective use of ELN systems for experiment documentation, data capture, and cross-functional collaboration.',
    tags: ['ELN', 'Digital Tools', 'Documentation', 'Collaboration'],
  },
  {
    id: 'cap-005',
    name: 'Statistical Analysis for Life Sciences',
    domain: 'Data Science',
    description: 'Applying appropriate statistical methods for experimental design, data analysis, and result interpretation in biological research.',
    tags: ['Statistics', 'R', 'Data Analysis', 'Experimental Design'],
  },
  {
    id: 'cap-006',
    name: 'Immunoassay Techniques',
    domain: 'Laboratory Science',
    description: 'Principles and practice of ELISA, Western blot, flow cytometry, and multiplex immunoassays.',
    tags: ['Immunology', 'ELISA', 'Flow Cytometry', 'Biomarkers'],
  },
  {
    id: 'cap-007',
    name: 'Clinical Data Management',
    domain: 'Clinical Operations',
    description: 'Data collection, validation, query management, and database lock procedures in clinical trial settings.',
    tags: ['CDM', 'Clinical Trials', 'EDC', 'CDASH'],
  },
  {
    id: 'cap-008',
    name: 'Scientific Writing & Reporting',
    domain: 'Communication',
    description: 'Producing clear, structured scientific documents including study reports, protocols, manuscripts, and regulatory submissions.',
    tags: ['Writing', 'Reports', 'Protocols', 'Communication'],
  },
];

export const mockEvents: LearningEvent[] = [
  {
    id: 'evt-001',
    title: 'FAIR Data Principles — Immunology Team',
    capability: capabilityCatalog[0],
    context: 'The Immunology team is transitioning to a new data repository. Several datasets from recent biomarker studies have been flagged as non-FAIR compliant during audit. We need to build consistent data practices before the Q3 submission.',
    selectedPersonas: ['L1', 'L2', 'L3'],
    teamName: 'Immunology',
    outcomes: [
      { persona: 'L1', outcomes: ['Identify the four FAIR principles and explain their purpose', 'Apply FAIR metadata standards when saving experimental data in the ELN', 'Recognise common data practices that violate FAIR principles'] },
      { persona: 'L2', outcomes: ['Evaluate existing datasets for FAIR compliance and document gaps', 'Design data collection workflows that embed FAIR principles by default', 'Collaborate with data stewards to resolve FAIR compliance issues'] },
      { persona: 'L3', outcomes: ['Lead FAIR implementation strategy for the team\'s data assets', 'Define team-level metadata standards aligned with GoFAIR and domain ontologies', 'Audit and approve data management plans for new studies'] },
    ],
    status: 'Active',
    createdAt: '2025-06-10',
    assignedCount: 14,
  },
  {
    id: 'evt-002',
    title: 'GLP Documentation Standards — Regulatory Affairs',
    capability: capabilityCatalog[1],
    context: 'Preparation for upcoming FDA inspection. Recent internal audit identified gaps in raw data attribution and study plan amendments.',
    selectedPersonas: ['L2', 'L3', 'L4'],
    teamName: 'Regulatory Affairs',
    outcomes: [],
    status: 'Completed',
    createdAt: '2025-04-15',
    assignedCount: 8,
  },
  {
    id: 'evt-003',
    title: 'ELN Onboarding — New Joiners Cohort',
    capability: capabilityCatalog[3],
    context: 'Q2 new joiner cohort across multiple teams. Baseline ELN proficiency is low. Need to bring everyone to operational proficiency within 4 weeks.',
    selectedPersonas: ['L1'],
    teamName: 'Cross-functional',
    outcomes: [],
    status: 'Draft',
    createdAt: '2025-06-18',
    assignedCount: 0,
  },
];

export const teams = [
  'Immunology', 'Oncology', 'Neuroscience', 'Regulatory Affairs',
  'Clinical Operations', 'Bioanalytical', 'Data Science', 'Cross-functional',
];

export const groups = [
  'Biomarker Science', 'Flow Cytometry', 'In Vivo Studies', 'Translational Research',
  'GLP Operations', 'Medical Writing', 'Statistics & Programming', 'New Joiners Cohort',
  'Team Leads', 'Early Discovery',
];

export function generateOutcomes(
  capability: Capability,
  _context: string,
  personas: string[]
): { persona: string; outcomes: string[] }[] {
  const templates: Record<string, Record<string, string[]>> = {
    'L1': {
      default: [
        `Describe the core principles of ${capability.name} and their relevance to daily work`,
        `Apply standard ${capability.domain} procedures correctly in supervised settings`,
        `Identify when to escalate issues related to ${capability.name} to senior colleagues`,
        `Complete required documentation for ${capability.name} tasks accurately`,
      ],
    },
    'L2': {
      default: [
        `Apply ${capability.name} principles independently across routine and non-routine scenarios`,
        `Analyse data and outputs for ${capability.name} quality and flag deviations`,
        `Contribute to team-level ${capability.domain} improvement initiatives`,
        `Mentor L1 colleagues on ${capability.name} procedures and best practices`,
      ],
    },
    'L3': {
      default: [
        `Design and lead ${capability.name} implementation strategies for the team`,
        `Evaluate ${capability.domain} workflows and recommend process improvements`,
        `Represent the team in cross-functional ${capability.name} discussions`,
        `Define quality standards and acceptance criteria for ${capability.name} deliverables`,
      ],
    },
    'L4': {
      default: [
        `Set organisational strategy and policy for ${capability.name} across programmes`,
        `Drive ${capability.domain} innovation and evaluate emerging approaches`,
        `Sponsor and oversee ${capability.name} capability building initiatives`,
        `Act as subject matter expert for regulatory, audit, and partnership engagements`,
      ],
    },
  };

  return personas.map((p) => ({
    persona: p,
    outcomes: templates[p]?.default ?? [],
  }));
}
