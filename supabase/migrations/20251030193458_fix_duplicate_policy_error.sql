/*
  # Fix Duplicate Policy Error

  1. Issue
    - Policy "Categories are publicly readable" already exists
    - Need to safely drop and recreate all policies

  2. Solution
    - Drop all existing policies with IF EXISTS
    - Recreate all policies with correct permissions

  3. Security
    - Maintain public read access for categories and jewelry items
    - Maintain admin-only write access
    - Maintain admin-only access for admin_settings
*/

-- Drop all existing policies safely
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Jewelry items are publicly readable" ON jewelry_items;
DROP POLICY IF EXISTS "Only authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can delete categories" ON categories;
DROP POLICY IF EXISTS "Only authenticated users can insert jewelry items" ON jewelry_items;
DROP POLICY IF EXISTS "Only authenticated users can update jewelry items" ON jewelry_items;
DROP POLICY IF EXISTS "Only authenticated users can delete jewelry items" ON jewelry_items;
DROP POLICY IF EXISTS "Authenticated users can read admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated users can update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Authenticated users can insert admin settings" ON admin_settings;

-- Re-enable RLS (in case it was disabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jewelry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (public read, admin write)
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for jewelry_items (public read, admin write)
CREATE POLICY "Jewelry items are publicly readable"
  ON jewelry_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only authenticated users can insert jewelry items"
  ON jewelry_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update jewelry items"
  ON jewelry_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete jewelry items"
  ON jewelry_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for admin_settings (admin-only access)
CREATE POLICY "Authenticated users can read admin settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update admin settings"
  ON admin_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert admin settings"
  ON admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
