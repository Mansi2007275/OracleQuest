// ==============================================================================
// OracleQuest TypeScript Definitions & Supabase Database Types
// ==============================================================================

export type PredictionChoice = 'YES' | 'NO';
export type EventStatus = 'active' | 'closed' | 'resolved' | 'cancelled';
export type ResolutionOutcome = 'YES' | 'NO' | 'CANCELLED';

export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  xp: number;
  level: number;
  rank: string;
  created_at: string;
  updated_at?: string;
}

export interface Event {
  id: string;
  title: string;
  category: string;
  description: string;
  deadline: string;
  status: EventStatus;
  resolution: ResolutionOutcome | null;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  event_id: string;
  choice: PredictionChoice;
  tx_hash: string | null;
  ai_summary: string | null;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  event_id: string;
  bull_analysis: string;
  bear_analysis: string;
  risk_analysis: string;
  confidence_score: number;
  created_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_name: string;
  earned_at: string;
}

export interface XPLog {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

// Supabase Database Schema Helper Type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<User>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Event>;
      };
      predictions: {
        Row: Prediction;
        Insert: Omit<Prediction, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Prediction>;
      };
      ai_analyses: {
        Row: AIAnalysis;
        Insert: Omit<AIAnalysis, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<AIAnalysis>;
      };
      achievements: {
        Row: Achievement;
        Insert: Omit<Achievement, 'id' | 'earned_at'> & { id?: string; earned_at?: string };
        Update: Partial<Achievement>;
      };
      xp_log: {
        Row: XPLog;
        Insert: Omit<XPLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<XPLog>;
      };
    };
  };
}
