-- Allow citizens to update their own pending pickup requests
CREATE POLICY "Users can update their own pending pickup requests"
ON public.pickup_requests FOR UPDATE
USING (auth.uid() = requester_id AND status = 'pending')
WITH CHECK (auth.uid() = requester_id AND status IN ('pending', 'cancelled'));

-- Allow citizens to delete/cancel their own pending pickup requests
CREATE POLICY "Users can delete their own pending pickup requests"
ON public.pickup_requests FOR DELETE
USING (auth.uid() = requester_id AND status = 'pending');