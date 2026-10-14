import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ImagePlus,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import type { PortfolioItem, ContentCategory, OutputFormat, AspectRatio } from '../types';

export function CreatorPortfolioEditor() {
  const { creators, currentUser, updateCreatorProfile, recalculateScore } = useAppStore();

  const creator = creators.find((c) => c.userId === currentUser?.id) || creators[0];

  const [items, setItems] = useState<PortfolioItem[]>(creator.portfolioItems || []);
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for new portfolio item
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [category, setCategory] = useState<ContentCategory>('ai_film');
  const [role, setRole] = useState('Director & Prompt Engineer');
  const [skills, setSkills] = useState('Prompt Engineering, Motion Synthesis');
  const [toolsUsed, setToolsUsed] = useState('Runway Gen-3, Midjourney v6, DaVinci Resolve');
  const [workflowText, setWorkflowText] = useState('1. Character consistency via custom LoRA\n2. Keyframe generation in Midjourney\n3. Motion extrapolation with Runway Gen-3');
  const [commercialUse, setCommercialUse] = useState(true);
  const [sourceFilesIncluded, setSourceFilesIncluded] = useState(true);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    const parsedSteps = workflowText.split('\n').filter(Boolean).map((stepLine, idx) => ({
      step: idx + 1,
      tool: toolsUsed.split(',')[0]?.trim() || 'AI Generator',
      description: stepLine,
      outputType: 'Render',
    }));

    const newItem: PortfolioItem = {
      id: `portfolio-${Date.now()}`,
      creatorId: creator.id,
      title: title.trim(),
      description: description.trim(),
      role: role.trim(),
      category,
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      tools: toolsUsed.split(',').map((s) => s.trim()).filter(Boolean),
      mediaUrl: mediaUrl.trim(),
      mediaType: 'image',
      thumbnailUrl: mediaUrl.trim(),
      outputFormats: ['mp4', 'mov'] as OutputFormat[],
      aspectRatios: ['16:9', '9:16'] as AspectRatio[],
      workflowSteps: parsedSteps,
      rights: {
        commercialUse,
        exclusivity: false,
        licenseDuration: 'perpetual',
        territory: 'worldwide',
        sourceFilesIncluded,
        thirdPartyAssets: false,
        disclosureStatement: 'Generated with licensed AI foundation models and custom prompts.',
      },
      evidenceStatus: 'evidence_submitted',
      projectDate: '2026-10-01',
      featured: true,
      viewCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPortfolio = [newItem, ...items];
    setItems(updatedPortfolio);

    // Update in store and recalculate score
    updateCreatorProfile(creator.id, { portfolioItems: updatedPortfolio });
    recalculateScore(creator.id);

    setIsAdding(false);
    setTitle('');
    setDescription('');
    setMediaUrl('');
    setSuccessMessage('New portfolio case study added! Profile score recalculated.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    updateCreatorProfile(creator.id, { portfolioItems: updated });
    recalculateScore(creator.id);
    setSuccessMessage('Portfolio item removed. Score updated.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <ImagePlus className="text-[#E65D2E]" size={24} />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1613]">Portfolio & Case Studies</h1>
          </div>
          <p className="text-[#78716C] text-sm mt-1">
            Showcase your generative AI craft, transparent prompt workflows, and verified commercial readiness.
          </p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E65D2E] hover:bg-[#C94B27] text-white rounded-full text-sm font-semibold shadow-xs transition-colors self-start sm:self-center"
          >
            <Plus size={16} /> Add Case Study
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-teal-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Add New Item Modal / Form */}
      {isAdding && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE4DC] mb-8 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#E65D2E]" size={20} />
              <h2 className="text-lg font-bold text-[#1C1613]">Add Generative AI Case Study</h2>
            </div>
            <button
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleAddItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Noir Hero Film"
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Media Direct URL (Image / Video) *
                </label>
                <input
                  type="url"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Description & Creative Intent
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the aesthetic, creative objectives, and client challenge…"
                className="input w-full"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ContentCategory)}
                  className="input w-full"
                >
                  <option value="ai_film">AI Film & Narrative</option>
                  <option value="animation">3D Animation & Stylized</option>
                  <option value="product_visuals">Product Visuals & Commercials</option>
                  <option value="social_ads">Social First & Short Form</option>
                  <option value="motion_graphics">Motion Design & Titles</option>
                  <option value="concept_art">Concept Art & Worldbuilding</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. AI Director"
                  className="input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Tools & Models Used (comma-separated)
                </label>
                <input
                  type="text"
                  value={toolsUsed}
                  onChange={(e) => setToolsUsed(e.target.value)}
                  placeholder="Sora, Runway Gen-3, Midjourney v6..."
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Prompt Engineering, LoRA Training, Editing..."
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                Transparent Workflow Steps (one per line)
              </label>
              <textarea
                value={workflowText}
                onChange={(e) => setWorkflowText(e.target.value)}
                className="input w-full font-mono text-xs"
                rows={4}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-teal-600" />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Commercial Clearance Granted</span>
                  <span className="text-[11px] text-slate-500">I declare full rights for brand commercial use</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={commercialUse}
                onChange={(e) => setCommercialUse(e.target.checked)}
                className="w-4 h-4 text-electric-600 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="btn btn-outline text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-xs inline-flex items-center gap-2"
              >
                <Plus size={14} /> Publish to Portfolio (+Points)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl overflow-hidden border border-[#EAE4DC] bg-white flex flex-col shadow-sm hover:border-[#E65D2E]/40 transition-all">
            <div className="relative h-48 bg-stone-100 overflow-hidden">
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                {item.rights.commercialUse ? 'Commercial Ready' : 'Personal Spec'}
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#E65D2E] uppercase tracking-wider">
                    {item.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {item.evidenceStatus.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1C1613] mb-1">{item.title}</h3>
                <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {item.tools.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-[#FAF7F2] text-[#78716C] border border-[#EAE4DC] rounded-md font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  {item.workflowSteps.length} workflow steps
                </span>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                  title="Delete item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
