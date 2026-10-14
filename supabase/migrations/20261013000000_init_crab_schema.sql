-- ==============================================================================
-- CRAB: AI Content Creator Marketplace - Database Schema
-- Supabase PostgreSQL Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('brand', 'creator')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATOR PROFILES
CREATE TABLE IF NOT EXISTS public.creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    handle TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    bio TEXT NOT NULL,
    specialization TEXT NOT NULL,
    location TEXT NOT NULL,
    availability TEXT NOT NULL CHECK (availability IN ('immediate', 'within_1_week', 'within_2_weeks', 'booked_month', 'not_available')),
    daily_rate_usd NUMERIC(10, 2) NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    primary_tools TEXT[] NOT NULL DEFAULT '{}',
    secondary_tools TEXT[] NOT NULL DEFAULT '{}',
    experience_years INTEGER NOT NULL DEFAULT 1,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    commercial_ready BOOLEAN NOT NULL DEFAULT TRUE,
    response_rate_percent NUMERIC(5, 2) NOT NULL DEFAULT 95.0,
    avg_response_hours NUMERIC(6, 2) NOT NULL DEFAULT 4.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TOOL EVIDENCE
CREATE TABLE IF NOT EXISTS public.tool_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('image_gen', 'video_gen', 'audio_gen', 'editing', 'pipeline', 'custom_lora', 'other')),
    evidence_type TEXT NOT NULL CHECK (evidence_type IN ('prompt_breakdown', 'workflow_file', 'model_weights_link', 'screen_recording', 'client_endorsement')),
    evidence_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'self_reported' CHECK (verification_status IN ('self_reported', 'evidence_submitted', 'reviewed', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PORTFOLIO ITEMS
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    media_url TEXT NOT NULL,
    thumbnail_url TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('video', 'image', 'interactive', 'audio')),
    category TEXT NOT NULL,
    role TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    tools_used TEXT[] NOT NULL DEFAULT '{}',
    workflow_steps TEXT[] NOT NULL DEFAULT '{}',
    aspect_ratios TEXT[] NOT NULL DEFAULT '{}',
    resolutions TEXT[] NOT NULL DEFAULT '{}',
    duration_seconds INTEGER,
    commercial_clearance TEXT NOT NULL CHECK (commercial_clearance IN ('full_commercial', 'editorial_only', 'client_exclusive', 'personal_use')),
    lora_custom_weights BOOLEAN NOT NULL DEFAULT FALSE,
    third_party_ip_disclosed BOOLEAN NOT NULL DEFAULT TRUE,
    verification_status TEXT NOT NULL DEFAULT 'evidence_submitted' CHECK (verification_status IN ('self_reported', 'evidence_submitted', 'reviewed', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CREATOR SCORES & BREAKDOWNS
CREATE TABLE IF NOT EXISTS public.creator_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE UNIQUE,
    total_score INTEGER NOT NULL CHECK (total_score BETWEEN 0 AND 100),
    profile_completeness INTEGER NOT NULL CHECK (profile_completeness BETWEEN 0 AND 15),
    portfolio_strength INTEGER NOT NULL CHECK (portfolio_strength BETWEEN 0 AND 25),
    ai_transparency INTEGER NOT NULL CHECK (ai_transparency BETWEEN 0 AND 20),
    skill_evidence INTEGER NOT NULL CHECK (skill_evidence BETWEEN 0 AND 15),
    commercial_readiness INTEGER NOT NULL CHECK (commercial_readiness BETWEEN 0 AND 10),
    trust_evidence INTEGER NOT NULL CHECK (trust_evidence BETWEEN 0 AND 10),
    freshness_responsiveness INTEGER NOT NULL CHECK (freshness_responsiveness BETWEEN 0 AND 5),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version TEXT NOT NULL DEFAULT 'v1.0-hackxlerate2026'
);

-- 6. SCORE RECOMMENDATIONS
CREATE TABLE IF NOT EXISTS public.score_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    point_potential INTEGER NOT NULL,
    action_url TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. BRIEFS
CREATE TABLE IF NOT EXISTS public.briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'in_review', 'awarded', 'archived')),
    objective TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    key_message TEXT NOT NULL,
    content_type TEXT NOT NULL,
    creative_style TEXT NOT NULL,
    aspect_ratios TEXT[] NOT NULL DEFAULT '{}',
    resolutions TEXT[] NOT NULL DEFAULT '{}',
    duration_seconds INTEGER,
    deliverables TEXT[] NOT NULL DEFAULT '{}',
    required_tools TEXT[] NOT NULL DEFAULT '{}',
    distribution_channels TEXT[] NOT NULL DEFAULT '{}',
    territory TEXT NOT NULL,
    license_duration TEXT NOT NULL,
    exclusivity_required BOOLEAN NOT NULL DEFAULT FALSE,
    paid_media_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    source_files_required BOOLEAN NOT NULL DEFAULT FALSE,
    third_party_ip_allowed BOOLEAN NOT NULL DEFAULT FALSE,
    budget_usd NUMERIC(10, 2) NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    revision_rounds INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PROPOSALS
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    proposed_rate_usd NUMERIC(10, 2) NOT NULL,
    estimated_delivery_days INTEGER NOT NULL,
    cover_letter TEXT NOT NULL,
    proposed_workflow TEXT[] NOT NULL DEFAULT '{}',
    tools_selected TEXT[] NOT NULL DEFAULT '{}',
    relevant_portfolio_ids UUID[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CAMPAIGNS
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE RESTRICT,
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE RESTRICT,
    proposal_id UUID REFERENCES public.proposals(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('briefing', 'concept_approved', 'production', 'in_review', 'revisions', 'completed', 'disputed')),
    total_budget_usd NUMERIC(10, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CAMPAIGN MILESTONES
CREATE TABLE IF NOT EXISTS public.campaign_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    amount_usd NUMERIC(10, 2) NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'revision_requested')),
    deliverables_url TEXT,
    feedback TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CAMPAIGN MESSAGES
CREATE TABLE IF NOT EXISTS public.campaign_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachment_urls TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. SAVED CREATORS (SHORTLIST)
CREATE TABLE IF NOT EXISTS public.saved_creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES public.creator_profiles(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(brand_id, creator_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Policies for Discovery
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Creator profiles are readable by everyone" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Portfolio items are readable by everyone" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Tool evidence is readable by everyone" ON public.tool_evidence FOR SELECT USING (true);
CREATE POLICY "Creator scores are readable by everyone" ON public.creator_scores FOR SELECT USING (true);
CREATE POLICY "Published briefs are readable by everyone" ON public.briefs FOR SELECT USING (status = 'published' OR auth.uid() = brand_id);
