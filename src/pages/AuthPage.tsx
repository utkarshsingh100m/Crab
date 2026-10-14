import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { SEED_USERS } from '../data/seed';
import {
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User as UserIcon,
  Globe,
  Briefcase,
} from 'lucide-react';

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, currentUser, isAuthenticated } = useAppStore();

  const initialMode = (searchParams.get('mode') === 'signup' ? 'signup' : 'login') as 'login' | 'signup';
  const initialRole = (searchParams.get('role') === 'creator' ? 'creator' : 'brand') as 'brand' | 'creator';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'brand' | 'creator'>(initialRole);

  // Form Fields - Pre-filled with demo data according to selected role & mode
  const [name, setName] = useState('Sarah Chen');
  const [companyOrPortfolio, setCompanyOrPortfolio] = useState('NovaLabs Studio');
  const [email, setEmail] = useState('sarah@novalabs.io');
  const [password, setPassword] = useState('demo-brand-pass-2026');
  const [toolsOrIndustry, setToolsOrIndustry] = useState('AI Film & Brand Commercials');
  const [loading, setLoading] = useState(false);

  // Sync demo data whenever role changes
  useEffect(() => {
    if (role === 'brand') {
      setName('Sarah Chen');
      setCompanyOrPortfolio('NovaLabs Studio');
      setEmail('sarah@novalabs.io');
      setPassword('demo-brand-pass-2026');
      setToolsOrIndustry('AI Film & Brand Commercials');
    } else {
      setName('Kai Nakamura');
      setCompanyOrPortfolio('https://visualsynthesis.ai');
      setEmail('kai@visualsynthesis.ai');
      setPassword('demo-creator-pass-2026');
      setToolsOrIndustry('Sora · Runway Gen-3 · Midjourney v6');
    }
  }, [role, mode]);

  // Sync searchParams when URL changes
  useEffect(() => {
    const qMode = searchParams.get('mode');
    if (qMode === 'signup' || qMode === 'login') {
      setMode(qMode);
    }
    const qRole = searchParams.get('role');
    if (qRole === 'creator' || qRole === 'brand') {
      setRole(qRole);
    }
  }, [searchParams]);

  const homePath = currentUser?.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard';
  const redirectTarget = searchParams.get('redirect');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const user = SEED_USERS.find((u) => u.role === role) ?? SEED_USERS[0];
    login(user);
    if (redirectTarget) {
      navigate(redirectTarget);
    } else {
      navigate(role === 'brand' ? '/brand/dashboard' : '/creator/dashboard');
    }
    setLoading(false);
  }

  function handleInstantQuickLogin(selectedRole: 'brand' | 'creator') {
    const user = SEED_USERS.find((u) => u.role === selectedRole) ?? SEED_USERS[0];
    login(user);
    if (redirectTarget) {
      navigate(redirectTarget);
    } else {
      navigate(selectedRole === 'brand' ? '/brand/dashboard' : '/creator/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex flex-col antialiased selection:bg-[#E05D38] selection:text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Top nav */}
      <header className="w-full bg-[#F8F5F0]/80 backdrop-blur-md border-b border-[#EAE3D6] px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            to={isAuthenticated && currentUser ? homePath : "/"}
            className="flex items-center space-x-2.5 group"
            aria-label="CRAB Home"
          >
            <img src="/crab-logo.png" alt="CRAB" className="w-8 h-8 rounded-lg object-contain shadow-sm group-hover:scale-105 transition-transform" />
            <span className="font-bold text-lg tracking-tight text-stone-900">CRAB</span>
          </Link>
          <div className="flex items-center space-x-6 text-sm font-medium text-stone-600">
            <Link to="/marketplace" className="hover:text-stone-900 transition-colors">Explore Creators</Link>
            <Link to="/" className="hover:text-stone-900 transition-colors">How it Works</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-lg">
          {/* Ambient Arches */}
          <div className="absolute -top-12 -right-8 w-44 h-56 border-2 border-orange-200/40 rounded-t-[140px] rounded-b-none pointer-events-none -z-10 rotate-12 opacity-60" />
          <div className="absolute -bottom-8 -left-8 w-36 h-48 border border-amber-300/40 rounded-t-[140px] rounded-b-none pointer-events-none -z-10 -rotate-6 opacity-40" />

          {/* Main Card */}
          <div
            className="bg-white/95 backdrop-blur-xl border border-[#ECE5D9] rounded-3xl p-6 sm:p-8 w-full shadow-xl"
            style={{ boxShadow: '0 20px 45px -12px rgba(184,62,26,0.09), 0 1px 3px 0 rgba(0,0,0,0.03)' }}
          >
            {/* Header Badge */}
            <div className="text-center mb-6">
              <img src="/crab-logo.png" alt="CRAB" className="w-12 h-12 mx-auto mb-3 object-contain rounded-xl shadow-xs" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 mb-1">
                {mode === 'login' ? 'Sign In to CRAB' : 'Create Your CRAB Account'}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                AI Content Creator Marketplace · HackXLerate 2026
              </p>

              {redirectTarget && (
                <div className="mt-3.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 font-medium flex items-center justify-between shadow-xs text-left">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                    <span>Sign in or create an account to access: <strong className="font-semibold text-stone-900">{redirectTarget}</strong></span>
                  </div>
                </div>
              )}
            </div>

            {/* 1. Role Toggle (Brand vs Creator) */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 ml-0.5">
                Select Account Role:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/70">
                <button
                  type="button"
                  onClick={() => setRole('brand')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition duration-200 cursor-pointer ${
                    role === 'brand'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Building2 size={16} className={role === 'brand' ? 'text-[#E05D38]' : 'text-stone-400'} />
                  <span>Brand / Agency</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('creator')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition duration-200 cursor-pointer ${
                    role === 'creator'
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Sparkles size={16} className={role === 'creator' ? 'text-amber-600' : 'text-stone-400'} />
                  <span>AI Creator</span>
                </button>
              </div>
            </div>

            {/* 2. Mode Toggle (Log In vs Sign Up) */}
            <div className="flex border-b border-stone-200 mb-5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-center text-sm font-semibold transition border-b-2 cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#E05D38] text-[#E05D38]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-center text-sm font-semibold transition border-b-2 cursor-pointer ${
                  mode === 'signup'
                    ? 'border-[#E05D38] text-[#E05D38]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Demo Notice Banner */}
            <div className="mb-5 p-3 rounded-xl bg-orange-50/70 border border-orange-200/60 flex items-start gap-2.5 text-xs text-stone-700">
              <CheckCircle2 size={16} className="text-[#E05D38] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-900 block">
                  Demo Account Loaded: {role === 'brand' ? 'Sarah Chen (Brand Manager)' : 'Kai Nakamura (AI Filmmaker)'}
                </span>
                <span className="text-stone-500 text-[11px]">
                  All profile data is pre-filled below. Click submit to enter the demo home dashboard immediately.
                </span>
              </div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name (for Sign Up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 ml-0.5" htmlFor="auth-name">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon size={15} className="absolute left-3.5 top-3.5 text-stone-400" />
                    <input
                      id="auth-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                    />
                  </div>
                </div>
              )}

              {/* Company or Portfolio (for Sign Up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-600 mb-1 ml-0.5" htmlFor="auth-secondary">
                    {role === 'brand' ? 'Company / Agency Name' : 'Portfolio / Studio URL'}
                  </label>
                  <div className="relative">
                    {role === 'brand' ? (
                      <Briefcase size={15} className="absolute left-3.5 top-3.5 text-stone-400" />
                    ) : (
                      <Globe size={15} className="absolute left-3.5 top-3.5 text-stone-400" />
                    )}
                    <input
                      id="auth-secondary"
                      type="text"
                      value={companyOrPortfolio}
                      onChange={(e) => setCompanyOrPortfolio(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1 ml-0.5" htmlFor="auth-email">
                  {role === 'brand' ? 'Brand Work Email' : 'Creator Email'}
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1 ml-0.5">
                  <label className="block text-xs font-semibold text-stone-600" htmlFor="auth-password">
                    Password
                  </label>
                  {mode === 'login' && (
                    <span className="text-[11px] text-stone-400">Default demo password</span>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-3.5 text-stone-400" />
                  <input
                    id="auth-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#E05D38]/20 focus:border-[#E05D38]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-[#E05D38] hover:bg-[#C94B27] active:bg-[#B83D1A] text-white font-semibold rounded-xl text-sm shadow-md shadow-orange-500/20 transition duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  <span>
                    {mode === 'login'
                      ? `Log In as ${role === 'brand' ? 'Brand' : 'Creator'} Demo →`
                      : `Sign Up as ${role === 'brand' ? 'Brand' : 'Creator'} Demo →`}
                  </span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>

            {/* Quick 1-Click Fast Passes */}
            <div className="mt-6 pt-5 border-t border-stone-200 text-center">
              <span className="text-xs text-stone-500 font-medium block mb-2.5">
                Or jump in instantly with 1-click:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleInstantQuickLogin('brand')}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/40 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Building2 size={13} className="text-[#E05D38]" />
                  <span>Sarah Chen (Brand)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInstantQuickLogin('creator')}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:border-amber-300 hover:bg-amber-50/40 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Sparkles size={13} className="text-amber-600" />
                  <span>Kai Nakamura (Creator)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#ECE5D9] bg-stone-100/40 py-4 px-6 text-center text-xs text-stone-500">
        <p>© 2026 CRAB — AI Content Creator Marketplace. Demo Mode with Instant Verification & Escrow.</p>
      </footer>
    </div>
  );
}
