import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCheck, Clock, Radio } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunicationMessage {
  id: string;
  from_user_id: string;
  from_unit_id: string;
  message_content: string;
  message_type: string;
  priority_level: number;
  acknowledged: boolean;
  acknowledged_at: string | null;
  is_radio_code: boolean;
  radio_code: string | null;
  created_at: string;
  metadata?: any;
  profiles?: {
    full_name: string;
  };
  emergency_units?: {
    unit_name: string;
    unit_code: string;
  };
}

const DispatcherCommunications: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [session?.user?.id]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('unit-communications', {
        body: { action: 'get_messages' }
      });

      if (error) throw error;
      
      if (data?.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load communications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('unit-communications-dispatcher')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unit_communications'
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acknowledgeMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: { 
          action: 'acknowledge_message',
          message_id: messageId
        }
      });

      if (error) throw error;

      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : msg
        )
      );

      toast({
        title: "Message Acknowledged",
        description: "Message has been marked as acknowledged"
      });
    } catch (error) {
      console.error('Error acknowledging message:', error);
      toast({
        title: "Error",
        description: "Failed to acknowledge message",
        variant: "destructive"
      });
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedUnitId) return;

    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          to_unit_id: selectedUnitId,
          message_content: replyMessage,
          message_type: 'text',
          priority_level: 2
        }
      });

      if (error) throw error;

      setReplyMessage('');
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the unit"
      });

      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'destructive';
      case 2: return 'default';
      case 3: return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Normal';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Unit Communications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading communications...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Unit Communications
          <Badge variant="secondary">{messages.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Reply Section */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Quick Reply</div>
          <div className="flex gap-2">
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="flex h-9 w-32 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select Unit</option>
              {Array.from(new Set(messages.map(m => m.from_unit_id))).map(unitId => {
                const unit = messages.find(m => m.from_unit_id === unitId)?.emergency_units;
                return (
                  <option key={unitId} value={unitId}>
                    {unit?.unit_code || `Unit ${unitId?.slice(0, 8)}`}
                  </option>
                );
              })}
            </select>
            <Input
              placeholder="Type your message..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendReply()}
              className="flex-1"
            />
            <Button onClick={sendReply} disabled={!replyMessage.trim() || !selectedUnitId}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No communications received yet
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {message.emergency_units?.unit_code || 'Unknown Unit'}
                      </Badge>
                      <Badge variant={getPriorityColor(message.priority_level)} className="text-xs">
                        {getPriorityLabel(message.priority_level)}
                      </Badge>
                      {message.is_radio_code && (
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          {message.radio_code}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {message.acknowledged ? (
                        <CheckCheck className="h-4 w-4 text-green-600" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeMessage(message.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {message.message_content}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      From: {message.profiles?.full_name || 'Unknown Officer'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DispatcherCommunications;