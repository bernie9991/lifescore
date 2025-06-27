/*
  # Complete LifeScore Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar_url` (text, optional)
      - `age` (integer, optional)
      - `gender` (text, optional)
      - `country` (text)
      - `city` (text)
      - `life_score` (integer, default 0)
      - `avatar_badge_id` (text, optional)
      - `wants_integrations` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `wealth_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `salary` (integer, default 0)
      - `savings` (integer, default 0)
      - `investments` (integer, default 0)
      - `currency` (text, default 'USD')
      - `total` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `knowledge_data`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `education` (text)
      - `certificates` (text[], default '{}')
      - `languages` (text[], default '{}')
      - `total_score` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `name` (text)
      - `value` (integer)
      - `verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_badges`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `badge_id` (text)
      - `unlocked_at` (timestamp)
      - `created_at` (timestamp)
    
    - `friendships`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `friend_id` (uuid, references profiles)
      - `status` (text, default 'pending') -- 'pending', 'accepted', 'blocked'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public profile information
*/

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS assets CASCADE;
DROP TABLE IF EXISTS knowledge_data CASCADE;
DROP TABLE IF EXISTS wealth_data CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  age integer,
  gender text,
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  life_score integer DEFAULT 0,
  avatar_badge_id text,
  wants_integrations boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wealth_data table
CREATE TABLE wealth_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  salary integer DEFAULT 0,
  savings integer DEFAULT 0,
  investments integer DEFAULT 0,
  currency text DEFAULT 'USD',
  total integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create knowledge_data table
CREATE TABLE knowledge_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  education text DEFAULT '',
  certificates text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  total_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL,
  value integer NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create friendships table
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Wealth data policies
CREATE POLICY "Users can manage own wealth data"
  ON wealth_data
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Knowledge data policies
CREATE POLICY "Users can manage own knowledge data"
  ON knowledge_data
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Assets policies
CREATE POLICY "Users can manage own assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- User badges policies
CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read public badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Friendships policies
CREATE POLICY "Users can manage own friendships"
  ON friendships
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wealth_data_updated_at BEFORE UPDATE ON wealth_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_data_updated_at BEFORE UPDATE ON knowledge_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_wealth_data_user_id ON wealth_data(user_id);
CREATE INDEX idx_knowledge_data_user_id ON knowledge_data(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_profiles_life_score ON profiles(life_score DESC);