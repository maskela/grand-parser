-- ==================== CLEANUP SCRIPT ====================
-- This drops all existing tables from the old project
-- Run this FIRST if you have existing tables that conflict
-- ========================================================

-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_id_from_clerk(TEXT) CASCADE;

-- Note: This will delete ALL data in these tables!
-- Make sure you've backed up any important data first.


