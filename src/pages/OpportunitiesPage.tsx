import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import { calculateBriefMatchScore } from '../lib/ranking';
import type { Proposal } from '../types';

export function OpportunitiesPage() {
  const { briefs, creators, currentUser, proposals, submitProposal } = useAppStore();

  const creator = creators.find((c) => c.userId === currentUser?.id) || creators[0];
  const publishedBriefs = briefs.filter((b) => b.status === 'published');

  const [selectedBriefId, setSelectedBriefId] = useState<string | null>(null);
  const [proposalRate, setProposalRate] = useState<number>(3500);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [workflowPlan, setWorkflowPlan] = useState<string>('');
  const [submittedBriefIds, setSubmittedBriefIds] = useState<Set<string>>(
    new Set(proposals.filter((p) => p.creatorId === creator.id).map((p) => p.briefId))
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeBrief = briefs.find((b) => b.id === selectedBriefId);

  const handleOpenProposal = (briefId: string, defaultBudget: number) => {
    setSelectedBriefId(briefId);
    setProposalRate(defaultBudget);
    setCoverLetter(
      `Hi! I would love to direct this AI project. My experience in ${creator.categories.join(', ')} and workflow with ${creator.tools.join(', ')} aligns directly with your visual requirements.`
    );
    setWorkflowPlan('1. Concept lock and styleframe batch\n2. Motion extrapolation and upscaling\n3. Color grade, audio sync, and commercial master');
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBrief) return;

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      briefId: activeBrief.id,
      creatorId: creator.id,
      coverLetter: coverLetter.trim(),
      proposedBudget: Number(proposalRate),
      proposedDeadline: new Date(Date.now() + deliveryDays * 86400000).toISOString(),
      deliverables: activeBrief.deliverables,
      workflowDescription: workflowPlan.trim(),
      status: 'pending',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    submitProposal(newProposal);
    setSubmittedBriefIds((prev) => new Set(prev).add(activeBrief.id));
    setSelectedBriefId(null);
    setSuccessMessage(`Proposal submitted to "${activeBrief.title}"! The brand has been notified.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="text-[#E65D2E]" size={24} />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1613]">Brand Opportunities</h1>
          </div>
          <p className="text-[#78716C] text-sm mt-1">
            Active production briefs matched to your generative toolstack, profile score, and style specializations.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="text-teal-600" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {/* Briefs List */}
      <div className="space-y-6">
        {publishedBriefs.map((brief) => {
          const matchResult = calculateBriefMatchScore(creator, brief);
          const hasApplied = submittedBriefIds.has(brief.id);

          return (
            <div
              key={brief.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE4DC] hover:border-[#E65D2E]/40 transition-all shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#FDF1EC] text-[#E65D2E]">
                      {brief.contentType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[#78716C] font-medium">
                      Style: <strong className="text-[#1C1613]">{brief.styleNotes || 'Commercial'}</strong>
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#1C1613] mb-2">{brief.title}</h2>
                  <p className="text-sm text-[#78716C] line-clamp-2 mb-4">{brief.objective}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE4DC] text-xs">
                    <div>
                      <span className="text-[#78716C] block font-medium">Budget</span>
                      <span className="text-sm font-bold text-[#1C1613]">{formatCurrency(brief.budget)}</span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block font-medium">Deadline</span>
                      <span className="text-sm font-bold text-[#1C1613]">{formatDate(brief.deadline)}</span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block font-medium">Required Formats</span>
                      <span className="font-bold text-[#1C1613]">{brief.aspectRatios.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-[#78716C] block font-medium">Rights Territory</span>
                      <span className="font-bold text-[#1C1613]">{brief.territory}</span>
                    </div>
                  </div>
                </div>

                {/* Match Box & CTA */}
                <div className="flex flex-col items-center lg:items-end justify-between self-stretch shrink-0 gap-4">
                  <div className="text-center lg:text-right">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#E65D2E] text-xs font-bold mb-1">
                      <Sparkles size={13} /> {matchResult.score}% Brief Match
                    </div>
                    <div className="text-[11px] text-[#78716C] max-w-[180px]">
                      {matchResult.factors[0] || 'Matches your tooling & portfolio'}
                    </div>
                  </div>

                  {hasApplied ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium cursor-default">
                      <CheckCircle2 size={14} /> Proposal Submitted
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenProposal(brief.id, brief.budget)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E65D2E] hover:bg-[#C94B27] text-white rounded-full text-xs font-semibold shadow-xs transition-colors"
                    >
                      Pitch Proposal <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Proposal Modal */}
      {selectedBriefId && activeBrief && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="card max-w-2xl w-full bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Submit Pitch Proposal</h3>
                <p className="text-xs text-slate-500 mt-0.5">Brief: {activeBrief.title}</p>
              </div>
              <button
                onClick={() => setSelectedBriefId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProposal} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Proposed Budget (USD)
                  </label>
                  <input
                    type="number"
                    required
                    value={proposalRate}
                    onChange={(e) => setProposalRate(Number(e.target.value))}
                    className="input w-full"
                  />
                  <span className="text-[10px] text-slate-400">Brief budget: {formatCurrency(activeBrief.budget)}</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                    Estimated Delivery Time
                  </label>
                  <select
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    className="input w-full"
                  >
                    <option value={7}>7 Days (Fast turnaround)</option>
                    <option value={14}>14 Days (Standard)</option>
                    <option value={21}>21 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Cover Letter / Creative Pitch
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="input w-full"
                  placeholder="Explain why your generative workflow and artistic vision fit this brief…"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  Proposed AI Pipeline & Production Steps
                </label>
                <textarea
                  rows={3}
                  required
                  value={workflowPlan}
                  onChange={(e) => setWorkflowPlan(e.target.value)}
                  className="input w-full font-mono text-xs"
                  placeholder="Outline step-by-step tools, prompt verification, and delivery milestones…"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck size={14} className="text-teal-600" /> Commercial Guarantee
                </div>
                <p className="text-[11px] text-slate-500">
                  By submitting, you confirm you will provide transparent workflow logs and only generate compliant commercial deliverables.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBriefId(null)}
                  className="btn btn-outline text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-xs inline-flex items-center gap-2"
                >
                  <Send size={14} /> Send Proposal to Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
