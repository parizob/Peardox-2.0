-- Migration: Add mode column to profiles table for dark/light mode preference
-- Run this in your Supabase SQL Editor

-- Step 1: Add the mode column with default value 'light'
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'light';

-- Step 2: Add a check constraint to ensure only valid values
ALTER TABLE profiles 
ADD CONSTRAINT check_mode_value 
CHECK (mode IN ('light', 'dark'));

-- Step 3: Update all existing profiles to have 'light' mode (in case any have NULL)
UPDATE profiles 
SET mode = 'light' 
WHERE mode IS NULL;

-- Step 4: Create an index for potential queries filtering by mode
CREATE INDEX IF NOT EXISTS idx_profiles_mode ON profiles(mode);

-- Verification: Check the column was added correctly
-- SELECT id, full_name, mode FROM profiles LIMIT 10;

-- Note: The column will automatically default to 'light' for all new users
-- and existing users will have 'light' set as their initial mode preference

