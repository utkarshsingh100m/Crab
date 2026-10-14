import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import {
  LayoutDashboard,
  Search,
  FileText,
  Bookmark,
  Briefcase,
  User,
  ImagePlus,
  LogOut,
  Settings,
  RotateCcw,
  Menu,
  X,
  MessageCircle,
  Bell,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { SEED_USERS } from '../../data/seed';

const BRAND_NAV = [
  { href: '/brand/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/marketplace', label: 'Find Creators', icon: Search },
  { href: '/brand/briefs', label: 'My Briefs', icon: FileText },
  { href: '/brand/saved', label: 'Saved Creators', icon: Bookmark },
  { href: '/brand/campaigns', label: 'Campaigns', icon: Briefcase },
  { href: '/profile', label: 'Profile & Verification', icon: User },
];

const CREATOR_NAV = [
  { href: '/creator/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/creator/profile', label: 'Discover Talent', icon: Compass },
  { href: '/creator/portfolio', label: 'My Portfolio', icon: ImagePlus },
  { href: '/profile', label: 'Profile & Verification', icon: Settings },
  { href: '/creator/opportunities', label: 'Browse Briefs', icon: Briefcase },
  { href: '/creator/campaigns', label: 'Messages', icon: MessageCircle },
];

interface AppShellProps {
  children?: React.ReactNode;
}

export function resolveBreadcrumb(
  path: string,
  role: 'creator' | 'brand' | 'admin' | string | undefined,
  creators: Array<{ id: string; displayName: string }>,
  campaigns: Array<{ id: string; title: string }>
): string {
  // 1. Fixed subpages
  if (path === '/brand/briefs/new') return 'Create a Brief';

  const navItems = role === 'creator' ? CREATOR_NAV : BRAND_NAV;

  // 2. Exact match in current role's navigation
  const exactNav = navItems.find((n) => n.href === path);
  if (exactNav) return exactNav.label;

  // 3. Dynamic Creator Detail page (/creator/:id)
  if (path.startsWith('/creator/')) {
    const subPath = path.split('/')[2];
    const reservedCreatorPaths = ['dashboard', 'profile', 'portfolio', 'opportunities', 'campaigns'];
    if (subPath && !reservedCreatorPaths.includes(subPath)) {
      const viewedCreator = creators.find((c) => c.id === subPath);
      const prefix = role === 'creator' ? 'Discover Talent' : 'Find Creators';
      return viewedCreator ? `${prefix} / ${viewedCreator.displayName}` : prefix;
    }
  }

  // 4. Dynamic Campaign Detail page (/campaign/:id)
  if (path.startsWith('/campaign/')) {
    const campaignId = path.split('/')[2];
    const camp = campaigns.find((c) => c.id === campaignId);
    const prefix = role === 'creator' ? 'Messages' : 'Campaigns';
    return camp ? `${prefix} / ${camp.title}` : `${prefix} / Details`;
  }

  // 5. Special Marketplace role handling
  if (path === '/marketplace') {
    return role === 'creator' ? 'Discover Talent' : 'Find Creators';
  }

  // 6. Prefix match for other nested routes (e.g., /brand/briefs/...)
  const prefixNav = navItems.find(
    (n) => n.href !== '/brand/dashboard' && n.href !== '/creator/dashboard' && path.startsWith(n.href)
  );
  if (prefixNav) return prefixNav.label;

  return 'Home';
}

export function AppShell({ children }: AppShellProps) {
  const { currentUser, logout, resetToSeedData, creators, campaigns } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const homePath = currentUser?.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard';
  const navItems = currentUser?.role === 'creator' ? CREATOR_NAV : BRAND_NAV;

  const currentBreadcrumb = React.useMemo(() => {
    return resolveBreadcrumb(location.pathname, currentUser?.role, creators, campaigns);
  }, [location.pathname, currentUser?.role, creators, campaigns]);

  function handleLogout() {
    logout();
    navigate('/');
    setUserMenuOpen(false);
  }

  const isCreatorDetailPage =
    location.pathname.startsWith('/creator/') &&
    !['dashboard', 'profile', 'portfolio', 'opportunities', 'campaigns'].includes(
      location.pathname.split('/')[2]
    );
  const isCampaignDetailPage = location.pathname.startsWith('/campaign/');

  return (
    <div className="h-screen bg-[#FAF7F2] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-[#EAE4DC] flex-col justify-between shrink-0 h-full">
        <div className="flex flex-col min-h-0">
          {/* Logo */}
          <div className="h-20 flex items-center px-7 border-b border-[#EAE4DC]/60 shrink-0">
            <Link to={homePath} className="flex items-center gap-3 group" aria-label="CRAB Home">
              <img
                src="/crab-logo.png"
                alt="CRAB Logo"
                className="w-9 h-9 object-contain rounded-lg shadow-sm group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-lg font-black text-[#1C1613] tracking-tight">CRAB</span>
                <span className="block text-[9px] font-medium text-[#9C8F86] leading-none tracking-widest uppercase">
                  Creative Resources and Bridge
                </span>
              </div>
            </Link>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1 flex-1" aria-label="Main Navigation">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isExact = location.pathname === href;
              const isPrefix =
                href !== '/brand/dashboard' &&
                href !== '/creator/dashboard' &&
                location.pathname.startsWith(href);
              const isLinkedDetail =
                (isCreatorDetailPage && (href === '/creator/profile' || href === '/marketplace')) ||
                (isCampaignDetailPage && (href === '/creator/campaigns' || href === '/brand/campaigns'));

              const isActive = isExact || isPrefix || isLinkedDetail;
              return (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors',
                    isActive
                      ? 'text-[#E65D2E] bg-[#FDF1EC]'
                      : 'text-[#78716C] hover:text-[#1C1613] hover:bg-stone-50'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                  {label === 'Messages' && (
                    <span className="ml-auto bg-[#E65D2E] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      3
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User footer */}
        <div className="pt-4 pb-6 px-6 border-t border-[#EAE4DC]/60 shrink-0">
          {currentUser && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition-colors"
                aria-expanded={userMenuOpen}
              >
                <img
                  src={currentUser.avatarUrl ?? `https://api.dicebear.com/9.x/avataaars/svg?seed=${currentUser.id}`}
                  alt={currentUser.displayName}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-[#EAE4DC] shrink-0"
                />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-[#1C1613] truncate">{currentUser.displayName}</p>
                  <p className="text-[11px] text-[#78716C] capitalize">{currentUser.role}</p>
                </div>
                <ChevronDown
                  size={14}
                  className={cn('text-stone-400 transition-transform shrink-0', userMenuOpen && 'rotate-180')}
                />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} aria-hidden />
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-[#EAE4DC] rounded-2xl shadow-lg z-20 overflow-hidden">
                    <div className="p-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#78716C] hover:bg-stone-50 hover:text-[#1C1613] transition-colors text-left"
                      >
                        <User size={14} />
                        Edit Profile & Verification
                      </Link>
                      <button
                        onClick={() => { resetToSeedData(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-[#78716C] hover:bg-stone-50 hover:text-[#1C1613] transition-colors text-left"
                      >
                        <RotateCcw size={14} />
                        Reset demo data
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Top header */}
        <header className="h-16 border-b border-[#EAE4DC] bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
          {/* Mobile logo & breadcrumb */}
          <div className="flex items-center gap-2.5 md:hidden">
            <button
              className="p-2 rounded-lg hover:bg-stone-100 text-[#78716C]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to={homePath} className="flex items-center gap-2 shrink-0">
              <img src="/crab-logo.png" alt="CRAB" className="w-7 h-7 object-contain rounded" />
              <span className="font-black text-base text-[#1C1613]">CRAB</span>
            </Link>
            <span className="text-[#9C8F86] text-xs">/</span>
            <span className="font-semibold text-xs text-[#1C1613] truncate max-w-[120px]">
              {currentBreadcrumb}
            </span>
          </div>

          {/* Breadcrumb (desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#78716C]">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#1C1613] font-medium">
              {currentBreadcrumb}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 ml-auto">
            {currentUser?.role === 'brand' && (
              <Link
                to="/brand/briefs/new"
                className="px-3.5 py-1.5 text-xs font-medium border border-[#EAE4DC] rounded-lg text-[#1C1613] bg-white hover:bg-stone-50 transition-colors shadow-sm"
              >
                + Post a Brief
              </Link>
            )}
            <button className="w-8 h-8 rounded-full border border-[#EAE4DC] flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors">
              <Bell size={14} />
            </button>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-20 pt-16">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
            <nav className="absolute top-0 left-0 w-64 h-full bg-white border-r border-[#EAE4DC] p-4 space-y-1 overflow-y-auto">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isExact = location.pathname === href;
                const isPrefix =
                  href !== '/brand/dashboard' &&
                  href !== '/creator/dashboard' &&
                  location.pathname.startsWith(href);
                const isLinkedDetail =
                  (isCreatorDetailPage && (href === '/creator/profile' || href === '/marketplace')) ||
                  (isCampaignDetailPage && (href === '/creator/campaigns' || href === '/brand/campaigns'));

                const isActive = isExact || isPrefix || isLinkedDetail;
                return (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-colors',
                      isActive
                        ? 'text-[#E65D2E] bg-[#FDF1EC]'
                        : 'text-[#78716C] hover:text-[#1C1613] hover:bg-stone-50'
                    )}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-[#EAE4DC] mt-4 space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-[#78716C] hover:bg-stone-50"
                >
                  <User size={14} /> Profile & Verification
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50">
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1">
          {children || <Outlet />}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#EAE4DC] bg-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-[#9C8F86]">
              <img src="/crab-logo.png" alt="CRAB" className="w-4 h-4 object-contain opacity-60" />
              <span className="font-bold text-[#78716C]">CRAB</span>
              <span>—</span>
              <span>AI Creator Marketplace · HackXLerate 2026</span>
            </div>
            <span className="text-xs text-[#9C8F86]">Demo Mode · All data is fictional</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
