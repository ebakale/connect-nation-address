-- Create storage bucket for address photos
INSERT INTO storage.buckets (id, name, public) VALUES ('address-photos', 'address-photos', true);

-- Create policies for address photo uploads
CREATE POLICY "Users can upload their own address photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'address-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own address photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'address-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public address photos are viewable by everyone" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'address-photos');

CREATE POLICY "Users can update their own address photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'address-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own address photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'address-photos' AND auth.uid()::text = (storage.foldername(name))[1]);