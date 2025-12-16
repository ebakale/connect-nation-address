-- Make delivery-proof bucket public so recipients can view proof images
UPDATE storage.buckets 
SET public = true 
WHERE id = 'delivery-proof';