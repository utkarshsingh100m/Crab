import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  MessageSquare,
  Send,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  User,
  Briefcase,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';
import type { MilestoneStatus, CampaignStatus, Message, Campaign, Brief, CreatorProfile, Milestone } from '../types';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, briefs, creators, currentUser, updateMilestone, sendMessage, updateCampaign } = useAppStore();

  const campaign = campaigns.find((c) => c.id === id);
  const brief = campaign ? briefs.find((b) => b.id === campaign.briefId) : null;
  const creator = campaign ? creators.find((c) => c.id === campaign.creatorId) : null;

  const [activeTab, setActiveTab] = useState<'milestones' | 'messages' | 'brief' | 'terms'>('milestones');
  const [newMessage, setNewMessage] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!campaign) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Campaign Not Found</h2>
        <p className="text-slate-500 mt-2">The campaign you are looking for does not exist.</p>
        <Link to="/brand/dashboard" className="btn btn-primary mt-4 inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const completedMilestones = campaign.milestones.filter((m) => m.status === 'approved').length;
  const progressPercent = Math.round((completedMilestones / Math.max(campaign.milestones.length, 1)) * 100);

  const handleMilestoneAction = (milestoneId: string, status: MilestoneStatus) => {
    updateMilestone(campaign.id, milestoneId, status);
    setActionSuccess(`Milestone updated to ${status.replace('_', ' ')}!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg: Message = {
      id: `msg-${Date.now()}`,
      campaignId: campaign.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: newMessage.trim(),
      sentAt: new Date().toISOString(),
    };

    sendMessage(campaign.id, msg);
    setNewMessage('');
  };

  const handleStatusChange = (newStatus: CampaignStatus) => {
    updateCampaign(campaign.id, { status: newStatus });
    setActionSuccess(`Campaign status changed to ${newStatus.replace('_', ' ')}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-sm text-[#78716C]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 hover:text-[#1C1613] transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span>/</span>
          <span className="font-semibold text-[#1C1613]">{campaign.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase bg-[#FDF1EC] text-[#E65D2E] border border-[#F8D8CB]/60">
            {campaign.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span className="text-sm font-medium">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-xs text-emerald-600 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Campaign Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 mb-8 border border-[#EAE4DC] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-stone-100">
          <div>
            <h1 className="text-3xl sm:text-4xl font-normal text-[#1C1613] font-serif-display">{campaign.title}</h1>
            <p className="text-[#78716C] text-sm mt-1">
              Started {formatDate(campaign.startDate)} · Target {formatDate(campaign.endDate)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-[#78716C] block font-medium">Agreed Escrow Budget</span>
              <span className="text-2xl font-bold text-[#1C1613]">{formatCurrency(campaign.agreedBudget)}</span>
            </div>
            {creator && (
              <Link
                to={`/creator/${creator.id}`}
                className="flex items-center gap-3 p-2 pr-4 rounded-xl bg-[#FAF7F2] hover:bg-stone-100 border border-[#EAE4DC] transition-colors"
              >
                <img
                  src={creator.avatarUrl}
                  alt={creator.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="text-xs font-bold text-[#1C1613]">{creator.displayName}</div>
                  <div className="text-[11px] text-[#78716C]">View Portfolio & Score</div>
                </div>
                <ExternalLink size={14} className="text-[#78716C]" />
              </Link>
            )}
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-semibold text-[#1C1613]">Campaign Milestone Progress</span>
            <span className="font-bold text-[#E65D2E]">
              {progressPercent}% ({completedMilestones} of {campaign.milestones.length} approved)
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E65D2E] to-amber-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick status toggle for demo */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 mr-2">Phase Control:</span>
            {(['active', 'completed', 'on_hold', 'cancelled'] as CampaignStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  campaign.status === st
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-8">
        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'milestones'
              ? 'border-[#E65D2E] text-[#E65D2E]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1613]'
          }`}
        >
          <CheckCircle2 size={16} /> Milestones &amp; Escrow ({campaign.milestones.length})
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'messages'
              ? 'border-[#E65D2E] text-[#E65D2E]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1613]'
          }`}
        >
          <MessageSquare size={16} /> Direct Messages ({campaign.messages.length})
        </button>
        <button
          onClick={() => setActiveTab('brief')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'brief'
              ? 'border-[#E65D2E] text-[#E65D2E]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1613]'
          }`}
        >
          <FileText size={16} /> Brief &amp; Deliverables
        </button>
        <button
          onClick={() => setActiveTab('terms')}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'terms'
              ? 'border-[#E65D2E] text-[#E65D2E]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1613]'
          }`}
        >
          <ShieldCheck size={16} /> Commercial Terms
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {campaign.milestones.map((m) => (
            <div
              key={m.id}
              className={`bg-white rounded-2xl p-6 border transition-all ${
                m.status === 'approved'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : m.status === 'submitted'
                  ? 'bg-[#FDF1EC]/40 border-[#E65D2E]/30 shadow-sm'
                  : 'border-[#EAE4DC]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      m.status === 'approved'
                        ? 'bg-teal-600 text-white'
                        : m.status === 'submitted'
                        ? 'bg-electric-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {m.order}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{m.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{m.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} /> Due: {formatDate(m.dueDate)}
                      </span>
                      {m.deliverableUrl && (
                        <a
                          href={m.deliverableUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-electric-600 font-medium hover:underline"
                        >
                          <ExternalLink size={13} /> View Attached Deliverable
                        </a>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium uppercase text-[10px] ${
                          m.status === 'approved'
                            ? 'bg-teal-100 text-teal-800'
                            : m.status === 'submitted'
                            ? 'bg-amber-100 text-amber-800'
                            : m.status === 'revision_requested'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {m.status === 'pending' && (
                    <button
                      onClick={() => handleMilestoneAction(m.id, 'submitted')}
                      className="btn btn-outline text-xs py-1.5"
                    >
                      Submit Draft
                    </button>
                  )}
                  {m.status === 'in_progress' && (
                    <button
                      onClick={() => handleMilestoneAction(m.id, 'submitted')}
                      className="btn btn-outline text-xs py-1.5"
                    >
                      Submit Draft
                    </button>
                  )}
                  {m.status === 'submitted' && (
                    <>
                      <button
                        onClick={() => handleMilestoneAction(m.id, 'revision_requested')}
                        className="btn bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs py-1.5"
                      >
                        Request Revision
                      </button>
                      <button
                        onClick={() => handleMilestoneAction(m.id, 'approved')}
                        className="btn btn-primary text-xs py-1.5 bg-teal-600 hover:bg-teal-700 border-teal-600"
                      >
                        Approve & Release Funds
                      </button>
                    </>
                  )}
                  {m.status === 'revision_requested' && (
                    <button
                      onClick={() => handleMilestoneAction(m.id, 'submitted')}
                      className="btn btn-primary text-xs py-1.5"
                    >
                      Re-submit Deliverable
                    </button>
                  )}
                  {m.status === 'approved' && (
                    <span className="text-xs text-teal-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={16} /> Funds Released
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="card p-6 border border-slate-200 bg-white">
          <div className="h-96 overflow-y-auto mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            {campaign.messages.length === 0 ? (
              <div className="text-center text-slate-400 py-16">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-40" />
                No messages yet. Send a message to coordinate workflow.
              </div>
            ) : (
              campaign.messages.map((msg) => {
                const isMe = currentUser?.id === msg.senderId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-700">
                        {isMe ? 'You' : msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">{formatDate(msg.sentAt)}</span>
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-electric-600 text-white rounded-br-none shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message, prompt feedback, or file links…"
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="btn btn-primary px-5 disabled:opacity-50"
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      )}

      {activeTab === 'brief' && brief && (
        <div className="card p-8 border border-slate-200 bg-white space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">{brief.title}</h2>
            <p className="text-slate-600 mt-2 text-sm">{brief.objective}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Audience & Message</h4>
              <p className="text-sm text-slate-800 font-medium">{brief.targetAudience}</p>
              <p className="text-sm text-slate-600 mt-2 italic">“{brief.keyMessage}”</p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Deliverables</h4>
              <ul className="text-sm text-slate-700 space-y-1">
                {brief.deliverables.map((d, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-electric-600" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Aspect Ratios</span>
              <span className="font-bold text-slate-800">{brief.aspectRatios.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Resolution</span>
              <span className="font-bold text-slate-800">{brief.resolution}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Duration</span>
              <span className="font-bold text-slate-800">{brief.durationSeconds ? `${brief.durationSeconds}s` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Revision Rounds</span>
              <span className="font-bold text-slate-800">{brief.revisionRounds} rounds</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terms' && brief && (
        <div className="card p-8 border border-slate-200 bg-white space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <ShieldCheck size={24} className="text-teal-600" />
            <div>
              <h3 className="text-lg font-bold text-slate-900">Commercial Usage & Rights Agreement</h3>
              <p className="text-xs text-slate-400">Binding parameters established for this campaign engagement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                License Duration
              </span>
              <span className="text-base font-bold text-slate-900">{brief.licenseDuration}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                Territory
              </span>
              <span className="text-base font-bold text-slate-900">{brief.territory}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                Paid Media Rights
              </span>
              <span className="text-base font-bold text-teal-700">
                {brief.paidMedia ? 'Granted (All Paid Ad Formats)' : 'Organic Social Only'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Exclusivity:</span>
              <span className="font-semibold text-slate-800">{brief.exclusivity ? 'Exclusive for category' : 'Non-exclusive'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Source Files / AI Prompts:</span>
              <span className="font-semibold text-slate-800">{brief.sourceFilesRequired ? 'Mandatory Handover' : 'Deliverables Only'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-slate-500">Third-Party IP Constraints:</span>
              <span className="font-semibold text-slate-800">{brief.thirdPartyAssetConstraints || 'Strictly Zero Third-Party IP'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
