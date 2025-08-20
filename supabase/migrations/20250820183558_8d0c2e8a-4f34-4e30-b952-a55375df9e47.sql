-- Fix storage policies for address-photos bucket to properly handle uploads
-- First, drop the existing problematic INSERT policy
DROP POLICY IF EXISTS "Users can upload address photos" ON storage.objects;

-- Create a new INSERT policy with proper WITH CHECK clause
CREATE POLICY "Users can upload address photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'address-photos' AND 
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- Ensure the bucket allows both photos and documents in subfolders
-- No changes needed to other policies as they look correct