import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { buildBriefFromInput } from '../lib/aiBriefBuilder';
import { DemoBanner, SuccessBanner } from '../components/ui/States';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Eye,
  Save,
  ChevronDown,
  Plus,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import type { Brief, BriefReference, ContentCategory, AspectRatio, OutputFormat } from '../types';
import { generateId, categoryLabel, cn } from '../lib/utils';

const CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: 'ai_film', label: 'AI Film' },
  { value: 'animation', label: 'Animation' },
  { value: 'product_visuals', label: 'Product Visuals' },
  { value: 'social_ads', label: 'Social Ads' },
  { value: 'motion_graphics', label: 'Motion Graphics' },
  { value: 'concept_art', label: 'Concept Art' },
  { value: 'vfx', label: 'VFX' },
  { value: 'generative_art', label: 'Generative Art' },
];

const CHANNELS = ['instagram', 'youtube', 'tiktok', 'facebook', 'twitter', 'linkedin', 'display_ads', 'tv', 'ooh'];
const ASPECT_RATIOS: AspectRatio[] = ['16:9', '9:16', '1:1', '4:3', '3:4', '2:1', '21:9'];
const OUTPUT_FORMATS: OutputFormat[] = ['mp4', 'mov', 'gif', 'webm', 'jpg', 'png', 'webp', 'svg', 'pdf'];
const RESOLUTIONS = ['4K', '2K', '1080p', '720p'];

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#EDE8E3] rounded-2xl p-6 sm:p-7 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-[#1E1B18] border-b border-[#EDE8E3] pb-3">{title}</h3>
      {children}
    </div>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-2 text-xs font-medium rounded-xl border transition flex items-center justify-center',
        active
          ? 'border-[#E46638] bg-[#FCEFE9] text-[#D95325] ring-1 ring-[#E46638] shadow-sm'
          : 'border-[#EDE8E3] bg-white text-[#716B66] hover:border-[#D5CFC9] hover:bg-[#FAF8F5]'
      )}
    >
      {label}
    </button>
  );
}

type BriefErrors = Partial<Record<keyof Brief, string>>;

function validateBrief(brief: Partial<Brief>): BriefErrors {
  const errors: BriefErrors = {};
  if (!brief.title?.trim()) errors.title = 'Title is required';
  if (!brief.objective?.trim()) errors.objective = 'Objective is required';
  if (!brief.targetAudience?.trim()) errors.targetAudience = 'Target audience is required';
  if (!brief.keyMessage?.trim()) errors.keyMessage = 'Key message is required';
  if (!brief.contentType) errors.contentType = 'Content type is required';
  if (!brief.budget || brief.budget <= 0) errors.budget = 'Budget must be greater than 0';
  if (!brief.deadline) errors.deadline = 'Deadline is required';
  if (!brief.territory?.trim()) errors.territory = 'Territory is required';
  if (!brief.licenseDuration?.trim()) errors.licenseDuration = 'License duration is required';
  return errors;
}

export function BriefFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, saveBrief, publishBrief } = useAppStore();

  const [brief, setBrief] = useState<Partial<Brief>>({
    id: generateId(),
    brandId: currentUser?.id,
    title: '',
    objective: '',
    targetAudience: '',
    keyMessage: '',
    contentType: 'ai_film',
    styleNotes: '',
    references: [],
    aspectRatios: ['16:9'],
    resolution: '4K',
    durationSeconds: 60,
    deliverables: [''],
    channels: ['instagram'],
    territory: 'worldwide',
    licenseDuration: 'perpetual',
    exclusivity: false,
    paidMedia: false,
    sourceFilesRequired: false,
    thirdPartyAssetConstraints: '',
    budget: 0,
    deadline: '',
    revisionRounds: 3,
    status: 'draft',
    requiredOutputFormats: ['mp4'],
    mandatoryAvailability: false,
    clarificationQuestions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<BriefErrors>({});
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [aiInput, setAIInput] = useState('');
  const [aiLoading, setAILoading] = useState(false);
  const [aiResult, setAIResult] = useState<{ isDemoMode: boolean; clarificationQuestions: string[] } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [preview, setPreview] = useState(false);

  function update(field: keyof Brief, value: Brief[typeof field]) {
    setBrief((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function toggleAspectRatio(ar: AspectRatio) {
    const current = brief.aspectRatios ?? [];
    update('aspectRatios', current.includes(ar) ? current.filter((r) => r !== ar) : [...current, ar]);
  }

  function toggleFormat(fmt: OutputFormat) {
    const current = brief.requiredOutputFormats ?? [];
    update('requiredOutputFormats', current.includes(fmt) ? current.filter((f) => f !== fmt) : [...current, fmt]);
  }

  function toggleChannel(ch: string) {
    const current = brief.channels ?? [];
    update('channels', current.includes(ch) ? current.filter((c) => c !== ch) : [...current, ch]);
  }

  function addDeliverable() {
    update('deliverables', [...(brief.deliverables ?? []), '']);
  }

  function updateDeliverable(i: number, val: string) {
    const dels = [...(brief.deliverables ?? [])];
    dels[i] = val;
    update('deliverables', dels);
  }

  function removeDeliverable(i: number) {
    update('deliverables', (brief.deliverables ?? []).filter((_, idx) => idx !== i));
  }

  function addReference() {
    const ref: BriefReference = {
      id: generateId(),
      briefId: brief.id!,
      description: '',
      type: 'url',
    };
    update('references', [...(brief.references ?? []), ref]);
  }

  function handleSaveDraft() {
    const completeB: Brief = {
      ...brief as Brief,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    saveBrief(completeB);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handlePublish() {
    const errs = validateBrief(brief);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const completeB: Brief = {
      ...brief as Brief,
      status: 'published',
      updatedAt: new Date().toISOString(),
    };
    saveBrief(completeB);
    publishBrief(completeB.id);
    navigate('/brand/briefs');
  }

  async function handleAIBuild() {
    if (!aiInput.trim()) return;
    setAILoading(true);
    setAIResult(null);
    try {
      const result = await buildBriefFromInput(aiInput);
      // Merge AI result into brief
      setBrief((prev) => ({
        ...prev,
        ...result.brief,
        id: prev.id,
        brandId: prev.brandId,
        status: 'draft',
        createdAt: prev.createdAt,
        updatedAt: new Date().toISOString(),
      }));
      setAIResult({ isDemoMode: result.isDemoMode, clarificationQuestions: result.clarificationQuestions });
    } finally {
      setAILoading(false);
    }
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl border border-[#EDE8E3] text-[#716B66] hover:bg-[#FAF8F5] transition">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1B18]">Create a New Brief</h1>
            <p className="text-sm text-[#716B66] mt-1">Specify your campaign objectives to match with world-class AI filmmakers & designers.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-[#716B66] bg-white border border-[#EDE8E3] px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto-saving draft</span>
          </div>
        </div>
      </div>
      {/* Action Bar */}
      <div className="flex items-center gap-2 mb-6 justify-end">
        <button
          onClick={() => setShowAIBuilder(!showAIBuilder)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FDF1EC] text-[#E65D2E] text-xs font-semibold border border-[#F8D8CB] hover:bg-orange-100 transition"
        >
          <Sparkles size={13} />
          AI Builder
        </button>
        <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#EDE8E3] text-xs font-medium text-[#716B66] hover:bg-[#FAF8F5] transition shadow-sm">
          <Save size={13} />
          Save Draft
        </button>
        <button onClick={handlePublish} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E46638] hover:bg-[#D95325] text-white text-xs font-semibold transition shadow-sm">
          <Send size={13} />
          Publish Brief
        </button>
      </div>

      {saveSuccess && (
        <div className="mb-4">
          <SuccessBanner message="Brief saved as draft." />
        </div>
      )}

      {/* AI Builder panel */}
      {showAIBuilder && (
        <div className="card p-5 mb-6 border-violet-200 bg-violet-50 space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-violet-600" />
            <h3 className="text-sm font-bold text-violet-800">AI Brief Builder</h3>
            <span className="badge badge-violet text-[10px]">Beta</span>
          </div>
          <DemoBanner label="No AI key configured — using deterministic mock output." />
          <p className="text-xs text-violet-600">
            Describe your campaign in plain English. The AI will populate the form — you review and edit before publishing.
          </p>
          <textarea
            className="input min-h-[80px] resize-none"
            placeholder="e.g. I need a 30-second TikTok ad for a new energy drink targeting Gen Z. Budget is $3,000. Looking for bold, fast-paced visuals with text overlays."
            value={aiInput}
            onChange={(e) => setAIInput(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleAIBuild}
              disabled={aiLoading || !aiInput.trim()}
              className="btn-violet btn-sm"
            >
              {aiLoading ? (
                <><Loader2 size={14} className="animate-spin" /> Generating…</>
              ) : (
                <><Sparkles size={14} /> Generate Brief</>
              )}
            </button>
            <p className="text-xs text-violet-500">
              Result will pre-fill the form below. You must publish manually.
            </p>
          </div>

          {aiResult && (
            <div className="space-y-2">
              <p className="text-xs text-green-600 font-medium">✓ Brief fields populated from AI suggestions</p>
              {aiResult.clarificationQuestions.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-semibold text-amber-700 mb-1.5">
                    <AlertCircle size={12} className="inline mr-1" />
                    Clarification needed:
                  </p>
                  <ul className="space-y-1">
                    {aiResult.clarificationQuestions.map((q, i) => (
                      <li key={i} className="text-xs text-amber-600">• {q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <div className="space-y-5">
        {/* Core */}
        <FormSection title="Campaign Overview">
          <div className="form-group">
            <label htmlFor="brief-title" className="label">Brief Title *</label>
            <input
              id="brief-title"
              type="text"
              className={cn('input', errors.title && 'input-error')}
              placeholder="e.g. Q1 Brand Film — Product Launch"
              value={brief.title}
              onChange={(e) => update('title', e.target.value)}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="brief-objective" className="label">Objective *</label>
            <textarea
              id="brief-objective"
              className={cn('input min-h-[80px] resize-none', errors.objective && 'input-error')}
              placeholder="What do you want this content to achieve?"
              value={brief.objective}
              onChange={(e) => update('objective', e.target.value)}
            />
            {errors.objective && <p className="text-xs text-red-500 mt-1">{errors.objective}</p>}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="brief-audience" className="label">Target Audience *</label>
              <input
                id="brief-audience"
                type="text"
                className={cn('input', errors.targetAudience && 'input-error')}
                placeholder="e.g. Millennials 25–38, sustainability-focused"
                value={brief.targetAudience}
                onChange={(e) => update('targetAudience', e.target.value)}
              />
              {errors.targetAudience && <p className="text-xs text-red-500 mt-1">{errors.targetAudience}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="brief-message" className="label">Key Message *</label>
              <input
                id="brief-message"
                type="text"
                className={cn('input', errors.keyMessage && 'input-error')}
                placeholder="e.g. Luxury without compromise"
                value={brief.keyMessage}
                onChange={(e) => update('keyMessage', e.target.value)}
              />
              {errors.keyMessage && <p className="text-xs text-red-500 mt-1">{errors.keyMessage}</p>}
            </div>
          </div>
        </FormSection>

        {/* Content Specs */}
        <FormSection title="Content Specifications">
          <div className="form-group">
            <label htmlFor="brief-type" className="label">Content Type *</label>
            <select
              id="brief-type"
              className="input"
              value={brief.contentType}
              onChange={(e) => update('contentType', e.target.value as ContentCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Aspect Ratios</label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <ToggleChip
                  key={ar}
                  label={ar}
                  active={(brief.aspectRatios ?? []).includes(ar)}
                  onClick={() => toggleAspectRatio(ar)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Required Output Formats</label>
            <div className="flex flex-wrap gap-2">
              {OUTPUT_FORMATS.map((fmt) => (
                <ToggleChip
                  key={fmt}
                  label={fmt.toUpperCase()}
                  active={(brief.requiredOutputFormats ?? []).includes(fmt)}
                  onClick={() => toggleFormat(fmt)}
                />
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label htmlFor="brief-resolution" className="label">Resolution</label>
              <select
                id="brief-resolution"
                className="input"
                value={brief.resolution}
                onChange={(e) => update('resolution', e.target.value)}
              >
                {RESOLUTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="brief-duration" className="label">Duration (seconds)</label>
              <input
                id="brief-duration"
                type="number"
                className="input"
                placeholder="e.g. 60"
                value={brief.durationSeconds ?? ''}
                onChange={(e) => update('durationSeconds', Number(e.target.value) || undefined)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="brief-revisions" className="label">Revision Rounds</label>
              <input
                id="brief-revisions"
                type="number"
                className="input"
                min={0}
                max={10}
                value={brief.revisionRounds ?? 3}
                onChange={(e) => update('revisionRounds', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNELS.map((ch) => (
                <ToggleChip
                  key={ch}
                  label={ch.replace('_', ' ')}
                  active={(brief.channels ?? []).includes(ch)}
                  onClick={() => toggleChannel(ch)}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="label">Style Notes</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Describe the visual style, mood, references, tone…"
              value={brief.styleNotes}
              onChange={(e) => update('styleNotes', e.target.value)}
            />
          </div>

          {/* Deliverables */}
          <div className="form-group">
            <label className="label">Deliverables</label>
            <div className="space-y-2">
              {(brief.deliverables ?? []).map((del, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    className="input"
                    placeholder={`Deliverable ${i + 1}`}
                    value={del}
                    onChange={(e) => updateDeliverable(i, e.target.value)}
                    aria-label={`Deliverable ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeDeliverable(i)}
                    className="btn-ghost btn-sm text-red-400"
                    aria-label={`Remove deliverable ${i + 1}`}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addDeliverable} className="btn-ghost btn-sm mt-2 text-electric-600">
              <Plus size={14} />
              Add deliverable
            </button>
          </div>
        </FormSection>

        {/* Commercial Terms */}
        <FormSection title="Commercial & Rights Terms">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="brief-territory" className="label">Territory *</label>
              <input
                id="brief-territory"
                type="text"
                className={cn('input', errors.territory && 'input-error')}
                placeholder="e.g. worldwide, US only"
                value={brief.territory}
                onChange={(e) => update('territory', e.target.value)}
              />
              {errors.territory && <p className="text-xs text-red-500 mt-1">{errors.territory}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="brief-license" className="label">License Duration *</label>
              <select
                id="brief-license"
                className={cn('input', errors.licenseDuration && 'input-error')}
                value={brief.licenseDuration}
                onChange={(e) => update('licenseDuration', e.target.value)}
              >
                <option value="perpetual">Perpetual</option>
                <option value="5 years">5 years</option>
                <option value="3 years">3 years</option>
                <option value="2 years">2 years</option>
                <option value="1 year">1 year</option>
                <option value="6 months">6 months</option>
              </select>
              {errors.licenseDuration && <p className="text-xs text-red-500 mt-1">{errors.licenseDuration}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="brief-budget" className="label">Budget (USD) *</label>
              <input
                id="brief-budget"
                type="number"
                className={cn('input', errors.budget && 'input-error')}
                placeholder="5000"
                min={0}
                value={brief.budget || ''}
                onChange={(e) => update('budget', Number(e.target.value))}
              />
              {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
            </div>
            <div className="form-group">
              <label htmlFor="brief-deadline" className="label">Deadline *</label>
              <input
                id="brief-deadline"
                type="date"
                className={cn('input', errors.deadline && 'input-error')}
                value={brief.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => update('deadline', e.target.value)}
              />
              {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Boolean toggles */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { field: 'exclusivity' as const, label: 'Exclusivity required' },
              { field: 'paidMedia' as const, label: 'Paid media use' },
              { field: 'sourceFilesRequired' as const, label: 'Source files required' },
              { field: 'mandatoryAvailability' as const, label: 'Mandatory availability' },
            ].map(({ field, label }) => (
              <label key={field} className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  className="rounded accent-electric-600"
                  checked={Boolean(brief[field])}
                  onChange={(e) => update(field, e.target.checked)}
                />
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </label>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="brief-tpa" className="label">Third-party Asset Constraints</label>
            <textarea
              id="brief-tpa"
              className="input min-h-[60px] resize-none"
              placeholder="e.g. No stock footage. All AI-generated content must be disclosed."
              value={brief.thirdPartyAssetConstraints}
              onChange={(e) => update('thirdPartyAssetConstraints', e.target.value)}
            />
          </div>
        </FormSection>

        {/* References */}
        <FormSection title="References">
          <div className="space-y-3">
            {(brief.references ?? []).map((ref, i) => (
              <div key={ref.id} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="url"
                    className="input"
                    placeholder="https://example.com/reference"
                    value={ref.url ?? ''}
                    onChange={(e) => {
                      const refs = [...(brief.references ?? [])];
                      refs[i] = { ...refs[i], url: e.target.value };
                      update('references', refs);
                    }}
                  />
                  <input
                    type="text"
                    className="input"
                    placeholder="Describe this reference…"
                    value={ref.description}
                    onChange={(e) => {
                      const refs = [...(brief.references ?? [])];
                      refs[i] = { ...refs[i], description: e.target.value };
                      update('references', refs);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => update('references', (brief.references ?? []).filter((_, idx) => idx !== i))}
                  className="btn-ghost btn-sm text-red-400 mt-1"
                  aria-label="Remove reference"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={addReference} className="btn-ghost btn-sm text-electric-600">
            <Plus size={14} />
            Add reference
          </button>
        </FormSection>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button onClick={handleSaveDraft} className="btn-secondary flex-1 sm:flex-none">
            <Save size={16} />
            Save as Draft
          </button>
          <button onClick={handlePublish} className="btn-primary flex-1 sm:flex-none">
            <Send size={16} />
            Publish Brief
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <p className="font-semibold mb-1">Please fix the following errors:</p>
            <ul className="space-y-0.5">
              {Object.values(errors).filter(Boolean).map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
