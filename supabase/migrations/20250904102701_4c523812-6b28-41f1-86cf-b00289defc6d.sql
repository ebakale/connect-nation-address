-- Manually trigger acknowledgment SMS for the missed incidents
INSERT INTO sms_fallback_queue (phone_number, message_content, priority, location_data, status)
VALUES 
  ('00240222577675', 
   'Incident Report Received - INC-2025-000033

Your emergency report has been received and assigned incident number INC-2025-000033. 

Emergency Type: NATURAL_DISASTER
Priority Level: 3
Emergency services have been notified and will respond according to priority level.

Time: ' || NOW()::text, 
   3, 'Emergency Location', 'pending'),
   
  ('00240222577675', 
   'Incident Update - INC-2025-000033

Your incident INC-2025-000033 status has been updated.

Previous Status: REPORTED
New Status: DISPATCHED

Emergency units have been dispatched to your location.

Time: ' || NOW()::text, 
   3, 'Emergency Location', 'pending'),
   
  ('00240222577675', 
   'Incident Report Received - INC-2025-000034

Your emergency report has been received and assigned incident number INC-2025-000034. 

Emergency Type: FIRE
Priority Level: 3
Emergency services have been notified and will respond according to priority level.

Time: ' || NOW()::text, 
   3, 'Emergency Location', 'pending'),
   
  ('00240222577675', 
   'Incident Update - INC-2025-000034

Your incident INC-2025-000034 status has been updated.

Previous Status: REPORTED
New Status: DISPATCHED

Emergency units have been dispatched to your location.

Time: ' || NOW()::text, 
   3, 'Emergency Location', 'pending');