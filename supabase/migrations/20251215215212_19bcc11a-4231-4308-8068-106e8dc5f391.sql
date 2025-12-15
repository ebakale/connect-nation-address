-- Enable real-time updates for pickup_requests table
-- This allows citizens, dispatchers, and supervisors to see changes instantly

-- Set REPLICA IDENTITY FULL to capture complete row data in change events
ALTER TABLE pickup_requests REPLICA IDENTITY FULL;

-- Add table to supabase_realtime publication for real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE pickup_requests;