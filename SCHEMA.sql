-- Run this in your Supabase SQL Editor

-- 1. PROFILES TABLE (Linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  governorate TEXT,
  institution TEXT,
  institution_id TEXT,
  stage TEXT,
  interests TEXT[],
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. POSTS TABLE
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'announcement', 'event', 'opportunity', 'student', 'urgent', 'insight'
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  governorate TEXT NOT NULL,
  institution TEXT NOT NULL,
  institution_id TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb, -- For event dates, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STORAGE BUCKET (Create this in Supabase Storage UI named 'posts')
-- Make sure to set bucket to public if you want easy link sharing

-- 4. RLS RULES (Security)

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Posts
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow reading based on rules: SAME institution OR "All Iraq" (represented by open reads)
-- Rule: Users only see posts from their institution by default, but we'll filter in the app.
-- For true security based on institution, you could add:
-- CREATE POLICY "View posts from same institution" ON posts FOR SELECT 
-- USING (institution = (SELECT institution FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Posts are viewable by everyone." ON posts FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts." ON posts FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts." ON posts FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts." ON posts FOR DELETE 
USING (auth.uid() = author_id);
