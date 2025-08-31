import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface SendUnitMessageDialogProps {
  unitId: string;
  unitCode: string;
  children: React.ReactNode;
}

export const SendUnitMessageDialog: React.FC<SendUnitMessageDialogProps> = ({ 
  unitId, 
  unitCode, 
  children 
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('3');
  const [messageType, setMessageType] = useState('status_update');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          message_content: message,
          message_type: messageType,
          priority_level: parseInt(priority),
          unit_id: unitId,
          metadata: {
            unit_code: unitCode,
            sent_from: 'unit_lead_dashboard'
          }
        }
      });

      if (error) throw error;

      toast.success("Message sent to dispatch successfully");
      setMessage('');
      setOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Unit Message
          </DialogTitle>
          <DialogDescription>
            Send a message from {unitCode} to dispatch center
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-type">Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="status_update">Status Update</SelectItem>
                <SelectItem value="request_info">Request Information</SelectItem>
                <SelectItem value="report_complete">Report Complete</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="on_scene">On Scene</SelectItem>
                <SelectItem value="request_supervisor">Request Supervisor</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High Priority</SelectItem>
                <SelectItem value="2">Medium Priority</SelectItem>
                <SelectItem value="3">Normal Priority</SelectItem>
                <SelectItem value="4">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message to dispatch..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !message.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};