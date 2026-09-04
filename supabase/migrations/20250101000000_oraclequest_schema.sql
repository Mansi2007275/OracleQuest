-- ==============================================================================
-- OracleQuest PostgreSQL Database Migration Schema for Supabase
-- Description: Core tables, enums, indexes, and Row-Level Security (RLS) policies
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumerations
DO $$ BEGIN
    CREATE TYPE prediction_choice AS ENUM ('YES', 'NO');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('active', 'closed', 'resolved', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resolution_outcome AS ENUM ('YES', 'NO', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- Table 1: USERS
-- Description: Player profiles, wallet addresses, XP progression, and rank titles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
    rank TEXT NOT NULL DEFAULT 'Novice Oracle',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 2: EVENTS
-- Description: Prediction market quests, categories, deadlines, and resolutions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    deadline TIMESTAMPTZ NOT NULL,
    status event_status NOT NULL DEFAULT 'active',
    resolution resolution_outcome DEFAULT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 3: PREDICTIONS
-- Description: User stakes/positions, cryptographic tx hashes, and AI summaries
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    choice prediction_choice NOT NULL,
    tx_hash TEXT,
    ai_summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_event_prediction UNIQUE (user_id, event_id)
);

-- ------------------------------------------------------------------------------
-- Table 4: AI_ANALYSES
-- Description: Multi-agent thesis synthesis (Bull vs Bear thesis, risk, confidence)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    bull_analysis TEXT NOT NULL,
    bear_analysis TEXT NOT NULL,
    risk_analysis TEXT NOT NULL,
    confidence_score NUMERIC(5,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- Table 5: ACHIEVEMENTS
-- Description: Unlocked cyberpunk quest badges and credentials
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    badge_name TEXT NOT NULL,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_name)
);

-- ------------------------------------------------------------------------------
-- Table 6: XP_LOG
-- Description: Audit trail for XP distribution, streak rewards, and predictions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.xp_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. High-Performance Indexes
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_xp_rank ON public.users(xp DESC, level DESC);

CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_deadline ON public.events(deadline);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);

CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_event_id ON public.predictions(event_id);
CREATE INDEX IF NOT EXISTS idx_predictions_choice ON public.predictions(choice);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_event_id ON public.ai_analyses(event_id);

CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON public.achievements(user_id);

CREATE INDEX IF NOT EXISTS idx_xp_log_user_id ON public.xp_log(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_log_created_at ON public.xp_log(created_at DESC);

-- ==============================================================================
-- 4. Automatic Timestamp Update Triggers
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. Row-Level Security (RLS) Configuration
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS: USERS Table
-- ------------------------------------------------------------------------------
-- Public profile read access
CREATE POLICY "Users are publicly viewable"
    ON public.users
    FOR SELECT
    USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "Users can create their own profile"
    ON public.users
    FOR INSERT
    WITH CHECK (
        auth.uid() = id 
        OR (auth.jwt() ->> 'wallet_address' IS NOT NULL AND (auth.jwt() ->> 'wallet_address')::text = lower(wallet_address))
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- Users can update only their own profile
CREATE POLICY "Users can update their own profile"
    ON public.users
    FOR UPDATE
    USING (
        auth.uid() = id 
        OR (auth.jwt() ->> 'wallet_address' IS NOT NULL AND (auth.jwt() ->> 'wallet_address')::text = lower(wallet_address))
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------------------------
-- RLS: EVENTS Table
-- ------------------------------------------------------------------------------
-- Everyone can read active and resolved events
CREATE POLICY "Events are viewable by everyone"
    ON public.events
    FOR SELECT
    USING (true);

-- Authenticated users can create new prediction events
CREATE POLICY "Authenticated users can create events"
    ON public.events
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        OR auth.role() = 'service_role'
    );

-- Event creators can update their events before deadline; service role has full access
CREATE POLICY "Creators or admins can update events"
    ON public.events
    FOR UPDATE
    USING (
        created_by = auth.uid() 
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------------------------
-- RLS: PREDICTIONS Table
-- ------------------------------------------------------------------------------
-- Predictions are publicly viewable for odds computation and social feeds
CREATE POLICY "Predictions are viewable by everyone"
    ON public.predictions
    FOR SELECT
    USING (true);

-- Users can only insert predictions for themselves
CREATE POLICY "Users can create their own predictions"
    ON public.predictions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid() 
        OR (auth.jwt() ->> 'wallet_address' IS NOT NULL AND (auth.jwt() ->> 'wallet_address')::text = lower((SELECT wallet_address FROM public.users WHERE id = user_id)))
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

-- Users can only modify their own predictions
CREATE POLICY "Users can modify their own predictions"
    ON public.predictions
    FOR UPDATE
    USING (
        user_id = auth.uid() 
        OR (auth.jwt() ->> 'wallet_address' IS NOT NULL AND (auth.jwt() ->> 'wallet_address')::text = lower((SELECT wallet_address FROM public.users WHERE id = user_id)))
        OR auth.role() = 'service_role'
    );

-- ------------------------------------------------------------------------------
-- RLS: AI_ANALYSES Table
-- ------------------------------------------------------------------------------
-- AI theses are public intelligence feeds for all users
CREATE POLICY "AI analyses are viewable by everyone"
    ON public.ai_analyses
    FOR SELECT
    USING (true);

-- Only AI oracle workers / service role can insert or update AI analyses
CREATE POLICY "Only service role or AI workers can insert AI analyses"
    ON public.ai_analyses
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Only service role or AI workers can update AI analyses"
    ON public.ai_analyses
    FOR UPDATE
    USING (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- RLS: ACHIEVEMENTS Table
-- ------------------------------------------------------------------------------
-- Achievements are public badges displayed on user profile
CREATE POLICY "Achievements are viewable by everyone"
    ON public.achievements
    FOR SELECT
    USING (true);

-- Only system / service role can grant badges
CREATE POLICY "Only service role can grant achievements"
    ON public.achievements
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- RLS: XP_LOG Table
-- ------------------------------------------------------------------------------
-- Users can view their own XP audit logs (or public for auditability)
CREATE POLICY "Users can view their own XP logs"
    ON public.xp_log
    FOR SELECT
    USING (
        user_id = auth.uid() 
        OR auth.role() = 'service_role' 
        OR true
    );

-- Only system / service role can award XP entries
CREATE POLICY "Only service role can create XP logs"
    ON public.xp_log
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- ------------------------------------------------------------------------------
-- RLS & Table: QUESTS_LOG Table (Daily Quests Tracker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quests_log (
    id UUID PRIMARY KEY DEFAULT gen_random_column_uuid(),
    user_id TEXT NOT NULL,
    quest_id TEXT NOT NULL,
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    xp_awarded INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_quest_daily UNIQUE (user_id, quest_id, quest_date)
);

CREATE INDEX IF NOT EXISTS idx_quests_log_user_date ON public.quests_log(user_id, quest_date);

ALTER TABLE public.quests_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests log is viewable by everyone"
    ON public.quests_log
    FOR SELECT
    USING (true);

CREATE POLICY "Users and service role can insert quests log"
    ON public.quests_log
    FOR INSERT
    WITH CHECK (true);
