import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

interface UnitMember {
  id: string;
  officer_id: string;
  role: string;
  is_lead: boolean;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface UnitMessage {
  id: string;
  unit_id: string;
  sender_id: string;
  message: string;
  priority_level: number;
  read_by: string[];
  created_at: string;
  sender_name?: string;
}

interface UnitCommunicationsPanelProps {
  unitId: string;
  unitCode: string;
  unitMembers: UnitMember[];
}

export const UnitCommunicationsPanel: React.FC<UnitCommunicationsPanelProps> = ({
  unitId,
  unitCode,
  unitMembers
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation('emergency');
  const [messages, setMessages] = useState<UnitMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`unit-messages-${unitId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unit_messages',
          filter: `unit_id=eq.${unitId}`
        },
        (payload) => {
          const newMsg = payload.new as UnitMessage;
          // Find sender name
          const sender = unitMembers.find(m => m.officer_id === newMsg.sender_id);
          newMsg.sender_name = sender?.profiles?.full_name || 'Unknown';
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [unitId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('unit_messages')
        .select('*')
        .eq('unit_id', unitId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Enrich with sender names
      const enrichedMessages = (data || []).map(msg => {
        const sender = unitMembers.find(m => m.officer_id === msg.sender_id);
        return {
          ...msg,
          sender_name: sender?.profiles?.full_name || 'Unknown'
        };
      });

      setMessages(enrichedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('unit_messages')
        .insert({
          unit_id: unitId,
          sender_id: user.id,
          message: newMessage.trim(),
          priority_level: 3
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('common:error'),
        description: t('unitLeadershipDashboard.messageSendFailed'),
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getPriorityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('unitLeadershipDashboard.teamCommunications')} - {unitCode}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('unitLeadershipDashboard.noMessages')}</p>
                <p className="text-sm">{t('unitLeadershipDashboard.startConversation')}</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">{msg.sender_name}</span>
                          {msg.priority_level <= 2 && (
                            <Badge className={`${getPriorityColor(msg.priority_level)} text-xs h-4`}>
                              {t('unitLeadershipDashboard.urgent')}
                            </Badge>
                          )}
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Input
            placeholder={t('unitLeadershipDashboard.typeMessage')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
