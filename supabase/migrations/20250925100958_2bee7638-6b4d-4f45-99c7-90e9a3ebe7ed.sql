-- Create recent_searches table for tracking user search history
CREATE TABLE public.recent_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'address',
  results_count INTEGER DEFAULT 0,
  searched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own recent searches" 
ON public.recent_searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recent searches" 
ON public.recent_searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches" 
ON public.recent_searches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_recent_searches_user_id ON public.recent_searches(user_id);
CREATE INDEX idx_recent_searches_searched_at ON public.recent_searches(user_id, searched_at DESC);
CREATE INDEX idx_recent_searches_query ON public.recent_searches(user_id, search_query);