-- Migration: Add Adventure Sports Support (Phase 1A)
-- Date: 2025-12-14
-- Purpose: Enable adventure sports registration (non-motorized water sports)

-- The adventure_sports_data column already exists in homestay_applications table
-- This migration adds indexes and optional water bodies reference table

-- Add index for adventure sports applications
CREATE INDEX IF NOT EXISTS idx_applications_adventure_type 
ON homestay_applications(application_type) 
WHERE application_type = 'adventure_sports';

-- Add GIN index for JSONB adventure sports data
CREATE INDEX IF NOT EXISTS idx_applications_adventure_data 
ON homestay_applications USING GIN (adventure_sports_data);

-- Optional: Create water bodies reference table
-- This can be populated later with actual water body data
CREATE TABLE IF NOT EXISTS water_bodies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district TEXT NOT NULL,
  type TEXT CHECK (type IN ('dam', 'river', 'lake')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add index for water bodies by district
CREATE INDEX IF NOT EXISTS idx_water_bodies_district 
ON water_bodies(district) 
WHERE status = 'active';

-- Add comment to adventure_sports_data column
COMMENT ON COLUMN homestay_applications.adventure_sports_data IS 
'JSONB data for adventure sports applications. Phase 1A: Non-motorized water sports (paddle/row boats). Structure: {activityCategory, activityType, activity, operatorType, operatorName, localOfficeAddress, district, waterBodyName, areaOfOperation, equipment[], manpower[]}';
