import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { BrandDashboard } from './pages/BrandDashboard';
import { CreatorDashboard } from './pages/CreatorDashboard';
import { BriefFormPage } from './pages/BriefFormPage';
import { BriefListPage } from './pages/BriefListPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { SavedCreatorsPage } from './pages/SavedCreatorsPage';
import { CreatorPortfolioEditor } from './pages/CreatorPortfolioEditor';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { PublicCreatorsPage } from './pages/PublicCreatorsPage';
import { MessagesPage } from './pages/MessagesPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Auth */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Authenticated / App Shell Layout */}
        <Route element={<AppShell />}>
          {/* Shared Self Profile & Settings */}
          <Route path="/profile" element={<ProfileSettingsPage />} />

          {/* Marketplace & Discovery */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/creator/:id" element={<CreatorProfilePage />} />

          {/* Brand Routes */}
          <Route path="/brand/dashboard" element={<BrandDashboard />} />
          <Route path="/brand/briefs" element={<BriefListPage />} />
          <Route path="/brand/briefs/new" element={<BriefFormPage />} />
          <Route path="/brand/saved" element={<SavedCreatorsPage />} />
          <Route path="/brand/campaigns" element={<MessagesPage />} />

          {/* Shared Campaigns & Direct Messages */}
          <Route path="/campaign/:id" element={<CampaignDetailPage />} />
          <Route path="/messages" element={<MessagesPage />} />

          {/* Creator Routes */}
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/profile" element={<PublicCreatorsPage />} />
          <Route path="/creator/portfolio" element={<CreatorPortfolioEditor />} />
          <Route path="/creator/opportunities" element={<OpportunitiesPage />} />
          <Route path="/creator/campaigns" element={<MessagesPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
