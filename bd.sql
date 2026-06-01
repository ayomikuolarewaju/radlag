-- Additional Database Schema for new features
-- Run this in Supabase SQL editor

-- Events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_attendees INTEGER DEFAULT 50,
  current_attendees INTEGER DEFAULT 0,
  organizer_id UUID REFERENCES profiles(id),
  organizer_name TEXT,
  event_type TEXT CHECK (event_type IN ('meeting', 'workshop', 'social', 'training')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees junction table
CREATE TABLE event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, member_id)
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  salary_range TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior')),
  posted_by UUID REFERENCES profiles(id),
  poster_name TEXT,
  application_deadline DATE,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery photos table
CREATE TABLE gallery_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploader_name TEXT,
  event_id UUID REFERENCES events(id) NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo likes table
CREATE TABLE photo_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES gallery_photos(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(photo_id, member_id)
);

-- Photo comments table
CREATE TABLE photo_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES gallery_photos(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id),
  member_name TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_gallery_photos_created_at ON gallery_photos(created_at);
CREATE INDEX idx_photo_comments_photo_id ON photo_comments(photo_id);

-- RLS Policies for new tables

-- Events policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = organizer_id);

-- Event attendees policies
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage own attendance" ON event_attendees FOR ALL USING (auth.uid() = member_id);

-- Jobs policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jobs" ON jobs FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post jobs" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = posted_by);

-- Gallery policies
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view photos" ON gallery_photos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload photos" ON gallery_photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete own photos" ON gallery_photos FOR DELETE USING (auth.uid() = uploaded_by);

ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON photo_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON photo_likes FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE photo_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON photo_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON photo_comments FOR ALL USING (auth.role() = 'authenticated');