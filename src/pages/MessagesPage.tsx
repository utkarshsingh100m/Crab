import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Link } from 'react-router-dom';
import {
  Search,
  Send,
  MessageSquare,
  Briefcase,
  Calendar,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  ArrowRight,
  User,
} from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '../lib/utils';
import type { Message, Campaign } from '../types';

export function MessagesPage() {
  const { currentUser, campaigns, creators, briefs, sendMessage } = useAppStore();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');
  const [inputText, setInputText] = useState('');

  // Get user's relevant campaigns
  const userCampaigns = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'creator') {
      const myCreator = creators.find((c) => c.userId === currentUser.id);
      return campaigns.filter((c) => c.creatorId === myCreator?.id || c.creatorId === 'creator-1');
    } else {
      return campaigns.filter((c) => c.brandId === currentUser.id || c.brandId === 'user-brand-1');
    }
  }, [campaigns, creators, currentUser]);

  // Fallback to all campaigns if user has none in demo mode
  const effectiveCampaigns = userCampaigns.length > 0 ? userCampaigns : campaigns;

  // Filter campaigns by tab & search
  const filteredCampaigns = useMemo(() => {
    return effectiveCampaigns.filter((c) => {
      if (filterTab === 'active' && c.status !== 'active') return false;
      if (filterTab === 'completed' && c.status !== 'completed') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesMsg = c.messages.some((m) => m.content.toLowerCase().includes(q));
        return matchesTitle || matchesMsg;
      }
      return true;
    });
  }, [effectiveCampaigns, filterTab, searchQuery]);

  // Select campaign (default to first)
  const activeCampaign = useMemo(() => {
    if (selectedCampaignId) {
      const found = effectiveCampaigns.find((c) => c.id === selectedCampaignId);
      if (found) return found;
    }
    return filteredCampaigns[0] ?? effectiveCampaigns[0] ?? null;
  }, [selectedCampaignId, effectiveCampaigns, filteredCampaigns]);

  // Associated creator and brief
  const activeCreator = useMemo(() => {
    if (!activeCampaign) return null;
    return creators.find((c) => c.id === activeCampaign.creatorId) ?? null;
  }, [activeCampaign, creators]);

  const activeBrief = useMemo(() => {
    if (!activeCampaign) return null;
    return briefs.find((b) => b.id === activeCampaign.briefId) ?? null;
  }, [activeCampaign, briefs]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeCampaign || !currentUser) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      campaignId: activeCampaign.id,
      senderId: currentUser.id,
      senderName: currentUser.displayName,
      content: inputText.trim(),
      sentAt: new Date().toISOString(),
    };

    sendMessage(activeCampaign.id, newMsg);
    setInputText('');
  };

  const activeMilestone = activeCampaign?.milestones.find((m) => m.status === 'in_progress' || m.status === 'submitted') || activeCampaign?.milestones[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-black text-[#1C1613] tracking-tight">Messages</h1>
          <p className="text-sm text-[#78716C] mt-0.5">
            Direct communication, milestone updates, and feedback for your active commercial briefs.
          </p>
        </div>
        {activeCampaign && (
          <Link
            to={`/campaign/${activeCampaign.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#EAE4DC] rounded-xl text-xs font-semibold text-[#1C1613] hover:bg-stone-50 transition-colors shadow-sm self-start sm:self-auto"
          >
            <Briefcase size={14} className="text-[#E65D2E]" />
            <span>View Campaign Milestones & Escrow</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Main Container */}
      <div className="bg-white border border-[#EAE4DC] rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col md:flex-row min-h-0">
        {/* Left: Conversations sidebar */}
        <div className="w-full md:w-80 lg:w-96 border-r border-[#EAE4DC] flex flex-col shrink-0 bg-[#FAF7F2]/50">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-[#EAE4DC] bg-white space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages & briefs..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-[#EAE4DC] rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E65D2E]/20 focus:border-[#E65D2E]"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg text-xs font-medium text-[#78716C]">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1 rounded-md text-center transition-colors ${
                  filterTab === 'all' ? 'bg-white text-[#1C1613] shadow-xs font-semibold' : 'hover:text-[#1C1613]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterTab('active')}
                className={`flex-1 py-1 rounded-md text-center transition-colors ${
                  filterTab === 'active' ? 'bg-white text-[#1C1613] shadow-xs font-semibold' : 'hover:text-[#1C1613]'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterTab('completed')}
                className={`flex-1 py-1 rounded-md text-center transition-colors ${
                  filterTab === 'completed' ? 'bg-white text-[#1C1613] shadow-xs font-semibold' : 'hover:text-[#1C1613]'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#EAE4DC]/60">
            {filteredCampaigns.length === 0 ? (
              <div className="p-8 text-center text-[#78716C]">
                <MessageSquare size={32} className="mx-auto mb-2 text-stone-300" />
                <p className="text-xs font-medium">No conversations found</p>
              </div>
            ) : (
              filteredCampaigns.map((camp) => {
                const isSelected = activeCampaign?.id === camp.id;
                const lastMsg = camp.messages[camp.messages.length - 1];
                const campCreator = creators.find((c) => c.id === camp.creatorId);
                const otherPartyName = currentUser?.role === 'creator' ? 'Aurora Brand Team' : (campCreator?.displayName ?? 'Creator');
                const otherPartyAvatar = currentUser?.role === 'creator' 
                  ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah-chen'
                  : (campCreator?.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${camp.creatorId}`);

                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3.5 hover:bg-stone-50/80 ${
                      isSelected ? 'bg-white ring-1 ring-[#E65D2E]/20 border-l-4 border-l-[#E65D2E]' : ''
                    }`}
                  >
                    <img
                      src={otherPartyAvatar}
                      alt={otherPartyName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#EAE4DC] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#1C1613] truncate">{otherPartyName}</span>
                        {lastMsg && (
                          <span className="text-[10px] text-[#9C8F86] shrink-0">
                            {formatRelativeTime(lastMsg.sentAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#E65D2E] truncate mb-1">
                        {camp.title}
                      </p>
                      {lastMsg ? (
                        <p className="text-[11px] text-[#78716C] line-clamp-1">
                          <span className="font-semibold text-stone-600">{lastMsg.senderName.split(' ')[0]}: </span>
                          {lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#9C8F86] italic">Project created. Start the chat!</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Selected Conversation View */}
        {activeCampaign ? (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-[#EAE4DC] flex items-center justify-between gap-4 bg-stone-50/50 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={
                    currentUser?.role === 'creator'
                      ? 'https://api.dicebear.com/9.x/avataaars/svg?seed=sarah-chen'
                      : (activeCreator?.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${activeCampaign.creatorId}`)
                  }
                  alt="Contact"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#EAE4DC] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-[#1C1613] truncate">
                      {currentUser?.role === 'creator' ? 'Sarah Chen (Aurora Brand Manager)' : activeCreator?.displayName}
                    </h2>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                  </div>
                  <p className="text-xs text-[#78716C] truncate">
                    Campaign: <span className="font-semibold text-[#1C1613]">{activeCampaign.title}</span> · {formatCurrency(activeCampaign.agreedBudget)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/campaign/${activeCampaign.id}`}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#EAE4DC] rounded-lg text-xs font-medium text-[#1C1613] hover:bg-stone-50 transition-colors shadow-xs"
                >
                  <ExternalLink size={13} />
                  <span>Escrow & Deliverables</span>
                </Link>
              </div>
            </div>

            {/* Campaign Milestone Alert Banner */}
            {activeMilestone && (
              <div className="px-6 py-2.5 bg-[#FAF7F2] border-b border-[#EAE4DC] flex items-center justify-between gap-3 text-xs shrink-0">
                <div className="flex items-center gap-2 text-[#78716C] min-w-0">
                  <Clock size={14} className="text-[#E65D2E] shrink-0" />
                  <span className="truncate">
                    Current Milestone: <strong className="text-[#1C1613]">{activeMilestone.title}</strong> (Due {formatDate(activeMilestone.dueDate)})
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#FDF1EC] text-[#E65D2E] border border-[#F8D8CB] shrink-0">
                  {activeMilestone.status.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Welcome notice */}
              <div className="text-center my-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#9C8F86] bg-stone-100 px-3 py-1 rounded-full">
                  <ShieldCheck size={12} className="text-emerald-600" />
                  Messages in this workspace are protected under CRAB commercial confidentiality terms
                </span>
              </div>

              {activeCampaign.messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id || (currentUser?.role === 'creator' && msg.senderId.includes('creator'));

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isMe && (
                      <div className="w-7 h-7 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-xs font-bold text-stone-600 shrink-0">
                        {msg.senderName.charAt(0)}
                      </div>
                    )}
                    <div className={`max-w-[75%] sm:max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-[#E65D2E] text-white rounded-br-xs'
                        : 'bg-stone-100 text-[#1C1613] border border-[#EAE4DC] rounded-bl-xs'
                    }`}>
                      <div className={`text-[10px] font-semibold mb-1 ${isMe ? 'text-white/80' : 'text-[#78716C]'}`}>
                        {msg.senderName}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`text-[9px] mt-1.5 text-right ${isMe ? 'text-white/70' : 'text-stone-400'}`}>
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-[#EAE4DC] bg-white flex items-center gap-2.5 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message or project update..."
                className="flex-1 px-4 py-2.5 bg-stone-50 border border-[#EAE4DC] rounded-xl text-xs placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#E65D2E]/20 focus:border-[#E65D2E]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 bg-[#E65D2E] text-white rounded-xl text-xs font-semibold hover:bg-[#C94B27] disabled:opacity-40 disabled:hover:bg-[#E65D2E] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#78716C]">
            <div>
              <MessageSquare size={48} className="mx-auto mb-3 text-stone-300" />
              <h3 className="text-base font-bold text-[#1C1613]">No Conversation Selected</h3>
              <p className="text-xs text-[#78716C] mt-1">Select an active brief or project on the left to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
