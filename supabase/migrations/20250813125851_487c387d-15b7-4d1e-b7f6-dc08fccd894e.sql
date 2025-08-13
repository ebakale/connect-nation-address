-- Add photo_url column to addresses table
ALTER TABLE public.addresses 
ADD COLUMN photo_url text;

-- Create storage bucket for address photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('address-photos', 'address-photos', true);

-- Create storage policies for address photos
CREATE POLICY "Users can view address photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'address-photos');

CREATE POLICY "Users can upload address photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'address-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own address photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'address-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own address photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'address-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);