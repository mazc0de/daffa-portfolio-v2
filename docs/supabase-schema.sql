-- ========================================================
-- SUPABASE SCHEMA FOR PORTFOLIO BLOG & CMS
-- Execute this SQL script in your Supabase SQL Editor
-- ========================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#1040C0',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Policies for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" 
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow public write categories for CMS" 
  ON public.categories FOR ALL USING (true) WITH CHECK (true);

-- Insert Default Categories
INSERT INTO public.categories (name, slug, color, description)
VALUES 
  ('ENGINEERING', 'engineering', '#D02020', 'Software development, React 19 & architecture'),
  ('DESIGN', 'design', '#1040C0', 'Bauhaus UI, spatial design systems & CSS'),
  ('THOUGHTS', 'thoughts', '#F0C020', 'Career insights and engineering philosophy'),
  ('TUTORIAL', 'tutorial', '#121212', 'Step by step guides and code walkthroughs'),
  ('GENERAL', 'general', '#1040C0', 'General updates and announcements')
ON CONFLICT (slug) DO NOTHING;

-- 2. Create posts table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  read_time TEXT NOT NULL DEFAULT '3 min read',
  likes INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add likes column if table already exists without it
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes INT DEFAULT 0;

-- Create index for faster slug lookups & queries
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
CREATE INDEX IF NOT EXISTS posts_published_idx ON public.posts(published);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create Policies for posts
CREATE POLICY "Public read published posts" 
  ON public.posts 
  FOR SELECT 
  USING (published = true);

CREATE POLICY "Allow public write access for CMS demo" 
  ON public.posts 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Automatic updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
