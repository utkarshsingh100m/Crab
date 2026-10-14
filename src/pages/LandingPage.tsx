import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { SEED_USERS } from '../data/seed';
import {
  ArrowRight,
  Search,
  Sparkles,
  Play,
  ArrowUpRight,
  Heart,
  Star,
  Shield,
  FileText,
  Zap,
  Briefcase,
  CheckCircle2,
  DollarSign,
  Layers,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { login, creators, currentUser, isAuthenticated } = useAppStore();
  const homePath = currentUser?.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard';

  // Explicit logo click handler: if signed in, always go to user dashboard home page; otherwise stay on/go to landing page.
  function handleLogoClick(e: React.MouseEvent) {
    e.preventDefault();
    if (isAuthenticated && currentUser) {
      navigate(currentUser.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
    } else {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Universal action handler: requires authentication. If not signed in, redirects to /auth with target path and role hint.
  function handleProtectedAction(
    targetPath: string,
    roleHint?: 'brand' | 'creator',
    modeHint: 'login' | 'signup' = 'login'
  ) {
    if (isAuthenticated && currentUser) {
      navigate(targetPath);
    } else {
      const params = new URLSearchParams();
      if (modeHint) params.set('mode', modeHint);
      if (roleHint) params.set('role', roleHint);
      params.set('redirect', targetPath);
      navigate(`/auth?${params.toString()}`);
    }
  }

  const featuredCreators = creators.slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark antialiased selection:bg-brand-accent selection:text-white font-sans scroll-smooth">
      {/* ── BEGIN: Navigation ── */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo - redirect to home dashboard if signed in, else landing page */}
          <Link
            to={isAuthenticated && currentUser ? homePath : "/"}
            onClick={handleLogoClick}
            className="flex items-center gap-3 group cursor-pointer"
            aria-label="CRAB Home"
          >
            <img
              src="/crab-logo.png"
              alt="CRAB Logo"
              className="w-9 h-9 object-contain rounded-lg shadow-xs group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-brand-dark font-sans leading-none">
                CRAB<span className="text-brand-accent">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-brand-muted font-medium mt-0.5">
                Creative Resources and Bridge
              </span>
            </div>
          </Link>

          {/* Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
            <button
              onClick={() => handleProtectedAction('/marketplace')}
              className="text-brand-dark transition-colors hover:text-brand-accent cursor-pointer"
            >
              Creators
            </button>
            <a href="#briefs" className="transition-colors hover:text-brand-accent">
              Projects & Briefs
            </a>
            <a href="#for-brands" className="transition-colors hover:text-brand-accent">
              For Brands
            </a>
            <a href="#for-creators" className="transition-colors hover:text-brand-accent">
              For Creators
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-brand-accent">
              How It Works
            </a>
          </nav>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleProtectedAction('/marketplace')}
              aria-label="Search"
              className="p-2 text-brand-muted hover:text-brand-dark transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>

            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="text-xs font-semibold text-brand-muted hover:text-brand-dark flex items-center gap-1.5 px-2 py-1"
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.displayName}
                    className="w-6 h-6 rounded-full object-cover border border-brand-border"
                  />
                  <span className="hidden sm:inline">{currentUser.displayName}</span>
                </Link>
                <Link
                  to={homePath}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-accent text-white text-xs font-semibold hover:bg-brand-accent-hover transition shadow-sm hover:shadow hover:-translate-y-0.5 duration-150"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  className="text-sm font-semibold text-brand-dark hover:text-brand-accent transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover transition shadow-sm hover:shadow hover:-translate-y-0.5 duration-150"
                >
                  <span>Explore Creators</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      {/* ── END: Navigation ── */}

      <main>
        {/* ── BEGIN: HeroSection ── */}
        <section className="relative hero-glow pt-10 pb-20 md:py-24 overflow-hidden border-b border-brand-border/40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Hero Left Column: Copy & CTAs */}
              <div className="lg:col-span-7 flex flex-col items-start z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-soft/70 border border-brand-accent/20 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                    Creative Ideas. Real Impact.
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif-display leading-[1.05] tracking-tight text-brand-dark mb-6">
                  Create without limits <br />
                  <span className="italic font-normal">with</span>{' '}
                  <span className="text-brand-accent underline decoration-brand-accent/30 decoration-wavy underline-offset-8">
                    AI creators.
                  </span>
                </h1>

                {/* Subheading */}
                <p className="text-lg md:text-xl text-brand-muted leading-relaxed max-w-xl mb-10">
                  Discover curated AI filmmakers, animators, and generative artists. Collaborate on brand campaigns with verified workflow transparency and commercial-use rights.
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-16">
                  <button
                    onClick={() => handleProtectedAction('/marketplace', 'creator', 'signup')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-brand-accent text-white font-medium hover:bg-brand-accent-hover transition shadow-md hover:shadow-lg hover:-translate-y-0.5 transform duration-200 cursor-pointer"
                  >
                    <span>Explore Creators</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handleProtectedAction('/brand/briefs/new', 'brand')}
                    className="inline-flex items-center px-7 py-3.5 rounded-full bg-transparent text-brand-dark font-medium border border-brand-border hover:bg-white transition duration-200 shadow-xs cursor-pointer"
                  >
                    Post a Project Brief
                  </button>
                </div>

                {/* Metrics / Social Proof */}
                <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-8 border-t border-brand-border/60 w-full max-w-lg">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-brand-dark font-sans tracking-tight">8+</div>
                    <div className="text-xs sm:text-sm text-brand-muted mt-1">Curated Artists</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-brand-dark font-sans tracking-tight">100%</div>
                    <div className="text-xs sm:text-sm text-brand-muted mt-1">Disclosed Workflow</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-brand-dark font-sans tracking-tight">100pt</div>
                    <div className="text-xs sm:text-sm text-brand-muted mt-1">Explainable Score</div>
                  </div>
                </div>
              </div>

              {/* Hero Right Column: Dynamic Visual & Featured Floating Badge */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-md lg:max-w-none">
                  {/* Backdrop soft light sphere */}
                  <div className="absolute -top-12 -right-12 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl -z-10"></div>

                  {/* Main AI Visual Artwork Frame */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-brand-sand">
                    <img
                      alt="Hero AI Artwork Showcase"
                      className="w-full h-full object-cover object-center scale-105 hover:scale-100 transition duration-700 ease-out"
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80"
                    />

                    {/* Floating Featured Work Badge */}
                    <div className="absolute bottom-6 left-6 right-6 glass-card p-4 rounded-2xl shadow-lg border border-white/80 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative border border-white/50">
                          <img
                            alt="Mini thumbnail"
                            className="w-full h-full object-cover"
                            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white" />
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase font-bold tracking-wider text-brand-accent">
                            Featured Work
                          </div>
                          <div className="text-sm font-semibold text-brand-dark">Luminary Film</div>
                          <div className="text-xs text-brand-muted">by Kai Nakamura</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleProtectedAction('/creator/creator-1')}
                        aria-label="View creator"
                        className="w-9 h-9 rounded-full bg-brand-accent text-white flex items-center justify-center hover:bg-brand-accent-hover transition shadow cursor-pointer"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── END: HeroSection ── */}

        {/* ── BEGIN: CategoriesSection ── */}
        <section className="py-20 bg-[#FAF7F2]" id="categories">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Title & Subheading */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-brand-accent uppercase mb-2">
                  Explore By Category
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark">
                  Find the perfect creative talent.
                </h2>
              </div>
              <button
                onClick={() => handleProtectedAction('/marketplace')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-dark transition mt-4 md:mt-0 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Categories Grid (6 Cards) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { title: 'AI Films', subtitle: 'Cinematic narrative', cat: 'ai_film', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80' },
                { title: 'Generative Art', subtitle: 'Visual exploration', cat: 'generative_art', img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
                { title: '3D Animation', subtitle: 'Motion & characters', cat: 'animation', img: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80' },
                { title: 'Product Visuals', subtitle: 'Commercial ads', cat: 'product_visuals', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
                { title: 'Social Ads', subtitle: 'Short form viral', cat: 'social_ads', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=400&q=80' },
                { title: 'Concept Art', subtitle: 'Worldbuilding', cat: 'concept_art', img: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80' },
              ].map((c) => (
                <button
                  key={c.title}
                  onClick={() => handleProtectedAction(`/marketplace?category=${c.cat}`)}
                  className="group relative bg-brand-surface rounded-2xl overflow-hidden p-3 border border-brand-border/70 hover:border-brand-accent/40 hover:shadow-md transition duration-300 text-left cursor-pointer"
                >
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-brand-sand">
                    <img
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      src={c.img}
                    />
                  </div>
                  <h3 className="font-bold text-sm text-brand-dark group-hover:text-brand-accent transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-[11px] text-brand-muted truncate">{c.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
        {/* ── END: CategoriesSection ── */}

        {/* ── BEGIN: FeaturedCreatorsSection ── */}
        <section className="py-20 bg-brand-sand/40 border-y border-brand-border/60" id="creators">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-brand-accent uppercase mb-2">
                  Featured Talent
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark">
                  Meet exceptional AI creators.
                </h2>
              </div>
              <button
                onClick={() => handleProtectedAction('/marketplace')}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted hover:text-brand-dark transition mt-4 md:mt-0 cursor-pointer"
              >
                <span>View All 8 Creators</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Creators Grid (4 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCreators.map((creator) => (
                <div
                  key={creator.id}
                  onClick={() => handleProtectedAction(`/creator/${creator.id}`)}
                  className="bg-white rounded-2xl p-4 border border-brand-border/70 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-brand-sand">
                      <img
                        alt={creator.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        src={creator.avatarUrl}
                      />
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProtectedAction(`/creator/${creator.id}`, 'brand');
                        }}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-brand-dark hover:text-brand-accent transition shadow-xs"
                      >
                        <Heart size={14} />
                      </div>
                      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-0.5 shadow-xs text-[11px] font-bold text-sand-900 border border-sand-200/60">
                        {creator.score?.total || 90} Score
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-base text-brand-dark group-hover:text-brand-accent transition-colors">
                        {creator.displayName}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-semibold text-brand-dark">
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>4.9</span>
                      </div>
                    </div>
                    <p className="text-xs text-brand-muted mb-4 line-clamp-1">{creator.tagline}</p>
                  </div>

                  {/* Tool Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-brand-border/40">
                    {creator.tools.slice(0, 2).map((t) => (
                      <span key={t} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-brand-sand text-brand-dark">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ── END: FeaturedCreatorsSection ── */}

        {/* ── BEGIN: Projects & Briefs Section ── */}
        <section className="py-24 bg-white border-b border-brand-border/60" id="briefs">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <div className="text-[11px] font-bold tracking-widest text-brand-accent uppercase mb-2">
                  Campaign Opportunities
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark">
                  Featured Projects & Scoped Briefs
                </h2>
                <p className="text-brand-muted text-sm sm:text-base mt-2 max-w-xl">
                  Explore active commercial briefs from forward-thinking brands, with structured deliverables, clear IP terms, and milestone escrow.
                </p>
              </div>
              <div className="flex items-center gap-3 mt-6 md:mt-0">
                <button
                  onClick={() => handleProtectedAction('/brand/briefs/new', 'brand')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-accent text-white text-sm font-medium hover:bg-brand-accent-hover transition shadow-sm cursor-pointer"
                >
                  <FileText size={15} />
                  <span>Post a Brief</span>
                </button>
                <button
                  onClick={() => handleProtectedAction('/marketplace')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-brand-border text-brand-dark text-sm font-medium hover:bg-brand-sand transition cursor-pointer"
                >
                  <span>Explore All</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Briefs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'brief-1',
                  title: 'Hero Brand Film — Q1 Product Launch',
                  brand: 'NovaLabs · Aurora Skincare',
                  category: 'AI Film & Cinema',
                  budget: '$8,000',
                  timeline: '4 Weeks · Dec 1',
                  tools: ['Sora', 'Runway Gen-3', 'DaVinci'],
                  deliverables: '60s Hero Film + 30s Cut + 9:16 Social Cut',
                  terms: '100% Commercial IP Transfer · Perpetual',
                  badge: 'Escrow Funded',
                },
                {
                  id: 'brief-2',
                  title: 'NextGen 3D Cyberpunk Footwear Reveal',
                  brand: 'Orbit Athletics',
                  category: '3D & Motion Graphics',
                  budget: '$5,500',
                  timeline: '3 Weeks · Dec 15',
                  tools: ['Midjourney v6', 'Blender', 'ComfyUI'],
                  deliverables: '3x 15s Product Renders + 4K Stills',
                  terms: 'Worldwide Digital Rights · Prompt Logs Included',
                  badge: 'Escrow Funded',
                },
                {
                  id: 'brief-3',
                  title: 'Virtual Influencer Editorial Lookbook',
                  brand: 'Studio Monolith',
                  category: 'Generative Visuals',
                  budget: '$4,200',
                  timeline: '2 Weeks · Dec 20',
                  tools: ['DALL·E 3', 'Magnific AI', 'Luma'],
                  deliverables: '10 Generative Looks + 2 Micro-animations',
                  terms: 'Full Commercial Clearance · AI Disclosure',
                  badge: 'Escrow Funded',
                },
              ].map((brief) => (
                <div
                  key={brief.id}
                  className="bg-[#FAF7F2] rounded-2xl p-6 border border-brand-border/80 hover:border-brand-accent/40 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent bg-brand-accent-soft/80 px-2.5 py-1 rounded-full">
                        {brief.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                        <ShieldCheck size={12} />
                        {brief.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-brand-dark mb-1 leading-snug">
                      {brief.title}
                    </h3>
                    <p className="text-xs text-brand-muted mb-4">{brief.brand}</p>

                    <div className="space-y-2.5 py-3 border-y border-brand-border/60 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-brand-muted font-medium">Budget:</span>
                        <span className="font-bold text-brand-dark text-sm">{brief.budget}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-brand-muted font-medium">Timeline:</span>
                        <span className="font-medium text-brand-dark">{brief.timeline}</span>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-brand-muted font-medium shrink-0">Deliverables:</span>
                        <span className="font-medium text-brand-dark text-right truncate">{brief.deliverables}</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-[11px] font-medium text-brand-muted block mb-1.5">Required Toolchain:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {brief.tools.map((t) => (
                          <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white text-brand-dark border border-brand-border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-brand-muted truncate max-w-[170px]">{brief.terms}</span>
                    <button
                      onClick={() => handleProtectedAction('/creator/opportunities', 'creator')}
                      className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Pitch Brief</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ── END: Projects & Briefs Section ── */}

        {/* ── BEGIN: For Brands Section ── */}
        <section className="py-24 bg-[#FAF7F2] border-b border-brand-border/60" id="for-brands">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent-soft/70 border border-brand-accent/20 mb-4">
                  <Building2 size={13} className="text-brand-accent" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent">
                    For Brands & Agencies
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark mb-4 leading-tight">
                  Commission AI creatives with total legal & quality certainty.
                </h2>
                <p className="text-brand-muted leading-relaxed text-sm sm:text-base mb-8">
                  No unvetted freelancers, ambiguous copyright, or runaway revisions. CRAB delivers deterministic creator scoring, structured milestone escrow, and verified prompt transparency.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleProtectedAction('/brand/dashboard', 'brand')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-accent text-white text-sm font-semibold hover:bg-brand-accent-hover transition shadow-sm hover:shadow cursor-pointer"
                  >
                    <span>Enter Brand Demo</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => handleProtectedAction('/brand/briefs/new', 'brand')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-brand-dark border border-brand-border text-sm font-semibold hover:bg-brand-sand transition cursor-pointer"
                  >
                    <span>Create a Project Brief</span>
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: '100-Point Explainable Score',
                    desc: 'Every artist is scored deterministically on prompt fidelity, workflow transparency, and delivery records — never vanity followers.',
                    icon: ShieldCheck,
                  },
                  {
                    title: 'Protected Milestone Escrow',
                    desc: 'Deposit campaign funds securely. Payments release only when you approve concept boards, rough cuts, and final masters.',
                    icon: Shield,
                  },
                  {
                    title: '100% Commercial Clearance',
                    desc: 'Complete IP transfer agreements, generative AI model disclosure statements, and prompt audit trails provided with delivery.',
                    icon: FileText,
                  },
                  {
                    title: 'Audited Toolchain Transparency',
                    desc: 'Review exactly which generative tools, fine-tunes, and finishing pipelines (Sora, Runway, DaVinci) will be used.',
                    icon: Layers,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-white rounded-2xl p-6 border border-brand-border/80 shadow-xs hover:shadow-md transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-accent-soft text-brand-accent flex items-center justify-center mb-4">
                      <item.icon size={20} />
                    </div>
                    <h3 className="font-bold text-base text-brand-dark mb-2">{item.title}</h3>
                    <p className="text-xs text-brand-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* ── END: For Brands Section ── */}

        {/* ── BEGIN: For Creators Section ── */}
        <section className="py-24 bg-white border-b border-brand-border/60" id="for-creators">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'High-Budget Client Briefs',
                    desc: 'Connect with verified enterprise brands and agencies with budgets ranging from $2,500 to $15,000+ per campaign.',
                    icon: DollarSign,
                  },
                  {
                    title: 'Guaranteed Escrow Security',
                    desc: 'Brands fund milestones upfront before you generate a single frame. Never chase unpaid invoices or scope creep again.',
                    icon: ShieldCheck,
                  },
                  {
                    title: 'Showcase Your Custom Stack',
                    desc: 'Highlight your mastery across Sora, Runway Gen-3, Midjourney v6, ComfyUI nodes, and LoRA fine-tunes with verified pipelines.',
                    icon: Sparkles,
                  },
                  {
                    title: 'Merit-First Opportunities',
                    desc: 'Your profile score is calculated from real technical skill and evidence. Get hired based on actual portfolio excellence.',
                    icon: Star,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="bg-[#FAF7F2] rounded-2xl p-6 border border-brand-border/80 shadow-xs hover:shadow-md transition"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                      <item.icon size={20} />
                    </div>
                    <h3 className="font-bold text-base text-brand-dark mb-2">{item.title}</h3>
                    <p className="text-xs text-brand-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 border border-amber-200 mb-4">
                  <Sparkles size={13} className="text-amber-700" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                    For AI Creators & Directors
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark mb-4 leading-tight">
                  Turn your AI mastery into high-value commercial commissions.
                </h2>
                <p className="text-brand-muted leading-relaxed text-sm sm:text-base mb-8">
                  You’ve spent hundreds of hours mastering prompt architecture, motion continuity, and generative pipelines. CRAB connects you with enterprise budgets with 100% escrow payment protection.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleProtectedAction('/creator/dashboard', 'creator')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-dark text-white text-sm font-semibold hover:bg-black transition shadow-sm hover:shadow cursor-pointer"
                  >
                    <span>Enter Creator Demo</span>
                    <ArrowRight size={15} />
                  </button>
                  <button
                    onClick={() => handleProtectedAction('/creator/opportunities', 'creator')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-brand-dark border border-brand-border text-sm font-semibold hover:bg-brand-sand transition cursor-pointer"
                  >
                    <span>Browse Open Briefs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ── END: For Creators Section ── */}

        {/* ── BEGIN: HowItWorksSection ── */}
        <section className="py-24 bg-[#FAF7F2]" id="how-it-works">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16">
              <div className="text-[11px] font-bold tracking-widest text-brand-accent uppercase mb-2">
                How It Works
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif-display font-medium text-brand-dark">
                From idea to extraordinary.
              </h2>
            </div>

            {/* 4 Step Process Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative flex flex-col items-start group">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent-soft text-brand-accent flex items-center justify-center mb-6 border border-brand-accent/20 group-hover:scale-105 transition">
                  <Search size={20} />
                </div>
                <div className="text-xs font-mono font-semibold text-brand-accent mb-1">01</div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">Discover & Filter</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Search across AI models, prompt craft, aspect ratios, and transparent profile readiness scores.
                </p>
              </div>

              <div className="relative flex flex-col items-start group">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent-soft text-brand-accent flex items-center justify-center mb-6 border border-brand-accent/20 group-hover:scale-105 transition">
                  <FileText size={20} />
                </div>
                <div className="text-xs font-mono font-semibold text-brand-accent mb-1">02</div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">Scope with AI Builder</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Turn campaign ideas into structured briefs with commercial licensing and output requirements.
                </p>
              </div>

              <div className="relative flex flex-col items-start group">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent-soft text-brand-accent flex items-center justify-center mb-6 border border-brand-accent/20 group-hover:scale-105 transition">
                  <Sparkles size={20} />
                </div>
                <div className="text-xs font-mono font-semibold text-brand-accent mb-1">03</div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">Milestone Escrow</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Coordinate review rounds, concept approvals, and rough cuts with protected milestone payouts.
                </p>
              </div>

              <div className="relative flex flex-col items-start group">
                <div className="w-12 h-12 rounded-2xl bg-brand-accent-soft text-brand-accent flex items-center justify-center mb-6 border border-brand-accent/20 group-hover:scale-105 transition">
                  <Shield size={20} />
                </div>
                <div className="text-xs font-mono font-semibold text-brand-accent mb-1">04</div>
                <h3 className="text-lg font-bold text-brand-dark mb-2">Verified Delivery</h3>
                <p className="text-sm text-brand-muted leading-relaxed">
                  Receive production deliverables with full commercial clearance, prompt logs, and IP transfer.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ── END: HowItWorksSection ── */}

        {/* ── Final CTA ── */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-br from-brand-accent to-brand-accent-hover text-white text-center shadow-xl">
            <h2 className="text-3xl sm:text-5xl font-serif-display font-medium mb-4">
              Ready to elevate your creative pipeline?
            </h2>
            <p className="text-brand-glow max-w-xl mx-auto mb-8 text-base sm:text-lg">
              Connect with vetted generative directors, animators, and digital artists on CRAB today.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => handleProtectedAction('/brand/dashboard', 'brand')}
                className="px-8 py-3.5 rounded-full bg-white text-brand-accent font-semibold hover:bg-brand-sand transition shadow-md cursor-pointer"
              >
                Enter as Brand Manager
              </button>
              <button
                onClick={() => handleProtectedAction('/creator/dashboard', 'creator')}
                className="px-8 py-3.5 rounded-full bg-brand-dark text-white font-semibold hover:bg-black transition shadow-md cursor-pointer"
              >
                Enter as AI Creator
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-brand-border py-12 bg-white/60">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-muted">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer text-left"
            aria-label="CRAB Home"
          >
            <img src="/crab-logo.png" alt="CRAB" className="w-5 h-5 object-contain" />
            <span className="font-bold text-brand-dark">CRAB</span>
            <span>·</span>
            <span>AI Content Creator Marketplace · HackXLerate 2026</span>
          </button>
          <span>Demo Mode · All sample creators and data are fictional.</span>
        </div>
      </footer>
    </div>
  );
}
