-- Create storage bucket for residency verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('residency-documents', 'residency-documents', false);

-- Create RLS policies for residency documents storage
CREATE POLICY "Users can upload their own residency documents"
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own residency documents"
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own residency documents"
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own residency documents"
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);