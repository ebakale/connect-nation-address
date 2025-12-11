import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { MessageSquare, Send, CheckCheck, Clock, Radio, Filter, AlertTriangle, ChevronLeft, ChevronRight, Bell, BellOff, Volume2 } from 'lucide-react';
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
          
          // Only play sound for messages from other users (not sent by dispatcher)
          if (newMessage.from_user_id !== session?.user?.id) {
            // Check if this is a truly new message we haven't seen
            if (!previousMessagesRef.current.has(newMessage.id)) {
              previousMessagesRef.current.add(newMessage.id);
              
              // Play notification sound based on priority
              playNotificationSound(newMessage.priority_level);
              
              // Show toast for critical/high priority messages
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

  // Initialize previous messages set when messages load
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

      // Update local state
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

  // Debug logging
  console.log('All messages:', messages.map(m => ({ 
    id: m.id, 
    content: m.message_content, 
    acknowledged: m.acknowledged, 
    acknowledged_type: typeof m.acknowledged 
  })));

  // Quick Comm messages (unacknowledged only, excluding messages sent by current user)
  const quickCommMessages = messages.filter(message => {
    const priorityMatch = filterPriority === 'all' || message.priority_level.toString() === filterPriority;
    const isNotOwnMessage = message.from_user_id !== session?.user?.id;
    return message.acknowledged === false && priorityMatch && isNotOwnMessage;
  }).sort((a, b) => {
    // Sort by priority (high priority first) then by date (newest first)
    if (a.priority_level !== b.priority_level) {
      return a.priority_level - b.priority_level;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Recent Communications (all messages with pagination)
  const recentCommMessages = messages.filter(message => {
    const priorityMatch = filterPriority === 'all' || message.priority_level.toString() === filterPriority;
    return priorityMatch;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination for recent communications
  const totalPages = Math.ceil(recentCommMessages.length / ITEMS_PER_PAGE);
  const paginatedRecentMessages = recentCommMessages.slice(
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
        <CardHeader>
          <CardTitle className="flex items-center flex-wrap gap-2 text-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('communications.unitCommunications')}
              <Badge variant="secondary">{messages.length}</Badge>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {unreadCount} {t('communications.unread')}
                </Badge>
              )}
            </div>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
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
            <div className="flex items-center gap-2 border-l pl-3">
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
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
               <TabsTrigger value="messages">{t('communications.messages')}</TabsTrigger>
               <TabsTrigger value="compose">{t('communications.compose')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="mt-4 space-y-6">
              {/* Quick Comm Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    {t('communications.quickComm')}
                    {quickCommMessages.length > 0 && (
                      <Badge variant="destructive">{quickCommMessages.length}</Badge>
                    )}
                  </h3>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {quickCommMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        {t('communications.noUnacknowledgedMessages')}
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
                                 {message.emergency_units?.unit_code || t('communications.unknownUnit')}
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
                                {t('communications.acknowledge')}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="text-sm font-medium">
                            {message.message_content}
                          </div>
                          
                           <div className="flex items-center justify-between text-xs text-muted-foreground">
                             <span>
                               {t('communications.from')}: {message.profiles?.full_name || t('communications.unknownOfficer')}
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
                    {t('communications.recentCommunications')}
                    {recentCommMessages.length > 0 && (
                      <Badge variant="secondary">{recentCommMessages.length}</Badge>
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
                         {t('communications.page')} {currentPage} {t('communications.of')} {totalPages}
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
                  {paginatedRecentMessages.length === 0 ? (
                     <div className="text-center text-muted-foreground py-8">
                       {t('communications.noRecentMessages')}
                     </div>
                  ) : (
                    paginatedRecentMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`border rounded-lg p-3 space-y-2 ${
                          message.acknowledged ? 'opacity-75' : 'border-l-4 border-l-primary bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs">
                               {message.emergency_units?.unit_code || t('communications.unknownUnit')}
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
                           <div className="flex items-center gap-1">
                             {message.acknowledged ? (
                               <div className="flex items-center gap-1 text-green-600">
                                 <CheckCheck className="h-4 w-4" />
                                 <span className="text-xs">{t('communications.acknowledged')}</span>
                               </div>
                             ) : message.from_user_id === session?.user?.id ? (
                               <div className="flex items-center gap-1 text-blue-600">
                                 <Send className="h-4 w-4" />
                                 <span className="text-xs">{t('communications.sentByYou')}</span>
                               </div>
                             ) : (
                               <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => acknowledgeMessage(message.id)}
                               >
                                  {t('communications.acknowledge')}
                               </Button>
                             )}
                           </div>
                        </div>
                        
                        <div className="text-sm">
                          {message.message_content}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                           <span>
                             {t('communications.from')}: {message.profiles?.full_name || t('communications.unknownOfficer')}
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
                   <label className="text-sm font-medium">{t('communications.selectUnit')}</label>
                  <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('communications.chooseUnitToMessage')} />
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
                   <label className="text-sm font-medium">{t('communications.quickRadioCodes')}</label>
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
                   <label className="text-sm font-medium">{t('communications.customMessage')}</label>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={t('communications.typeCustomMessage')}
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
                    {t('communications.sendMessage')}
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