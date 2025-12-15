-- Drop existing citizen update policy for pickup requests
DROP POLICY IF EXISTS "Users can update their own pending pickup requests" ON pickup_requests;

-- Create new policy allowing updates for pending, scheduled, and assigned statuses
CREATE POLICY "Users can update their own pickup requests"
  ON pickup_requests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = requester_id 
    AND status IN ('pending', 'scheduled', 'assigned')
  )
  WITH CHECK (
    auth.uid() = requester_id 
    AND status IN ('pending', 'scheduled', 'assigned', 'cancelled')
  );