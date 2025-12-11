import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import UnitConversationThread from '@/components/UnitConversationThread';
import { 
  MessageSquare, Send, Clock, Radio, Filter, AlertTriangle, 
  Bell, BellOff, Volume2, Inbox, SendHorizontal, History, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('emergency');
  const { soundEnabled, setSoundEnabled, volume, setVolume, playNotificationSound, testSound } = useNotificationSound();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const previousMessagesRef = useRef<Set<string>>(new Set());

  const RADIO_CODES = [
    { code: '10-4', message: t('communications.radioCodes.10-4') },
    { code: '10-8', message: t('communications.radioCodes.10-8') },
    { code: '10-7', message: t('communications.radioCodes.10-7') },
    { code: '10-20', message: t('communications.radioCodes.10-20') },
    { code: '10-23', message: t('communications.radioCodes.10-23') },
    { code: '10-24', message: t('communications.radioCodes.10-24') },
    { code: '10-97', message: t('communications.radioCodes.10-97') },
    { code: '10-98', message: t('communications.radioCodes.10-98') },
    { code: '10-99', message: t('communications.radioCodes.10-99') },
  ];

  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
        title: t('communications.errorTitle'),
        description: t('communications.failedToLoadCommunications'),
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
        (payload) => {
          const newMessage = payload.new as CommunicationMessage;
          
          if (newMessage.from_user_id !== session?.user?.id) {
            if (!previousMessagesRef.current.has(newMessage.id)) {
              previousMessagesRef.current.add(newMessage.id);
              playNotificationSound(newMessage.priority_level);
              
              if (newMessage.priority_level <= 2) {
                toast({
                  title: t('communications.incomingMessage'),
                  description: `${newMessage.message_content?.substring(0, 60)}...`,
                  variant: newMessage.priority_level === 1 ? 'destructive' : 'default'
                });
              }
            }
          }
          
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    if (messages.length > 0 && previousMessagesRef.current.size === 0) {
      messages.forEach(m => previousMessagesRef.current.add(m.id));
    }
  }, [messages]);

  const acknowledgeMessage = async (messageId: string) => {
    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: { 
          action: 'acknowledge_message',
          message_id: messageId
        }
      });

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, acknowledged: true, acknowledged_at: new Date().toISOString() }
            : msg
        )
      );

      toast({
        title: t('communications.messageAcknowledged'),
        description: t('communications.messageMarkedAcknowledged')
      });
    } catch (error) {
      console.error('Error acknowledging message:', error);
      toast({
        title: t('communications.errorTitle'),
        description: t('communications.failedToAcknowledgeMessage'),
        variant: "destructive"
      });
    }
  };

  const sendReply = async (message: string = replyMessage, isRadioCode: boolean = false, radioCode?: string, unitId?: string) => {
    const targetUnitId = unitId || selectedUnitId;
    if (!message.trim() || !targetUnitId) return;

    try {
      const { error } = await supabase.functions.invoke('unit-communications', {
        body: {
          action: 'send_message',
          to_unit_id: targetUnitId,
          message_content: message,
          message_type: 'text',
          priority_level: 2,
          is_radio_code: isRadioCode,
          radio_code: radioCode
        }
      });

      if (error) throw error;

      if (!unitId) {
        setReplyMessage('');
      }
      
      toast({
        title: t('communications.messageSent'),
        description: t('communications.messageSentToUnit')
      });

      fetchMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: t('communications.errorTitle'),
        description: t('communications.failedToSendMessage'),
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
      case 1: return t('communications.priorityLabels.high');
      case 2: return t('communications.priorityLabels.medium');
      case 3: return t('communications.priorityLabels.low');
      default: return t('communications.priorityLabels.normal');
    }
  };

  // Filter messages by priority
  const filterByPriority = (msgs: CommunicationMessage[]) => {
    if (filterPriority === 'all') return msgs;
    return msgs.filter(m => m.priority_level.toString() === filterPriority);
  };

  // Inbox: Incoming messages requiring action (unacknowledged, from others)
  const inboxMessages = filterByPriority(
    messages.filter(m => m.from_user_id !== session?.user?.id && !m.acknowledged)
  ).sort((a, b) => {
    if (a.priority_level !== b.priority_level) return a.priority_level - b.priority_level;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Sent: Messages sent by dispatcher
  const sentMessages = filterByPriority(
    messages.filter(m => m.from_user_id === session?.user?.id)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // History: All messages grouped by unit
  const historyMessages = filterByPriority(messages)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Group messages by unit for conversation threads
  const groupedByUnit = messages.reduce((acc, msg) => {
    const unitId = msg.from_unit_id;
    if (!acc[unitId]) {
      acc[unitId] = {
        unitId,
        unitCode: msg.emergency_units?.unit_code || t('communications.unknownUnit'),
        unitName: msg.emergency_units?.unit_name || unitId?.slice(0, 8) || '',
        messages: [],
        unreadCount: 0
      };
    }
    acc[unitId].messages.push(msg);
    if (msg.from_user_id !== session?.user?.id && !msg.acknowledged) {
      acc[unitId].unreadCount++;
    }
    return acc;
  }, {} as Record<string, { unitId: string; unitCode: string; unitName: string; messages: CommunicationMessage[]; unreadCount: number }>);

  // Sort conversations by unread count then by last message time
  const sortedConversations = Object.values(groupedByUnit).sort((a, b) => {
    if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
    const aLastTime = new Date(a.messages[0]?.created_at || 0).getTime();
    const bLastTime = new Date(b.messages[0]?.created_at || 0).getTime();
    return bLastTime - aLastTime;
  });

  // Pagination for history
  const totalPages = Math.ceil(historyMessages.length / ITEMS_PER_PAGE);
  const paginatedHistory = historyMessages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const unreadCount = inboxMessages.length;

  // Get unique units for compose selector
  const availableUnits = Array.from(new Set(messages.map(m => m.from_unit_id)))
    .map(unitId => {
      const unit = messages.find(m => m.from_unit_id === unitId)?.emergency_units;
      return { id: unitId, code: unit?.unit_code || `Unit ${unitId?.slice(0, 8)}`, name: unit?.unit_name || '' };
    });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('communications.unitCommunications')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">{t('communications.loadingCommunications')}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              {t('communications.unitCommunications')}
              <Badge variant="secondary">{messages.length}</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {unreadCount} {t('communications.unread')}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-28 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('communications.allPriority')}</SelectItem>
                    <SelectItem value="1">{t('communications.highPriority')}</SelectItem>
                    <SelectItem value="2">{t('communications.mediumPriority')}</SelectItem>
                    <SelectItem value="3">{t('communications.lowPriority')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sound Controls */}
              <div className="flex items-center gap-1 border-l pl-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`h-8 w-8 p-0 ${soundEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                  title={soundEnabled ? t('communications.soundEnabled') : t('communications.soundDisabled')}
                >
                  {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </Button>
                
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                    className="h-8 w-8 p-0"
                    title={t('communications.volume')}
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  
                  {showVolumeSlider && (
                    <div className="absolute top-full mt-2 right-0 bg-popover border rounded-lg shadow-lg p-3 z-50 w-40">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">{t('communications.volume')}</span>
                        <span className="text-xs font-medium ml-auto">{Math.round(volume * 100)}%</span>
                      </div>
                      <Slider
                        value={[volume * 100]}
                        onValueChange={([val]) => setVolume(val / 100)}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testSound('high')}
                        className="w-full mt-2 text-xs"
                      >
                        {t('communications.testSound')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabs: Inbox / Sent / History */}
          <Tabs defaultValue="inbox" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                {t('communications.inbox')}
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="h-5 px-1.5 text-xs">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <SendHorizontal className="h-4 w-4" />
                {t('communications.sent')}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t('communications.history')}
              </TabsTrigger>
            </TabsList>

            {/* Inbox Tab - Conversation Threads with Unread */}
            <TabsContent value="inbox" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {sortedConversations.filter(c => c.unreadCount > 0).length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <Inbox className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>{t('communications.noUnacknowledgedMessages')}</p>
                    </div>
                  ) : (
                    sortedConversations
                      .filter(c => c.unreadCount > 0)
                      .map(conversation => (
                        <UnitConversationThread
                          key={conversation.unitId}
                          unitId={conversation.unitId}
                          unitCode={conversation.unitCode}
                          unitName={conversation.unitName}
                          messages={conversation.messages.sort((a, b) => 
                            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                          )}
                          currentUserId={session?.user?.id || ''}
                          unreadCount={conversation.unreadCount}
                          onAcknowledge={acknowledgeMessage}
                          onQuickReply={(unitId, message) => sendReply(message, false, undefined, unitId)}
                          getPriorityColor={getPriorityColor}
                          getPriorityLabel={getPriorityLabel}
                        />
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Sent Tab - Messages sent by dispatcher */}
            <TabsContent value="sent" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 pr-4">
                  {sentMessages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <SendHorizontal className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>{t('communications.noSentMessages')}</p>
                    </div>
                  ) : (
                    sentMessages.map(message => (
                      <div
                        key={message.id}
                        className="border rounded-lg p-3 bg-primary/5 border-l-4 border-l-primary"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              → {message.emergency_units?.unit_code || t('communications.unknownUnit')}
                            </Badge>
                            <Badge variant={getPriorityColor(message.priority_level) as any} className="text-xs">
                              {getPriorityLabel(message.priority_level)}
                            </Badge>
                            {message.is_radio_code && (
                              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                <Radio className="h-3 w-3" />
                                {message.radio_code}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{message.message_content}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* History Tab - All conversations */}
            <TabsContent value="history" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {sortedConversations.length === 0 ? (
                    <div className="text-center text-muted-foreground py-12">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>{t('communications.noRecentMessages')}</p>
                    </div>
                  ) : (
                    sortedConversations.map(conversation => (
                      <UnitConversationThread
                        key={conversation.unitId}
                        unitId={conversation.unitId}
                        unitCode={conversation.unitCode}
                        unitName={conversation.unitName}
                        messages={conversation.messages.sort((a, b) => 
                          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                        )}
                        currentUserId={session?.user?.id || ''}
                        unreadCount={conversation.unreadCount}
                        onAcknowledge={acknowledgeMessage}
                        onQuickReply={(unitId, message) => sendReply(message, false, undefined, unitId)}
                        getPriorityColor={getPriorityColor}
                        getPriorityLabel={getPriorityLabel}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t('communications.page')} {currentPage} {t('communications.of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Always-Visible Compose Panel */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Send className="h-4 w-4" />
              {t('communications.compose')}
            </h3>
            
            <div className="space-y-3">
              {/* Unit Selection */}
              <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('communications.chooseUnitToMessage')} />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.code} - {unit.name || t('communications.unknownUnit')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Quick Radio Codes */}
              <div className="flex flex-wrap gap-1">
                {RADIO_CODES.map(code => (
                  <Button
                    key={code.code}
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickCode(code.code, code.message)}
                    disabled={!selectedUnitId}
                    className="text-xs h-7"
                    title={code.message}
                  >
                    <Radio className="h-3 w-3 mr-1" />
                    {code.code}
                  </Button>
                ))}
              </div>

              {/* Custom Message */}
              <div className="flex gap-2">
                <Textarea
                  placeholder={t('communications.typeCustomMessage')}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 min-h-[60px]"
                  rows={2}
                />
                <Button 
                  onClick={() => sendReply()} 
                  disabled={!replyMessage.trim() || !selectedUnitId}
                  className="self-end"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t('communications.sendMessage')}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DispatcherCommunications;
