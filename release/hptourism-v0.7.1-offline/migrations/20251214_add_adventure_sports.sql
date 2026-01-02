-- Migration: Add Adventure Sports Support
-- Date: 2025-12-14
-- Description: Add indexes and comments for adventure sports functionality

-- Add comment to adventure_sports_data column
COMMENT ON COLUMN homestay_applications.adventure_sports_data IS 'JSONB data for adventure sports applications including activities, insurance, safety equipment, trained staff, and emergency protocols';

-- Create index for application type for faster filtering
CREATE INDEX IF NOT EXISTS idx_applications_type ON homestay_applications(application_type);

-- Create GIN index for adventure sports JSONB data for efficient querying
CREATE INDEX IF NOT EXISTS idx_applications_adventure_data ON homestay_applications USING GIN (adventure_sports_data);

-- Create index for adventure sports applications specifically
CREATE INDEX IF NOT EXISTS idx_adventure_sports_apps ON homestay_applications(application_type, status) 
WHERE application_type = 'adventure_sports';
