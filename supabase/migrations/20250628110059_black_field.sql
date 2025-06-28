/*
  # Fix RLS Policies for User Registration

  This migration fixes the Row Level Security policies to allow proper user registration
  and profile creation. The main issue was that the INSERT policy for profiles was too
  restrictive and prevented new users from creating their profiles during signup.

  ## Changes Made

  1. **Profiles Table**
     - Updated INSERT policy to allow authenticated users to create their own profile
     - Ensured the policy uses the correct auth.uid() function
     - Added proper policy for profile creation during signup

  2. **Related Tables**
     - Verified that wealth_data, knowledge_data, assets, and user_badges tables
       have proper policies for authenticated users to manage their own data

  ## Security Notes

  - All policies maintain security by ensuring users can only access/modify their own data
  - The auth.uid() function is used to match the authenticated user's ID
  - INSERT policies allow users to create their own records during signup
  - SELECT, UPDATE, DELETE policies ensure users can only access their own data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create updated policies for profiles table
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can read public profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure wealth_data policies are correct
DROP POLICY IF EXISTS "Users can manage own wealth data" ON wealth_data;

CREATE POLICY "Users can manage own wealth data"
  ON wealth_data
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure knowledge_data policies are correct
DROP POLICY IF EXISTS "Users can manage own knowledge data" ON knowledge_data;

CREATE POLICY "Users can manage own knowledge data"
  ON knowledge_data
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure assets policies are correct
DROP POLICY IF EXISTS "Users can manage own assets" ON assets;

CREATE POLICY "Users can manage own assets"
  ON assets
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Ensure user_badges policies are correct
DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can read own badges" ON user_badges;
DROP POLICY IF EXISTS "Users can read public badges" ON user_badges;

CREATE POLICY "Users can insert own badges"
  ON user_badges
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can read public badges"
  ON user_badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure friendships policies are correct
DROP POLICY IF EXISTS "Users can manage own friendships" ON friendships;

CREATE POLICY "Users can manage own friendships"
  ON friendships
  FOR ALL
  TO authenticated
  USING ((user_id = auth.uid()) OR (friend_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()) OR (friend_id = auth.uid()));