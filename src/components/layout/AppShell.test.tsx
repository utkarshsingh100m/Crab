import { describe, it, expect } from 'vitest';
import { resolveBreadcrumb } from './AppShell';

describe('resolveBreadcrumb — Page Name & Header Resolution', () => {
  const dummyCreators = [
    { id: 'creator-1', displayName: 'Kai Nakamura' },
    { id: 'creator-2', displayName: 'Amara Osei' },
    { id: 'creator-3', displayName: 'Elena Rostova' },
  ];

  const dummyCampaigns = [
    { id: 'campaign-1', title: 'Hero Brand Film — Aurora Q1 Launch' },
    { id: 'campaign-2', title: 'Cosmic Beverages Campaign' },
  ];

  describe('Creator Role Routes', () => {
    it('resolves Messages on /creator/campaigns', () => {
      expect(resolveBreadcrumb('/creator/campaigns', 'creator', dummyCreators, dummyCampaigns)).toBe('Messages');
    });

    it('resolves Home on /creator/dashboard', () => {
      expect(resolveBreadcrumb('/creator/dashboard', 'creator', dummyCreators, dummyCampaigns)).toBe('Home');
    });

    it('resolves Discover Talent on /creator/profile', () => {
      expect(resolveBreadcrumb('/creator/profile', 'creator', dummyCreators, dummyCampaigns)).toBe('Discover Talent');
    });

    it('resolves My Portfolio on /creator/portfolio', () => {
      expect(resolveBreadcrumb('/creator/portfolio', 'creator', dummyCreators, dummyCampaigns)).toBe('My Portfolio');
    });

    it('resolves Browse Briefs on /creator/opportunities', () => {
      expect(resolveBreadcrumb('/creator/opportunities', 'creator', dummyCreators, dummyCampaigns)).toBe('Browse Briefs');
    });

    it('resolves Profile & Verification on /profile', () => {
      expect(resolveBreadcrumb('/profile', 'creator', dummyCreators, dummyCampaigns)).toBe('Profile & Verification');
    });

    it('resolves Discover Talent / <Name> on /creator/:id for other creator profiles', () => {
      expect(resolveBreadcrumb('/creator/creator-2', 'creator', dummyCreators, dummyCampaigns)).toBe('Discover Talent / Amara Osei');
      expect(resolveBreadcrumb('/creator/creator-3', 'creator', dummyCreators, dummyCampaigns)).toBe('Discover Talent / Elena Rostova');
    });

    it('resolves Messages / <Campaign Title> on /campaign/:id for creators', () => {
      expect(resolveBreadcrumb('/campaign/campaign-1', 'creator', dummyCreators, dummyCampaigns)).toBe(
        'Messages / Hero Brand Film — Aurora Q1 Launch'
      );
    });

    it('resolves Discover Talent when creator visits /marketplace', () => {
      expect(resolveBreadcrumb('/marketplace', 'creator', dummyCreators, dummyCampaigns)).toBe('Discover Talent');
    });
  });

  describe('Brand Role Routes', () => {
    it('resolves Home on /brand/dashboard', () => {
      expect(resolveBreadcrumb('/brand/dashboard', 'brand', dummyCreators, dummyCampaigns)).toBe('Home');
    });

    it('resolves Find Creators on /marketplace', () => {
      expect(resolveBreadcrumb('/marketplace', 'brand', dummyCreators, dummyCampaigns)).toBe('Find Creators');
    });

    it('resolves My Briefs on /brand/briefs', () => {
      expect(resolveBreadcrumb('/brand/briefs', 'brand', dummyCreators, dummyCampaigns)).toBe('My Briefs');
    });

    it('resolves Create a Brief on /brand/briefs/new', () => {
      expect(resolveBreadcrumb('/brand/briefs/new', 'brand', dummyCreators, dummyCampaigns)).toBe('Create a Brief');
    });

    it('resolves Saved Creators on /brand/saved', () => {
      expect(resolveBreadcrumb('/brand/saved', 'brand', dummyCreators, dummyCampaigns)).toBe('Saved Creators');
    });

    it('resolves Campaigns on /brand/campaigns', () => {
      expect(resolveBreadcrumb('/brand/campaigns', 'brand', dummyCreators, dummyCampaigns)).toBe('Campaigns');
    });

    it('resolves Profile & Verification on /profile', () => {
      expect(resolveBreadcrumb('/profile', 'brand', dummyCreators, dummyCampaigns)).toBe('Profile & Verification');
    });

    it('resolves Find Creators / <Name> on /creator/:id for brands', () => {
      expect(resolveBreadcrumb('/creator/creator-1', 'brand', dummyCreators, dummyCampaigns)).toBe('Find Creators / Kai Nakamura');
    });

    it('resolves Campaigns / <Campaign Title> on /campaign/:id for brands', () => {
      expect(resolveBreadcrumb('/campaign/campaign-1', 'brand', dummyCreators, dummyCampaigns)).toBe(
        'Campaigns / Hero Brand Film — Aurora Q1 Launch'
      );
    });
  });
});
