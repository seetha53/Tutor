import type { MCQuestion, MCQOption } from '../types';

export interface WorkedStep {
  label: string;
  detail: string;
}

export interface FairPrinciple {
  id: 'F' | 'A' | 'I' | 'R';
  title: string;
  tagline: string;
  concept: string;
  labExample: string;
  keyTakeaway: string;
  formativeQuestion: MCQuestion;
  video: { duration: string; chapters: string[] };
  workedExample: { title: string; before: string; steps: WorkedStep[]; after: string };
  caseStudy: { title: string; narrative: string; question: string; expertView: string };
  qaPrompts: string[];
}

export const fairPrinciples: FairPrinciple[] = [
  {
    id: 'F',
    title: 'Findable',
    tagline: 'If your data can\'t be found, it can\'t be used.',
    concept: 'Data is findable when it has a unique persistent identifier (like a DOI or accession number), is described by rich metadata, and is registered in a searchable resource. The identifier is the stable address — it still works even if the underlying file moves servers.',
    labExample: 'You run a cytokine multiplex assay on PBMC samples from 20 donors. You store the results in your ELN — but without a project code, assay type, or timepoint metadata. Six months later, a colleague doing a meta-analysis cannot locate your dataset. The data exists but is effectively invisible.',
    keyTakeaway: 'Findability = persistent identifier + rich metadata + searchable registration.',
    video: {
      duration: '4:30',
      chapters: ['What makes data findable', 'Persistent identifiers explained', 'Writing rich metadata', 'Registering in a searchable repository'],
    },
    workedExample: {
      title: 'Turning an invisible dataset findable',
      before: 'cytokine_results_final_v3.xlsx — saved in a shared ELN folder, no identifier, no description.',
      steps: [
        { label: 'Mint an identifier', detail: 'Submit to the institutional repository, which issues a DOI: 10.5281/zenodo.84021.' },
        { label: 'Add rich metadata', detail: 'Record assay = Luminex multiplex, analytes = 12 cytokines, species = human, sample = PBMC, timepoints = 0/24/48h.' },
        { label: 'Register it', detail: 'Publish the record so the metadata is indexed and searchable by anyone.' },
      ],
      after: 'A colleague searching "human PBMC cytokine multiplex" now finds your dataset by its DOI in seconds.',
    },
    caseStudy: {
      title: 'The meta-analysis that couldn\'t find you',
      narrative: 'A consortium is pooling cytokine datasets across five labs. Yours is the most complete — but it lives in an ELN folder named "JuneRun_final", with no repository record.',
      question: 'The consortium lead emails asking for "any FAIR-compliant cytokine data". What is the first thing you fix?',
      expertView: 'Start with findability: register the dataset and assign a DOI, then describe it with metadata. Without that, none of your downstream effort is even discoverable.',
    },
    qaPrompts: ['What\'s the difference between a DOI and a filename?', 'How much metadata is "enough"?', 'Who issues persistent identifiers?'],
    formativeQuestion: {
      id: 'f-formative',
      stem: 'A colleague assigns a DOI to their flow cytometry dataset but fills in no metadata fields. What is the most significant gap?',
      principle: 'F',
      options: [
        { text: 'The dataset cannot be stored in the repository without metadata.', feedback: 'Repositories do accept datasets with minimal metadata — but the dataset becomes very difficult to discover and interpret. The DOI alone is not enough.' },
        { text: 'The dataset has a stable address but cannot be meaningfully searched or understood by others.', feedback: 'Correct. A DOI ensures the dataset can be cited and retrieved if you already know it exists, but without metadata describing what it contains, automated systems and other researchers cannot find it through search.' },
        { text: 'The dataset will expire because persistent identifiers require metadata to remain active.', feedback: 'Persistent identifiers do not expire based on metadata. However, a dataset with no metadata has almost no practical findability — it is only reachable if someone already has the DOI.' },
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'A',
    title: 'Accessible',
    tagline: 'Found is not the same as reachable.',
    concept: 'Once someone finds your data, they should be able to retrieve it using a standard, open protocol — ideally without needing special tools or permissions. Importantly, even if the data itself is restricted (e.g. patient data under a data sharing agreement), the metadata describing it should always remain openly accessible so others know the data exists and how to request access.',
    labExample: 'Your biomarker study dataset is listed in a public repository, but when the project ends, the institutional server hosting the files is decommissioned. The metadata is still visible — people can see the dataset exists and who to contact — but the files are no longer retrievable. The metadata staying accessible is what makes this recoverable.',
    keyTakeaway: 'Accessible = open retrieval protocol + metadata stays public even when data is restricted.',
    video: {
      duration: '3:50',
      chapters: ['Found vs reachable', 'Open retrieval protocols', 'Authentication for restricted data', 'Why metadata must persist'],
    },
    workedExample: {
      title: 'Keeping restricted data accessible',
      before: 'A donor-level biomarker dataset sits on a project server that will be decommissioned at project end.',
      steps: [
        { label: 'Separate metadata from data', detail: 'Publish the metadata record openly in the repository, even though the data itself stays controlled.' },
        { label: 'Define the access route', detail: 'State that data is available under a Data Access Agreement, with a named contact and a request process.' },
        { label: 'Use a durable host', detail: 'Move files to a managed repository with long-term preservation, not a project server.' },
      ],
      after: 'Even after the server is gone, others can see the dataset exists and follow a clear path to request it.',
    },
    caseStudy: {
      title: 'The link that died',
      narrative: 'Eight months after publication, a reviewer reports that your dataset\'s download link returns a 404. The project that hosted it ended and the server was retired.',
      question: 'The data is gone from the old server. What should have been in place so this never happened?',
      expertView: 'Long-term accessibility needs durable infrastructure and persistent metadata. The data should have lived in a preservation-grade repository, with metadata that stays public regardless of the data\'s status.',
    },
    qaPrompts: ['Does "accessible" mean open to everyone?', 'What stays public when data is restricted?', 'What is an open retrieval protocol?'],
    formativeQuestion: {
      id: 'a-formative',
      stem: 'A dataset contains sensitive patient information and is stored behind access controls. According to FAIR principles, what should still be publicly available?',
      principle: 'A',
      options: [
        { text: 'The raw data, anonymised before publication.', feedback: 'Anonymisation may not always be sufficient or appropriate. FAIR does not require all data to be open — it requires the access pathway to be clear.' },
        { text: 'The metadata describing the dataset and how to request access.', feedback: 'Correct. FAIR\'s accessibility principle specifies that metadata should remain accessible even when the data itself is restricted. This tells the world the data exists and how to legitimately access it.' },
        { text: 'Nothing — restricted data should not appear in public systems at all.', feedback: 'This approach makes restricted datasets effectively invisible to the research community. FAIR encourages transparency about what data exists and how it can be accessed, even for sensitive datasets.' },
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'I',
    title: 'Interoperable',
    tagline: 'Your data should speak a language others understand.',
    concept: 'Interoperability means your data and metadata use shared vocabularies, ontologies, and formats so that other systems and researchers can interpret them without needing to ask you for a translation. Using lab-specific abbreviations, proprietary file formats, or undefined terms breaks interoperability — even if the data is perfectly well-organised internally.',
    labExample: 'Your immunoassay results use "T0", "T24", "T48" for timepoints — clear to your team, but undefined to anyone outside. A bioinformatics pipeline attempting to integrate your data with another lab\'s dataset cannot reconcile these without manual intervention. Using a shared ontology term like "hours post-stimulation" with a numeric value removes this ambiguity.',
    keyTakeaway: 'Interoperable = shared vocabulary + open formats + qualified references to other data.',
    video: {
      duration: '4:10',
      chapters: ['The translation problem', 'Shared vocabularies & ontologies', 'Open vs proprietary formats', 'Qualified links between datasets'],
    },
    workedExample: {
      title: 'From lab shorthand to shared vocabulary',
      before: 'Columns: T0, T24, T48 · cell types: "Mac", "Tc", "Bc" · file format: .xyz (proprietary).',
      steps: [
        { label: 'Replace ambiguous terms', detail: 'Map T0/T24/T48 to "hours_post_stimulation" = 0, 24, 48 with unit ontology UO:0000032.' },
        { label: 'Use standard cell-type terms', detail: 'Map "Mac" → macrophage (CL:0000235), "Tc" → T cell (CL:0000084), "Bc" → B cell (CL:0000236).' },
        { label: 'Convert the format', detail: 'Export from .xyz to CSV so any tool can read it without proprietary software.' },
      ],
      after: 'A bioinformatics pipeline can now ingest and integrate your data automatically — no translation key required.',
    },
    caseStudy: {
      title: 'Two labs, one analysis, no common language',
      narrative: 'Your data and a partner lab\'s data should combine into one model. Their pipeline rejects yours overnight: it can\'t map your abbreviations or open your file format.',
      question: 'The integration fails and you\'re not on the call. What changes let the pipeline read your data unaided?',
      expertView: 'Interoperability means machines interpret your data without you. Adopt shared ontologies for terms and an open format for the file — then integration becomes automatic.',
    },
    qaPrompts: ['What is an ontology, in plain terms?', 'Why is CSV better than a proprietary format?', 'What is a "qualified reference"?'],
    formativeQuestion: {
      id: 'i-formative',
      stem: 'A scientist exports assay data in a proprietary software format and uses lab-specific abbreviations for all cell types. Which FAIR principle is most at risk, and why?',
      principle: 'I',
      options: [
        { text: 'Findable — because the file format makes it harder to index in repositories.', feedback: 'File format affects discoverability to some degree, but the core issue here is that neither the format nor the terminology can be understood by external systems or researchers without a translation key.' },
        { text: 'Interoperable — because neither the format nor the terminology can be interpreted by other systems or researchers without manual translation.', feedback: 'Correct. Interoperability requires both an open, standard file format and shared vocabulary. Proprietary formats and undefined abbreviations create barriers to integration and reuse.' },
        { text: 'Reusable — because the data lacks a clear licence for others to use it.', feedback: 'Licensing is a Reusable concern. The problem described here — format and terminology that others can\'t interpret — is specifically an interoperability issue.' },
      ],
      correctIndex: 1,
    },
  },
  {
    id: 'R',
    title: 'Reusable',
    tagline: 'Future users should be able to confidently build on your data.',
    concept: 'Reusability is the ultimate goal of the other three principles. Data is reusable when it has a clear usage licence, detailed provenance (who generated it, how, and when), thorough methodology documentation, and meets community standards for the domain. Without these, even a well-described, accessible dataset may sit unused because no one can assess whether it\'s appropriate to build on.',
    labExample: 'You share an ELISA dataset publicly. It has a DOI, good metadata, and an open format. But there\'s no licence, no information about antibody lots, no passage number for the cells, and no note that one donor sample was an outlier that was excluded. A researcher trying to include your data in a meta-analysis cannot safely do so — too many unknowns.',
    keyTakeaway: 'Reusable = clear licence + rich provenance + documented methodology + community standards.',
    video: {
      duration: '4:40',
      chapters: ['Why reuse is the goal', 'Provenance and methodology', 'Licences explained', 'Meeting community standards'],
    },
    workedExample: {
      title: 'Making an ELISA dataset safe to reuse',
      before: 'Public ELISA dataset: DOI, good metadata, CSV format — but no licence, no reagent lots, no exclusion notes.',
      steps: [
        { label: 'Attach a licence', detail: 'Apply CC BY 4.0 so others know they may reuse it with attribution.' },
        { label: 'Document provenance', detail: 'Record antibody lot numbers, cell passage number, instrument, and calibration date.' },
        { label: 'Flag exclusions', detail: 'Note that donor 12 was an outlier excluded from analysis, with the reason why.' },
      ],
      after: 'A meta-analysis team can now confirm they\'re allowed to use the data and trust its quality.',
    },
    caseStudy: {
      title: 'Technically perfect, practically unusable',
      narrative: 'Your dataset ticks F, A, and I — but a meta-analysis team passes it over. It has no licence and no provenance, so they can\'t confirm rights or reliability.',
      question: 'The data is findable, accessible and interoperable. Why is it still sitting unused?',
      expertView: 'Reusability is the payoff of the other three. Without a licence and provenance, even flawless data is legally and scientifically untrustworthy to build on.',
    },
    qaPrompts: ['What should a good licence cover?', 'What counts as provenance?', 'Why isn\'t a DOI enough for reuse?'],
    formativeQuestion: {
      id: 'r-formative',
      stem: 'A researcher wants to include your immunoassay dataset in a multi-centre meta-analysis. Your dataset has a DOI and detailed metadata, but no licence and no information about reagent lots or instrument calibration. What is the most significant barrier to reuse?',
      principle: 'R',
      options: [
        { text: 'The missing DOI makes it difficult to cite the dataset correctly.', feedback: 'The dataset does have a DOI. The problem here is downstream — another researcher needs to know whether they can use the data and whether they can trust its provenance.' },
        { text: 'The missing licence and provenance details mean the researcher cannot confirm they are allowed to reuse the data or assess its reliability.', feedback: 'Correct. Without a licence, reuse may be legally uncertain. Without provenance (reagent lots, calibration records, exclusions), the researcher cannot assess whether the data is appropriate for their analysis.' },
        { text: 'The dataset is not interoperable because it was generated on a specific instrument.', feedback: 'Instrument specificity is not an interoperability issue. Interoperability relates to file formats and shared vocabularies. The barrier here is about trustworthiness and legal clarity for reuse.' },
      ],
      correctIndex: 1,
    },
  },
];

export const baselineQuestions: MCQuestion[] = [
  {
    id: 'b1',
    stem: 'What is the primary purpose of assigning a persistent identifier to a research dataset?',
    principle: 'F',
    options: [
      { text: 'To restrict the dataset to authorised users only.', feedback: 'Persistent identifiers are not access control tools. They are stable addresses so the dataset can be reliably located and cited — access is managed separately through permissions.' },
      { text: 'To ensure the dataset can be reliably located and cited over time, even if files move servers.', feedback: 'Correct. A persistent identifier like a DOI gives your dataset a stable, permanent address. It\'s the foundation of findability.' },
      { text: 'To describe the content and methodology of the dataset for other researchers.', feedback: 'Describing content and methodology is the role of metadata. An identifier is simply the stable, unique pointer to where the dataset lives.' },
    ],
    correctIndex: 1,
  },
  {
    id: 'b2',
    stem: 'A dataset is publicly listed in a repository, but the download link stopped working after the project ended. Which FAIR principle is most affected?',
    principle: 'A',
    options: [
      { text: 'Findable — the dataset can no longer be discovered through search.', feedback: 'The dataset is still listed in the repository and can be found. The problem is that once found, it cannot be retrieved — which is an accessibility issue.' },
      { text: 'Accessible — the retrieval mechanism has failed and the data can no longer be obtained.', feedback: 'Correct. Accessibility requires that data can be retrieved using a standard protocol. A broken link means the retrieval mechanism has failed, violating the accessible principle.' },
      { text: 'Reusable — the dataset no longer meets documentation standards.', feedback: 'Reusability is about the richness of description and licensing. The issue here is more fundamental — the data simply can\'t be downloaded at all.' },
    ],
    correctIndex: 1,
  },
  {
    id: 'b3',
    stem: 'A biomarker dataset uses lab-specific abbreviations not defined in any shared vocabulary or ontology. What problem does this most directly create?',
    principle: 'I',
    options: [
      { text: 'The dataset cannot be assigned a persistent identifier.', feedback: 'Persistent identifiers are assigned independently of the vocabulary used in the data. You can have a DOI for a dataset full of undefined abbreviations.' },
      { text: 'Other researchers and systems cannot reliably interpret the data without a manual translation from the original team.', feedback: 'Correct. Interoperability requires shared vocabularies so that both humans and automated systems can understand data without needing to contact the original team.' },
      { text: 'The dataset will not meet licensing requirements for public repositories.', feedback: 'Licensing is a Reusable concern. The vocabulary issue described here prevents integration with other datasets — that\'s an interoperability failure.' },
    ],
    correctIndex: 1,
  },
  {
    id: 'b4',
    stem: 'Which of the following best supports the reusability of an immunoassay dataset?',
    principle: 'R',
    options: [
      { text: 'Storing the raw data in a password-protected shared drive with the team.', feedback: 'A password-protected drive limits both accessibility and reusability. Others can\'t reach the data at all, let alone reuse it.' },
      { text: 'Providing a detailed protocol, reagent information, a clear usage licence, and provenance information alongside the data.', feedback: 'Correct. Reusability requires others to know what they\'re allowed to do with the data (licence) and to trust it enough to build on (provenance and methodology detail).' },
      { text: 'Registering the dataset with a persistent identifier in a public repository.', feedback: 'This supports findability. While it\'s necessary, a DOI alone doesn\'t help someone assess whether the data is reliable or appropriate to reuse.' },
    ],
    correctIndex: 1,
  },
];

export interface PracticeStep {
  id: number;
  scenario: string;
  stem: string;
  options: MCQOption[];
  correctIndex: number;
  principle: string;
}

export const practiceScenario = {
  title: 'Scenario: Preparing a Cytokine Study Dataset for Submission',
  setup: `You've just completed a cytokine multiplex study measuring 12 analytes in PBMC samples from 24 donors across three timepoints. Your PI wants the dataset submitted to an institutional repository before your team presents at a conference next month. You're responsible for making the dataset FAIR-compliant.`,
  steps: [
    {
      id: 0,
      scenario: 'First, you need to register the dataset so it can be tracked and cited.',
      stem: 'What should you assign to the dataset before submitting it to the repository?',
      principle: 'F',
      options: [
        { text: 'A filename that includes the date and your initials.', feedback: 'Filenames are not stable or globally unique. They change when files are reorganised and can\'t be cited reliably.' },
        { text: 'A persistent identifier such as a DOI or accession number provided by the repository.', feedback: 'Correct. A DOI or accession number is stable, globally unique, and citable. Most institutional repositories will mint one for you on submission.' },
        { text: 'A password so only authorised colleagues can access it initially.', feedback: 'A password is an access control measure, not an identifier. It doesn\'t help anyone locate or cite the dataset.' },
      ],
      correctIndex: 1,
    },
    {
      id: 1,
      scenario: 'The repository asks you to fill in metadata before the dataset is published.',
      stem: 'Which set of metadata fields is most important to complete for this dataset?',
      principle: 'F',
      options: [
        { text: 'Your name, institution, and the date you submitted the file.', feedback: 'These are minimal administrative fields. They don\'t help a researcher determine whether this dataset is relevant to their work.' },
        { text: 'Assay type, analytes measured, species, sample type, timepoints, instrument, software version, and any sample exclusions.', feedback: 'Correct. Rich metadata lets other researchers and automated systems determine what the dataset contains, whether it\'s relevant, and whether it\'s appropriate to reuse.' },
        { text: 'The file size and format only — the rest is in the methods section of the paper.', feedback: 'Methods sections in papers are not machine-readable and may not always be accessible. Metadata should be self-contained within the repository record.' },
      ],
      correctIndex: 1,
    },
    {
      id: 2,
      scenario: 'Your data is exported from the analysis software in a proprietary .xyz format. The repository recommends open formats.',
      stem: 'What should you do to support interoperability?',
      principle: 'I',
      options: [
        { text: 'Submit the proprietary format — researchers can download the software to open it.', feedback: 'Requiring others to obtain specific (often expensive) software creates a significant barrier to reuse and is not interoperable.' },
        { text: 'Convert the data to an open, widely used format such as CSV or TSV, and use standard column headers aligned with community vocabularies.', feedback: 'Correct. Open formats with standard terminology allow any researcher or analytical tool to read the data without dependencies.' },
        { text: 'Include a README explaining the proprietary format — that\'s sufficient for interoperability.', feedback: 'A README helps, but it doesn\'t solve the underlying problem. Interoperability requires the data itself to be interpretable by standard tools, not just humans who read an explanation.' },
      ],
      correctIndex: 1,
    },
    {
      id: 3,
      scenario: 'A researcher from another institution asks if they can include your dataset in a multi-centre meta-analysis.',
      stem: 'What do you need to provide to fully support reuse of this dataset?',
      principle: 'R',
      options: [
        { text: 'A link to the repository record — everything they need should be there.', feedback: 'Only if the repository record is truly complete. Many are not. You need to confirm the licence, provenance, and methodology are all documented.' },
        { text: 'A clear usage licence, detailed provenance (reagent lots, instrument calibration records, exclusion rationale), and a full protocol.', feedback: 'Correct. Reuse requires legal clarity (licence) and enough methodological and provenance detail that the researcher can assess whether your data is appropriate for their analysis.' },
        { text: 'The raw data file and your email address in case they have questions.', feedback: 'Depending on email follow-up is not scalable or sustainable. The dataset itself should contain enough information for confident reuse without needing to contact you.' },
      ],
      correctIndex: 1,
    },
  ] as PracticeStep[],
};

export const summativeQuestions: MCQuestion[] = [
  {
    id: 's1',
    stem: 'A dataset has been published with a DOI and detailed metadata but is stored in a format only readable by one commercial software package. Which FAIR principle is violated, and what is the consequence?',
    options: [
      { text: 'Findable — the dataset cannot be indexed by repository search engines.', feedback: 'Search engines index metadata, not file contents. The dataset can still be found. The issue is what happens after it\'s found.' },
      { text: 'Interoperable — other systems and researchers cannot process the data without the specific software.', feedback: 'Correct. Interoperability requires open, standard formats. Proprietary formats create a dependency that limits who can meaningfully use the data.' },
      { text: 'Accessible — the retrieval mechanism depends on owning the software.', feedback: 'Accessibility refers to the protocol for downloading the data, not the software needed to open it. The file can be downloaded — but not read without the software. That\'s an interoperability failure.' },
    ],
    correctIndex: 1,
  },
  {
    id: 's2',
    stem: 'Your team generates a dataset containing potentially identifiable donor information. Which approach best satisfies FAIR principles while protecting participant privacy?',
    options: [
      { text: 'Keep the dataset entirely private with no public record.', feedback: 'This makes the dataset invisible to the research community. FAIR principles can be applied to restricted data — the metadata, at minimum, should be publicly accessible.' },
      { text: 'Publish the metadata openly so others know the dataset exists and how to request access, while restricting the data itself under a data access agreement.', feedback: 'Correct. FAIR does not mean all data must be open. The principle is "as open as possible, as closed as necessary." Metadata should always be accessible even when data access is controlled.' },
      { text: 'Publish everything openly — FAIR requires all data to be publicly available.', feedback: 'This is a common misconception. FAIR requires findable, accessible, interoperable, and reusable — not necessarily open. Accessibility can mean "accessible under defined conditions."' },
    ],
    correctIndex: 1,
  },
  {
    id: 's3',
    stem: 'Six months after publishing a dataset, a researcher asks why it\'s not appearing in any cross-study analyses, despite being listed in the repository. What is the most likely cause?',
    options: [
      { text: 'The dataset was published too recently to be indexed.', feedback: 'Six months is generally sufficient for indexing. The more likely cause is a problem with the metadata or format.' },
      { text: 'The metadata uses undefined internal terminology and the data is stored in a proprietary format, preventing automated systems from interpreting it.', feedback: 'Correct. Poor interoperability is a common reason why technically published datasets fail to participate in integrated analyses. Shared vocabularies and open formats are essential.' },
      { text: 'The dataset needs a new DOI to appear in automated analyses.', feedback: 'A DOI is the persistent identifier — it doesn\'t expire or need renewal. The issue here is with vocabulary and format, not the identifier.' },
    ],
    correctIndex: 1,
  },
  {
    id: 's4',
    stem: 'A scientist publishes a dataset with a DOI, open format, community vocabulary, and an open licence. A year later, the institutional server is decommissioned and the files are deleted. Which FAIR principle has now failed?',
    options: [
      { text: 'Findable — the DOI no longer resolves to anything.', feedback: 'The DOI (the identifier) has failed to resolve — but this is a symptom of the accessibility failure. The identifier still exists; it\'s the retrieval mechanism that has broken down.' },
      { text: 'Accessible — the data can no longer be retrieved despite previously meeting all other FAIR criteria.', feedback: 'Correct. Long-term accessibility requires sustainable infrastructure. Even a perfectly FAIR dataset fails if it is not preserved and retrievable over time.' },
      { text: 'Reusable — the loss of the data means it can no longer be built upon.', feedback: 'While loss of data is certainly a reusability problem, the proximate FAIR failure is accessibility — the data cannot be retrieved. Reusability depends on accessibility being maintained.' },
    ],
    correctIndex: 1,
  },
];

export const tutorResponses: { keywords: string[]; response: string }[] = [
  { keywords: ['fair', 'what is', 'explain', 'overview'], response: 'FAIR stands for Findable, Accessible, Interoperable, and Reusable. It\'s a set of principles to help scientific data be as useful as possible — not just to you, but to others who might want to build on it. The goal is that data should be easy to locate, easy to retrieve, easy to understand, and safe to reuse.' },
  { keywords: ['findable', 'find', 'doi', 'identifier', 'metadata'], response: 'Findability is about making your data discoverable. It needs two things: a stable, unique identifier (like a DOI) so it has a permanent address, and rich metadata so search systems can describe what it contains. Think of metadata as the label — without it, even a well-stored dataset is invisible.' },
  { keywords: ['accessible', 'access', 'retrieve', 'download', 'restricted', 'protocol'], response: 'Accessible doesn\'t mean publicly open — it means retrievable through a standard, open protocol. The important nuance is that even if the data is restricted (e.g. patient data), the *metadata* should always be publicly visible so people know the data exists and how to request access.' },
  { keywords: ['interoperable', 'interoperability', 'vocabulary', 'ontology', 'format', 'abbreviation'], response: 'Interoperability is about speaking a shared language. If your data uses undefined abbreviations or proprietary file formats, other systems and researchers can\'t interpret it without asking you. Using community vocabularies (ontologies) and open formats like CSV removes that barrier.' },
  { keywords: ['reusable', 'reuse', 'licence', 'license', 'provenance', 'protocol', 'methodology'], response: 'Reusability is the whole point of the other three principles. For data to be confidently reused, it needs: a clear licence (so people know they\'re allowed), detailed provenance (who made it, how, with what), and enough methodology to assess whether it\'s appropriate for a new purpose.' },
  { keywords: ['example', 'show me', 'lab', 'practical'], response: 'Here\'s a practical example: you run an ELISA assay and store the results in your ELN. If you don\'t attach a DOI, fill in metadata fields (assay type, species, timepoints), export to CSV, and note the reagent lots used — your perfectly good data is essentially unusable to anyone outside your immediate team.' },
  { keywords: ['help', 'confused', 'don\'t understand', 'lost', 'stuck'], response: 'No problem — let me know which part is unclear and I\'ll walk you through it. FAIR can feel abstract at first, but once you connect it to a specific experiment you\'ve run, it usually clicks quickly.' },
  { keywords: ['why', 'why does it matter', 'point', 'purpose'], response: 'The core reason FAIR matters is reproducibility and efficiency. When data is well-described and reusable, other researchers don\'t have to repeat your work — they can build on it. In pharma and life sciences specifically, FAIR data is increasingly expected by regulators and funders, and it dramatically speeds up cross-study analyses.' },
  { keywords: ['assessment', 'question', 'test', 'quiz'], response: 'The assessments here are designed to check your understanding of FAIR in real scenarios — not to trip you up. Read each question carefully and think about what the actual task is. If you get one wrong, the feedback explains why so you can move forward with the right understanding.' },
  { keywords: ['practice', 'scenario', 'exercise'], response: 'The practice scenario puts you in the role of a scientist preparing a real dataset for submission. Each step asks you to make a decision — the focus is on applying what you\'ve learned, not recalling definitions.' },
];

export function getTutorResponse(message: string): string {
  const lower = message.toLowerCase();
  for (const { keywords, response } of tutorResponses) {
    if (keywords.some(k => lower.includes(k))) return response;
  }
  return 'Good question. Could you tell me a bit more about what you\'re trying to understand? I\'m here to help with anything related to FAIR data principles or the content in this learning event.';
}
