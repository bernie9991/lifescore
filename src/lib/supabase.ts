import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          age: number | null;
          gender: string | null;
          country: string;
          city: string;
          life_score: number;
          avatar_badge_id: string | null;
          wants_integrations: boolean;
          wealth_data: any | null; // JSONB field for wealth information
          knowledge_data: any | null; // JSONB field for knowledge information
          assets_data: any | null; // JSONB field for assets information
          badges_data: any | null; // JSONB field for badges information
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          age?: number | null;
          gender?: string | null;
          country: string;
          city: string;
          life_score?: number;
          avatar_badge_id?: string | null;
          wants_integrations?: boolean;
          wealth_data?: any | null;
          knowledge_data?: any | null;
          assets_data?: any | null;
          badges_data?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          age?: number | null;
          gender?: string | null;
          country?: string;
          city?: string;
          life_score?: number;
          avatar_badge_id?: string | null;
          wants_integrations?: boolean;
          wealth_data?: any | null;
          knowledge_data?: any | null;
          assets_data?: any | null;
          badges_data?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}