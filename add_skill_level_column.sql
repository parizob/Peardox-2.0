-- Add skill_level column to existing public.profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skill_level TEXT DEFAULT 'Beginner';

-- Update any existing profiles without a skill_level to have the default
UPDATE public.profiles 
SET skill_level = 'Beginner' 
WHERE skill_level IS NULL; 