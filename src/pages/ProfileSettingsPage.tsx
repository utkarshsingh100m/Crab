import React, { useState, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  User as UserIcon,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  FileText,
  Trash2,
  ExternalLink,
  Building2,
  Sparkles,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  AlertCircle,
  Clock,
  Save,
} from 'lucide-react';
import type { VerificationDocument, AvailabilityStatus } from '../types';

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80';

export function ProfileSettingsPage() {
  const { currentUser, updateCurrentUser, creators, updateCreatorProfile } = useAppStore();

  const isCreator = currentUser?.role === 'creator';
  const creator = isCreator ? creators.find((c) => c.userId === currentUser?.id) || creators[0] : null;

  // File Input Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Profile Photos State
  const [avatarPreview, setAvatarPreview] = useState<string>(
    currentUser?.avatarUrl || creator?.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser?.id || 'sarah'}`
  );
  const [bannerPreview, setBannerPreview] = useState<string>(
    currentUser?.bannerUrl || creator?.bannerUrl || DEFAULT_BANNER
  );

  // Form Fields State
  const [displayName, setDisplayName] = useState(currentUser?.displayName || (isCreator ? 'Kai Nakamura' : 'Sarah Chen'));
  const [email, setEmail] = useState(currentUser?.email || (isCreator ? 'kai@visualsynthesis.ai' : 'sarah@novalabs.io'));
  const [companyName, setCompanyName] = useState(currentUser?.companyName || (isCreator ? 'Visual Synthesis Studio' : 'NovaLabs Studio'));
  const [location, setLocation] = useState(currentUser?.location || creator?.location || (isCreator ? 'Tokyo, Japan' : 'San Francisco, CA'));
  const [website, setWebsite] = useState(currentUser?.website || creator?.website || (isCreator ? 'https://visualsynthesis.ai' : 'https://novalabs.io'));
  const [bio, setBio] = useState(
    currentUser?.bio ||
      creator?.bio ||
      (isCreator
        ? 'Former VFX artist turned AI filmmaker. I craft emotionally resonant brand films and narratives using generative AI pipelines with Sora, Runway Gen-3, and Midjourney.'
        : 'Brand Director at NovaLabs. We commission cutting-edge generative AI commercials and product animations for global brands.')
  );

  // Creator-Specific Fields
  const [tagline, setTagline] = useState(creator?.tagline || 'AI Film Director · Cinematic Storytelling with Sora & Runway');
  const [rateMin, setRateMin] = useState<number>(creator?.rateMin || 2500);
  const [rateMax, setRateMax] = useState<number>(creator?.rateMax || 12000);
  const [availability, setAvailability] = useState<AvailabilityStatus>(creator?.availability || 'available');

  // Verification Documents State
  const [docCategory, setDocCategory] = useState<VerificationDocument['documentType']>('id_proof');
  const [documents, setDocuments] = useState<VerificationDocument[]>(
    currentUser?.verificationDocuments || [
      {
        id: 'doc-1',
        name: isCreator ? 'government_id_kai_nakamura.pdf' : 'business_registration_novalabs.pdf',
        documentType: isCreator ? 'id_proof' : 'business_reg',
        fileSize: '1.8 MB',
        uploadedAt: '2026-09-15',
        status: 'verified',
      },
      {
        id: 'doc-2',
        name: isCreator ? 'commercial_ip_declaration_sora_runway.pdf' : 'corporate_tax_certificate.pdf',
        documentType: isCreator ? 'ip_declaration' : 'business_reg',
        fileSize: '840 KB',
        uploadedAt: '2026-10-01',
        status: 'verified',
      },
    ]
  );
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'pending' | 'unverified'>(
    currentUser?.verificationStatus || 'verified'
  );

  // Feedback State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [docUploadMessage, setDocUploadMessage] = useState<string | null>(null);

  // 1. Handle Profile Photo Upload from Local File
  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      updateCurrentUser({ avatarUrl: result });
      if (creator) {
        updateCreatorProfile(creator.id, { avatarUrl: result });
      }
      triggerSuccess('Profile photo updated from local file!');
    };
    reader.readAsDataURL(file);
  }

  // 2. Handle Background Banner Upload from Local File
  function handleBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBannerPreview(result);
      updateCurrentUser({ bannerUrl: result });
      if (creator) {
        updateCreatorProfile(creator.id, { bannerUrl: result });
      }
      triggerSuccess('Background banner updated from local file!');
    };
    reader.readAsDataURL(file);
  }

  // 3. Handle Verification Document Upload from Local File
  function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const newDoc: VerificationDocument = {
      id: `doc-${Date.now()}`,
      name: file.name,
      documentType: docCategory,
      fileSize: formatSize(file.size),
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'verified', // Instant demo verification
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    setVerificationStatus('verified');
    updateCurrentUser({
      verificationDocuments: updated,
      verificationStatus: 'verified',
    });
    if (creator) {
      updateCreatorProfile(creator.id, {
        verificationDocuments: updated,
        verificationStatus: 'verified',
      });
    }

    setDocUploadMessage(`"${file.name}" uploaded & verified successfully!`);
    setTimeout(() => setDocUploadMessage(null), 4000);
  }

  function handleRemoveDocument(id: string) {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    updateCurrentUser({ verificationDocuments: updated });
    if (creator) {
      updateCreatorProfile(creator.id, { verificationDocuments: updated });
    }
  }

  function triggerSuccess(msg?: string) {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  }

  // 4. Save Personal Data Changes
  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    updateCurrentUser({
      displayName,
      email,
      companyName,
      location,
      website,
      bio,
      avatarUrl: avatarPreview,
      bannerUrl: bannerPreview,
      verificationStatus,
      verificationDocuments: documents,
    });

    if (creator) {
      updateCreatorProfile(creator.id, {
        displayName,
        tagline,
        bio,
        location,
        website,
        rateMin: Number(rateMin),
        rateMax: Number(rateMax),
        availability,
        avatarUrl: avatarPreview,
        bannerUrl: bannerPreview,
        verificationStatus,
        verificationDocuments: documents,
      });
    }

    triggerSuccess();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              Account & Profile Settings
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Manage your personal identity, upload local profile images, and submit verification documents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveProfile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E05D38] hover:bg-[#C94B27] text-white text-sm font-semibold transition shadow-sm hover:shadow"
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-fade-in shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">Profile successfully saved and synchronized across CRAB!</span>
            </div>
            <button onClick={() => setSaveSuccess(false)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* ── CARD 1: Photos & Media (Local File Uploads) ── */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden mb-8">
          {/* Banner Preview Area */}
          <div className="relative h-48 sm:h-64 w-full bg-stone-100 group">
            <img
              src={bannerPreview}
              alt="Profile banner preview"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="px-4 py-2 rounded-full bg-white/95 hover:bg-white text-stone-900 text-xs font-bold shadow-md flex items-center gap-2 transition cursor-pointer"
              >
                <ImageIcon size={14} className="text-[#E05D38]" />
                <span>Upload Local Banner</span>
              </button>
              {bannerPreview !== DEFAULT_BANNER && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerPreview(DEFAULT_BANNER);
                    updateCurrentUser({ bannerUrl: DEFAULT_BANNER });
                    if (creator) updateCreatorProfile(creator.id, { bannerUrl: DEFAULT_BANNER });
                  }}
                  className="px-3 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-medium backdrop-blur-xs transition"
                >
                  Reset Default
                </button>
              )}
            </div>

            {/* Hidden Banner File Input */}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />

            {/* Floating Banner Button (Mobile friendly) */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute top-4 right-4 sm:hidden p-2 rounded-full bg-white/90 text-stone-900 shadow-md"
              title="Change Banner"
            >
              <Camera size={16} />
            </button>
          </div>

          {/* Avatar and Info Row */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-6">
              {/* Avatar Uploader */}
              <div className="relative group w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white shrink-0 ring-1 ring-stone-200">
                <img
                  src={avatarPreview}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />

                {/* Avatar Overlay on Hover */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-semibold cursor-pointer"
                >
                  <Camera size={20} className="mb-1" />
                  <span>Change Photo</span>
                </button>

                {/* Hidden Avatar File Input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Upload actions and badges */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 rounded-full border border-stone-300 hover:border-stone-400 bg-white text-stone-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Camera size={14} className="text-[#E05D38]" />
                  <span>Upload Local Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-4 py-2 rounded-full border border-stone-300 hover:border-stone-400 bg-white text-stone-800 text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ImageIcon size={14} className="text-[#E05D38]" />
                  <span>Change Background</span>
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">{displayName}</h2>
                <span className="inline-flex items-center text-blue-500" title="Verified Member">
                  <CheckCircle2 size={18} className="fill-blue-500 text-white" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-100 text-[#E05D38]">
                  {isCreator ? 'AI Creator Account' : 'Brand / Agency Account'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 mt-0.5">{email} · {location}</p>
            </div>
          </div>
        </section>

        {/* ── CARD 2: Personal & Identity Data ── */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 mb-8">
          <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-stone-200/70">
            <UserIcon size={18} className="text-[#E05D38]" />
            <h3 className="text-lg font-bold text-stone-900">Personal & Profile Details</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>

              {/* Company / Brand Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  {isCreator ? 'Studio / Brand Alias' : 'Company / Agency Name'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>

              {/* Website */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Website / Portfolio Link
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>

              {/* Creator Specific Fields */}
              {isCreator && (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Professional Tagline
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Starting Project Rate ($ USD)
                    </label>
                    <input
                      type="number"
                      value={rateMin}
                      onChange={(e) => setRateMin(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Availability Status
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                    >
                      <option value="available">🟢 Available for Pitches</option>
                      <option value="limited">🟡 Limited Availability</option>
                      <option value="booked">🔴 Fully Booked</option>
                    </select>
                  </div>
                </>
              )}

              {/* Bio / Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  {isCreator ? 'Artist Bio & Creative Philosophy' : 'Company Overview & Mission'}
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#E05D38] hover:bg-[#C94B27] text-white text-sm font-semibold transition shadow-sm"
              >
                Save Details
              </button>
            </div>
          </form>
        </section>

        {/* ── CARD 3: Profile Verification & Document Uploads ── */}
        <section className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200/70">
            <div className="flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-[#E05D38]" />
              <div>
                <h3 className="text-lg font-bold text-stone-900">Profile Verification & Compliance</h3>
                <p className="text-xs text-stone-500">
                  Upload verification documents from your local machine to certify copyright clearance and enterprise trust.
                </p>
              </div>
            </div>

            {/* Verification Status Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified Status: Active</span>
            </div>
          </div>

          {/* Upload Feedback */}
          {docUploadMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{docUploadMessage}</span>
            </div>
          )}

          {/* Document Upload Area */}
          <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200/80 mb-6">
            <h4 className="text-sm font-bold text-stone-900 mb-2">Upload Verification File from Local Device</h4>
            <p className="text-xs text-stone-500 mb-4">
              Accepted formats: PDF, PNG, JPG, DOCX (e.g. Government ID, Business Registration, LoRA / AI Tool Originality Declaration).
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Category Select */}
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as VerificationDocument['documentType'])}
                className="px-3 py-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20"
              >
                <option value="id_proof">Government ID / Passport</option>
                <option value="business_reg">Business / Agency Registration</option>
                <option value="ip_declaration">Commercial IP & Originality Declaration</option>
                <option value="workflow_source">AI Workflow & Model License Proof</option>
              </select>

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <UploadCloud size={16} />
                <span>Select & Upload File</span>
              </button>

              {/* Hidden Document File Input */}
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,image/*,.doc,.docx"
                className="hidden"
                onChange={handleDocumentUpload}
              />
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-3">
              Verified Documents ({documents.length})
            </h4>

            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200/80 bg-white hover:bg-stone-50/50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-orange-100/70 text-[#E05D38] flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">{doc.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {doc.fileSize} · Uploaded {doc.uploadedAt} · Type: {doc.documentType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Verified ✓
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 transition"
                      title="Remove Document"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
