-- Migration: Add property_area_unit column and Annexure-III checklist columns
-- Date: 2025-12-24
-- Description: Adds property area unit field as per HP Homestay Rules 2025 Annexure-I #6a
--              Adds mandatory and desirable checklist columns for Annexure-III compliance

-- Add property_area_unit column to homestay_applications table
ALTER TABLE homestay_applications 
ADD COLUMN IF NOT EXISTS property_area_unit VARCHAR(10) DEFAULT 'sqm';

-- Add Annexure-III checklist columns
ALTER TABLE homestay_applications 
ADD COLUMN IF NOT EXISTS mandatory_checklist JSONB;

ALTER TABLE homestay_applications 
ADD COLUMN IF NOT EXISTS desirable_checklist JSONB;

-- Add comments explaining the columns
COMMENT ON COLUMN homestay_applications.property_area_unit IS 'Unit selected by user for property area (sqm, sqft, kanal, marla, bigha). Default: sqm per Annexure-I #6a';
COMMENT ON COLUMN homestay_applications.mandatory_checklist IS 'Annexure-III A: 18 mandatory requirements confirmation (key: item_id, value: boolean)';
COMMENT ON COLUMN homestay_applications.desirable_checklist IS 'Annexure-III B: 18 desirable features indication (key: item_id, value: boolean)';
