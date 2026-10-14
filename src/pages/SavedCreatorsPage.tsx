import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CreatorCard } from '../components/ui/CreatorCard';
import { Bookmark, Search, Trash2, Edit3, Check, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export function SavedCreatorsPage() {
  const { savedCreators, creators, currentUser, unsaveCreator, saveCreator } = useAppStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const brandId = currentUser?.id || 'brand-1';
  const savedEntries = savedCreators.filter((s) => s.brandId === brandId);
  const savedCreatorIds = new Set(savedEntries.map((s) => s.creatorId));
  const shortlistedCreators = creators.filter((c) => savedCreatorIds.has(c.id));

  const handleStartEditNote = (creatorId: string, currentNote?: string) => {
    setEditingId(creatorId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = (creatorId: string) => {
    saveCreator(brandId, creatorId, noteText);
    setEditingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="text-[#E65D2E]" size={24} />
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C1613]">Saved Creators & Shortlist</h1>
          </div>
          <p className="text-[#78716C] text-sm mt-1">
            Keep track of promising AI artists, note campaign ideas, and compare profile scores.
          </p>
        </div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#EAE4DC] hover:border-[#1C1613] bg-white rounded-full text-xs font-semibold text-[#1C1613] shadow-xs transition-colors self-start sm:self-center"
        >
          <Search size={14} /> Browse More Creators
        </Link>
      </div>

      {shortlistedCreators.length === 0 ? (
        <div className="bg-white border border-[#EAE4DC] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#E65D2E] flex items-center justify-center mx-auto mb-4">
            <Bookmark size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#1C1613]">Your shortlist is empty</h2>
          <p className="text-[#78716C] text-sm mt-2 max-w-md mx-auto">
            You haven't saved any creators yet. Explore the marketplace to find AI filmmakers, animators, and generative artists.
          </p>
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E65D2E] hover:bg-[#C94B27] text-white rounded-full text-sm font-semibold shadow-xs transition-colors mt-6"
          >
            <Search size={16} /> Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlistedCreators.map((creator) => {
              const savedMeta = savedEntries.find((s) => s.creatorId === creator.id);

              return (
                <div key={creator.id} className="flex flex-col">
                  <CreatorCard creator={creator} />
                  
                  {/* Custom Shortlist Note */}
                  <div className="mt-2 p-3 bg-white border border-[#EAE4DC] rounded-xl shadow-xs text-xs">
                    <div className="flex items-center justify-between text-stone-400 mb-1 font-medium">
                      <span>Internal Brand Note</span>
                      {editingId === creator.id ? (
                        <button
                          onClick={() => handleSaveNote(creator.id)}
                          className="text-[#E65D2E] hover:text-[#C94B27] flex items-center gap-1 font-bold"
                        >
                          <Check size={12} /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartEditNote(creator.id, savedMeta?.notes)}
                          className="text-stone-400 hover:text-stone-700 flex items-center gap-1"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                      )}
                    </div>
                    {editingId === creator.id ? (
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add pitch idea or role suitability…"
                        className="w-full p-2 text-xs border border-[#EAE4DC] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E65D2E]"
                        rows={2}
                      />
                    ) : (
                      <p className="text-stone-600 italic">
                        {savedMeta?.notes || 'No notes added yet. Click edit to add note.'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
