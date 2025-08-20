-- Add auto-verification tracking columns to address_requests
ALTER TABLE public.address_requests 
ADD COLUMN IF NOT EXISTS auto_verification_score DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS auto_verification_analysis JSONB,
ADD COLUMN IF NOT EXISTS auto_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS requires_manual_review BOOLEAN DEFAULT false;