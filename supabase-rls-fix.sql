-- Fix RLS policies for news table
-- Run this in Supabase SQL Editor

-- Enable RLS on news table if not already enabled
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow public read access to news
CREATE POLICY "Allow public read access to news"
ON news
FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert news
CREATE POLICY "Allow authenticated users to insert news"
ON news
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update news
CREATE POLICY "Allow authenticated users to update news"
ON news
FOR UPDATE
TO authenticated
USING (true);

-- Allow authenticated users to delete news
CREATE POLICY "Allow authenticated users to delete news"
ON news
FOR DELETE
TO authenticated
USING (true);

-- Fix RLS policies for live_events table
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access to live_events
CREATE POLICY "Allow public read access to live_events"
ON live_events
FOR SELECT
TO public
USING (true);

-- Allow authenticated users full access to live_events
CREATE POLICY "Allow authenticated users to manage live_events"
ON live_events
FOR ALL
TO authenticated
USING (true);

-- Fix RLS policies for live_event_updates table
ALTER TABLE live_event_updates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to live_event_updates
CREATE POLICY "Allow public read access to live_event_updates"
ON live_event_updates
FOR SELECT
TO public
USING (true);

-- Allow authenticated users full access to live_event_updates
CREATE POLICY "Allow authenticated users to manage live_event_updates"
ON live_event_updates
FOR ALL
TO authenticated
USING (true);
