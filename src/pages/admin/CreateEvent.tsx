import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Search, Plus, Check, Sparkles, Tag, ChevronDown, Paperclip, X, FileText, Link, Upload } from 'lucide-react';
import type { Capability, Persona, LearningEvent, WizardStep } from '../../types';
import { capabilityCatalog, teams, groups, generateOutcomes } from '../../data/mockData';

interface CreateEventProps {
  onCancel: () => void;
  onComplete: (event: Omit<LearningEvent, 'id' | 'createdAt' | 'status' | 'assignedCount'> & { assignedCount?: number }) => void;
}

interface AttachedFile {
  id: string;
  name: string;
  size: string;
}

interface ContentItem {
  id: string;
  type: 'file' | 'url' | 'text';
  label: string;
  value: string;
}

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'capability', label: 'Capability' },
  { id: 'context', label: 'Context' },
  { id: 'personas', label: 'Personas' },
  { id: 'generate', label: 'Generate' },
  { id: 'assign', label: 'Assign' },
];

const personaColors: Record<Persona, string> = {
  L1: 'border-violet-400 bg-violet-50 text-violet-700',
  L2: 'border-blue-400 bg-blue-50 text-blue-700',
  L3: 'border-cyan-400 bg-cyan-50 text-cyan-700',
  L4: 'border-amber-400 bg-amber-50 text-amber-700',
};

const personaDesc: Record<Persona, string> = {
  L1: 'Junior / Associate level',
  L2: 'Scientist / Analyst level',
  L3: 'Senior Scientist level',
  L4: 'Principal / Lead level',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileUploadZone({ onFiles, label, hint }: { onFiles: (files: AttachedFile[]) => void; label: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (fileList: FileList) => {
    const attached: AttachedFile[] = Array.from(fileList).map(f => ({
      id: `f-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: formatBytes(f.size),
    }));
    onFiles(attached);
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg px-4 py-5 text-center cursor-pointer transition-all ${
        dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
      }`}
    >
      <input ref={inputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
      <Upload size={16} className="text-slate-400 mx-auto mb-2" />
      <p className="text-slate-600 text-xs font-medium">{label}</p>
      <p className="text-slate-400 text-xs mt-0.5">{hint}</p>
    </div>
  );
}

function FileChip({ file, onRemove }: { file: AttachedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <FileText size={13} className="text-blue-500 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-slate-700 text-xs font-medium truncate">{file.name}</p>
        <p className="text-slate-400 text-xs">{file.size}</p>
      </div>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

function ContentItemCard({ item, onRemove }: { item: ContentItem; onRemove: () => void }) {
  const icon = item.type === 'file' ? <FileText size={13} className="text-blue-500" /> : <Link size={13} className="text-teal-600" />;
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
      <div className="flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-slate-700 text-xs font-medium truncate">{item.label}</p>
        {item.type === 'url' && <p className="text-slate-400 text-xs truncate">{item.value}</p>}
        {item.type === 'file' && <p className="text-slate-400 text-xs">{item.value}</p>}
      </div>
      <button onClick={onRemove} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
        <X size={13} />
      </button>
    </div>
  );
}

export default function CreateEvent({ onCancel, onComplete }: CreateEventProps) {
  const [step, setStep] = useState<WizardStep>('capability');
  const [search, setSearch] = useState('');
  const [selectedCapability, setSelectedCapability] = useState<Capability | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCap, setCustomCap] = useState({ name: '', domain: '', description: '' });
  const [context, setContext] = useState('');
  const [supportingFiles, setSupportingFiles] = useState<AttachedFile[]>([]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>([]);
  const [teamName, setTeamName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedOutcomes, setGeneratedOutcomes] = useState<{ persona: string; outcomes: string[] }[]>([]);

  const filteredCaps = capabilityCatalog.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const canProceed = () => {
    if (step === 'capability') return !!selectedCapability;
    if (step === 'context') return context.trim().length > 20;
    if (step === 'personas') return selectedPersonas.length > 0;
    if (step === 'generate') return generatedOutcomes.length > 0;
    if (step === 'assign') return !!(teamName || groupName);
    return false;
  };

  const handleNext = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (step === 'personas') {
      handleGenerate();
    } else if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id);
    }
  };

  const handleBack = () => {
    const idx = STEPS.findIndex(s => s.id === step);
    if (idx > 0) setStep(STEPS[idx - 1].id);
  };

  const handleGenerate = () => {
    setStep('generate');
    setGenerating(true);
    setTimeout(() => {
      const outcomes = generateOutcomes(selectedCapability!, context, selectedPersonas);
      setGeneratedOutcomes(outcomes);
      setGenerating(false);
    }, 2200);
  };

  const handleAddCustom = () => {
    if (!customCap.name || !customCap.domain) return;
    const cap: Capability = {
      id: `custom-${Date.now()}`,
      name: customCap.name,
      domain: customCap.domain,
      description: customCap.description,
      tags: [],
      isCustom: true,
    };
    setSelectedCapability(cap);
    setShowCustomForm(false);
  };

  const handleComplete = () => {
    onComplete({
      title: `${selectedCapability!.name} — ${teamName}`,
      capability: selectedCapability!,
      context,
      selectedPersonas,
      teamName,
      outcomes: generatedOutcomes.map(o => ({ persona: o.persona as Persona, outcomes: o.outcomes })),
      assignedCount: 0,
    });
  };

  const togglePersona = (p: Persona) => {
    setSelectedPersonas(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const addSupportingFiles = (files: AttachedFile[]) => setSupportingFiles(prev => [...prev, ...files]);
  const removeSupportingFile = (id: string) => setSupportingFiles(prev => prev.filter(f => f.id !== id));

  const addContentFiles = (files: AttachedFile[]) => {
    const items: ContentItem[] = files.map(f => ({
      id: f.id, type: 'file', label: f.name, value: f.size,
    }));
    setContentItems(prev => [...prev, ...items]);
  };

  const addUrlItem = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    const label = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    setContentItems(prev => [...prev, { id: `url-${Date.now()}`, type: 'url', label, value: url }]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeContentItem = (id: string) => setContentItems(prev => prev.filter(i => i.id !== id));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Learning Event</h1>
          <p className="text-slate-500 text-xs mt-0.5">Create a capability-driven learning experience for your team</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const done = i < currentStepIndex;
          const active = s.id === step;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  done ? 'bg-blue-600 border-blue-600 text-white' :
                  active ? 'border-blue-500 bg-blue-50 text-blue-600' :
                  'border-slate-300 bg-white text-slate-400'
                }`}>
                  {done ? <Check size={13} /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${active ? 'text-blue-600' : done ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mb-5 mx-1 ${i < currentStepIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">

        {/* STEP 1: Capability */}
        {step === 'capability' && (
          <div>
            <h2 className="text-slate-900 font-semibold mb-1">Select a Capability</h2>
            <p className="text-slate-500 text-sm mb-5">Choose from the Capability Model catalog or add a custom one</p>

            {!showCustomForm ? (
              <>
                <div className="relative mb-4">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, domain, or tag..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-4">
                  {filteredCaps.map(cap => (
                    <button
                      key={cap.id}
                      onClick={() => setSelectedCapability(cap)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        selectedCapability?.id === cap.id
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 text-sm font-semibold">{cap.name}</span>
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">{cap.domain}</span>
                          </div>
                          <p className="text-slate-500 text-xs line-clamp-2">{cap.description}</p>
                        </div>
                        {selectedCapability?.id === cap.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 ml-3">
                            <Check size={11} className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <Plus size={14} />
                  Add a custom capability
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Capability Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bioinformatics Pipeline Management"
                    value={customCap.name}
                    onChange={e => setCustomCap(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Domain *</label>
                  <input
                    type="text"
                    placeholder="e.g. Computational Biology"
                    value={customCap.domain}
                    onChange={e => setCustomCap(p => ({ ...p, domain: e.target.value }))}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Description</label>
                  <textarea
                    placeholder="Briefly describe what this capability covers..."
                    value={customCap.description}
                    onChange={e => setCustomCap(p => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddCustom}
                    disabled={!customCap.name || !customCap.domain}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Capability
                  </button>
                  <button onClick={() => setShowCustomForm(false)} className="text-slate-500 hover:text-slate-700 text-sm transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {selectedCapability && !showCustomForm && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <Check size={14} className="text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 text-sm font-medium">{selectedCapability.name}</span>
                {selectedCapability.isCustom && <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200">Custom</span>}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Context */}
        {step === 'context' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-slate-900 font-semibold mb-1">Provide Team Context</h2>
              <p className="text-slate-500 text-sm">
                Describe your team's situation and why this capability matters now. Attach supporting documents and reference materials to help the AI generate more accurate, relevant outcomes.
              </p>
            </div>

            {selectedCapability && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <Tag size={13} className="text-blue-600" />
                <span className="text-slate-700 text-sm font-medium">{selectedCapability.name}</span>
                <span className="text-slate-400 text-xs">· {selectedCapability.domain}</span>
              </div>
            )}

            <div>
              <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Team Context *</label>
              <textarea
                placeholder="e.g. The Immunology team is transitioning to a new data repository. Several datasets from recent biomarker studies have been flagged as non-FAIR compliant during audit. We need to build consistent data practices before the Q3 submission deadline..."
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={5}
                className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
              <div className="flex justify-between mt-1.5">
                <p className="text-slate-400 text-xs">Include team roles, current challenges, business triggers, and urgency</p>
                <span className={`text-xs ${context.length < 20 ? 'text-slate-300' : 'text-slate-500'}`}>{context.length} chars</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Paperclip size={13} className="text-slate-400" />
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide">Supporting Files</label>
                <span className="text-slate-400 text-xs">optional</span>
              </div>
              <p className="text-slate-500 text-xs mb-3">Attach documents that give the AI background on your team — audit reports, team briefs, previous assessments, org charts.</p>
              <FileUploadZone onFiles={addSupportingFiles} label="Click or drag files here" hint="PDF, Word, Excel, PowerPoint accepted" />
              {supportingFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {supportingFiles.map(f => (
                    <FileChip key={f.id} file={f} onRemove={() => removeSupportingFile(f.id)} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-slate-400" />
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide">Additional Content</label>
                <span className="text-slate-400 text-xs">optional</span>
              </div>
              <p className="text-slate-500 text-xs mb-3">Add learning resources and references the AI should draw on — SOPs, regulatory guidelines, external references, training materials.</p>

              <div className="space-y-2 mb-3">
                {contentItems.map(item => (
                  <ContentItemCard key={item.id} item={item} onRemove={() => removeContentItem(item.id)} />
                ))}
              </div>

              <FileUploadZone onFiles={addContentFiles} label="Click or drag files here" hint="PDF, Word, Excel, PowerPoint accepted" />

              <div className="mt-2">
                {!showUrlInput ? (
                  <button onClick={() => setShowUrlInput(true)} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors mt-2">
                    <Link size={13} />
                    Add a URL reference
                  </button>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="url"
                      placeholder="https://www.go-fair.org/fair-principles/"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addUrlItem()}
                      autoFocus
                      className="flex-1 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button onClick={addUrlItem} disabled={!urlInput.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                      Add
                    </button>
                    <button onClick={() => { setShowUrlInput(false); setUrlInput(''); }} className="text-slate-400 hover:text-slate-600 transition-colors px-1">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Personas */}
        {step === 'personas' && (
          <div>
            <h2 className="text-slate-900 font-semibold mb-1">Select Applicable Personas</h2>
            <p className="text-slate-500 text-sm mb-5">
              Choose which persona levels this learning event applies to. Outcomes will be tailored to each selected level.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {(['L1', 'L2', 'L3', 'L4'] as Persona[]).map(p => {
                const selected = selectedPersonas.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePersona(p)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selected ? personaColors[p] : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-lg font-bold ${selected ? '' : 'text-slate-700'}`}>{p}</span>
                      {selected && <div className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center"><Check size={11} /></div>}
                    </div>
                    <p className={`text-xs ${selected ? 'opacity-70' : 'text-slate-500'}`}>{personaDesc[p]}</p>
                  </button>
                );
              })}
            </div>

            {selectedPersonas.length > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-slate-500 text-xs">Outcomes will be generated for: <span className="text-slate-900 font-medium">{selectedPersonas.join(', ')}</span></p>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Generate */}
        {step === 'generate' && (
          <div>
            <h2 className="text-slate-900 font-semibold mb-1">Learning Outcomes</h2>
            <p className="text-slate-500 text-sm mb-5">AI-generated outcomes based on your capability, context, and selected personas</p>

            {generating ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin mb-4" />
                <p className="text-slate-700 text-sm font-medium mb-1">Generating learning outcomes…</p>
                <p className="text-slate-400 text-xs">Applying capability model and team context</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedOutcomes.map(({ persona, outcomes }) => (
                  <div key={persona} className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2 border-b border-slate-200">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                        persona === 'L1' ? 'border-violet-200 bg-violet-50 text-violet-700' :
                        persona === 'L2' ? 'border-blue-200 bg-blue-50 text-blue-700' :
                        persona === 'L3' ? 'border-cyan-200 bg-cyan-50 text-cyan-700' :
                        'border-amber-200 bg-amber-50 text-amber-700'
                      }`}>{persona}</span>
                      <span className="text-slate-700 text-sm font-medium">{personaDesc[persona as Persona]}</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {outcomes.map((o, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                          <p className="text-slate-700 text-sm">{o}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <Sparkles size={13} className="text-amber-600" />
                  <p className="text-amber-700 text-xs">These outcomes were generated based on your capability model and context. You can refine them after saving.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Assign */}
        {step === 'assign' && (
          <div>
            <h2 className="text-slate-900 font-semibold mb-1">Assign to Team</h2>
            <p className="text-slate-500 text-sm mb-5">
              Select a department, a group, or both. The system will automatically map each person to their persona level and deliver the appropriate outcome set.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Department</label>
                <div className="relative">
                  <select
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-10"
                  >
                    <option value="">Select a department…</option>
                    {teams.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-400 text-xs font-medium">and / or</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <div>
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-1.5 block">Group</label>
                <div className="relative">
                  <select
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors appearance-none pr-10"
                  >
                    <option value="">Select a group…</option>
                    {groups.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <p className="text-slate-400 text-xs">Select at least one. Each person's L1–L4 persona will be looked up automatically from their profile.</p>

              {(teamName || groupName) && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5">
                  <p className="text-slate-600 text-xs font-semibold uppercase tracking-wide mb-3">Event Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Capability</span>
                    <span className="text-slate-900 font-medium">{selectedCapability?.name}</span>
                  </div>
                  {teamName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Department</span>
                      <span className="text-slate-900 font-medium">{teamName}</span>
                    </div>
                  )}
                  {groupName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Group</span>
                      <span className="text-slate-900 font-medium">{groupName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Personas</span>
                    <span className="text-slate-900 font-medium">{selectedPersonas.join(', ')}</span>
                  </div>
                  {(supportingFiles.length > 0 || contentItems.length > 0) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">References</span>
                      <span className="text-slate-900 font-medium">{supportingFiles.length + contentItems.length} attached</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nav buttons */}
      <div className="flex justify-between">
        <button
          onClick={currentStepIndex === 0 ? onCancel : handleBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors px-4 py-2.5"
        >
          <ArrowLeft size={15} />
          {currentStepIndex === 0 ? 'Cancel' : 'Back'}
        </button>

        {step === 'assign' ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <Check size={15} />
            Create Learning Event
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed() || (step === 'generate' && generating)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            {step === 'personas' ? (
              <><Sparkles size={15} /> Generate Outcomes</>
            ) : (
              <>Continue <ArrowRight size={15} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
