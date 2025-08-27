import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, CheckCheck, Clock, Radio, Filter, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
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

const RADIO_CODES = [
  { code: '10-4', message: 'Acknowledged/Copy' },
  { code: '10-8', message: 'In Service' },
  { code: '10-7', message: 'Out of Service' },
  { code: '10-20', message: 'Location' },
  { code: '10-23', message: 'Arrived at Scene' },
  { code: '10-24', message: 'Assignment Completed' },
  { code: '10-97', message: 'Arrived at Scene' },
  { code: '10-98', message: 'Assignment Complete' },
  { code: '10-99', message: 'Officer Safety/Emergency' },
];

const DispatcherCommunications: React.FC = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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

  const sendReply = async (message: string = replyMessage, isRadioCode: boolean = false, radioCode?: string) => {
    if (!message.trim() || !selectedUnitId) return;

    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          to_unit_id: selectedUnitId,
          message_content: message,
          message_type: 'text',
          priority_level: 2,
          is_radio_code: isRadioCode,
          radio_code: radioCode
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

  const sendQuickCode = (code: string, message: string) => {
    sendReply(message, true, code);
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

  // Quick Comm messages (unacknowledged only)
  const quickCommMessages = messages.filter(message => {
    const priorityMatch = filterPriority === 'all' || message.priority_level.toString() === filterPriority;
    return !message.acknowledged && priorityMatch;
  }).sort((a, b) => {
    // Sort by priority (high priority first) then by date (newest first)
    if (a.priority_level !== b.priority_level) {
      return a.priority_level - b.priority_level;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Recent Communications (all messages)
  const allFilteredMessages = messages.filter(message => {
    const priorityMatch = filterPriority === 'all' || message.priority_level.toString() === filterPriority;
    return priorityMatch;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination for all messages
  const totalPages = Math.ceil(allFilteredMessages.length / ITEMS_PER_PAGE);
  const paginatedAllMessages = allFilteredMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const unreadCount = quickCommMessages.length;

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Unit Communications
              <Badge variant="secondary">{messages.length}</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="1">High Priority</SelectItem>
                  <SelectItem value="2">Medium Priority</SelectItem>
                  <SelectItem value="3">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="compose">Compose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="mt-4 space-y-6">
              {/* Quick Comm Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Quick Comm
                    {quickCommMessages.length > 0 && (
                      <Badge variant="destructive">{quickCommMessages.length}</Badge>
                    )}
                  </h3>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {quickCommMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No unacknowledged messages
                      </div>
                    ) : (
                      quickCommMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className="border rounded-lg p-3 space-y-2 border-l-4 border-l-primary bg-accent/50"
                        >
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
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => acknowledgeMessage(message.id)}
                              >
                                Acknowledge
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium">
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
              </div>

              {/* Recent Communications Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    Recent Communications
                    {allFilteredMessages.length > 0 && (
                      <Badge variant="secondary">{allFilteredMessages.length}</Badge>
                    )}
                  </h3>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {paginatedAllMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No recent messages
                    </div>
                  ) : (
                    paginatedAllMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className="border rounded-lg p-3 space-y-2 opacity-75"
                      >
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
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCheck className="h-4 w-4" />
                            <span className="text-xs">Acknowledged</span>
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
                            {formatDistanceToNow(new Date(message.acknowledged_at || message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="compose" className="mt-4">
              <div className="space-y-4">
                {/* Unit Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Unit</label>
                  <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose unit to message" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set(messages.map(m => m.from_unit_id))).map(unitId => {
                        const unit = messages.find(m => m.from_unit_id === unitId)?.emergency_units;
                        return (
                          <SelectItem key={unitId} value={unitId}>
                            {unit?.unit_code || `Unit ${unitId?.slice(0, 8)}`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Radio Codes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Radio Codes</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RADIO_CODES.map((code) => (
                      <Button
                        key={code.code}
                        variant="outline"
                        size="sm"
                        onClick={() => sendQuickCode(code.code, code.message)}
                        disabled={!selectedUnitId}
                        className="text-xs"
                      >
                        {code.code}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Message</label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your custom message..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="flex-1"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={() => sendReply()} 
                    disabled={!replyMessage.trim() || !selectedUnitId}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatcherCommunications;