-- Update storage policy to allow nested proof uploads under proof-documents/{userId}/...
DROP POLICY IF EXISTS "Users can upload address photos" ON storage.objects;

CREATE POLICY "Users can upload address photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'address-photos' AND 
  (
    (auth.uid())::text = (storage.foldername(name))[1] -- e.g., userId/filename.jpg
    OR (
      (storage.foldername(name))[1] = 'proof-documents' AND  -- e.g., proof-documents/userId/filename.pdf
      (auth.uid())::text = (storage.foldername(name))[2]
    )
  )
);
