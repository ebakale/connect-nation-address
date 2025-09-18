-- Create RLS policies for residency-documents storage bucket
-- Users should be able to upload to their own folder in the bucket

-- Policy to allow users to upload documents to their own folder
CREATE POLICY "Users can upload to their own folder in residency-documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to view their own documents
CREATE POLICY "Users can view their own documents in residency-documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to update their own documents (for re-uploads)
CREATE POLICY "Users can update their own documents in residency-documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow users to delete their own documents if needed
CREATE POLICY "Users can delete their own documents in residency-documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'residency-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy to allow verifiers and authorized staff to view documents for verification
CREATE POLICY "Verifiers can view documents for verification"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'residency-documents' 
  AND (
    -- User has verifier role
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('verifier', 'registrar', 'admin')
    )
    OR
    -- User is authorized verifier
    EXISTS (
      SELECT 1 FROM authorized_verifiers av
      WHERE av.user_id = auth.uid() 
      AND av.is_active = true
      AND (av.expires_at IS NULL OR av.expires_at > now())
      AND 'residency_verification' = ANY(av.verification_scope)
    )
  )
);