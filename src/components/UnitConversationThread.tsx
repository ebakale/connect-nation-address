import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Radio, Clock, CheckCheck, Send, ArrowLeft, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface Message {
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
  profiles?: { full_name: string };
  emergency_units?: { unit_name: string; unit_code: string };
}

interface UnitConversationThreadProps {
  unitId: string;
  unitCode: string;
  unitName: string;
  messages: Message[];
  currentUserId: string;
  unreadCount: number;
  onAcknowledge: (messageId: string) => void;
  onQuickReply: (unitId: string, message: string) => void;
  getPriorityColor: (priority: number) => string;
  getPriorityLabel: (priority: number) => string;
}

const UnitConversationThread: React.FC<UnitConversationThreadProps> = ({
  unitId,
  unitCode,
  unitName,
  messages,
  currentUserId,
  unreadCount,
  onAcknowledge,
  onQuickReply,
  getPriorityColor,
  getPriorityLabel,
}) => {
  const { t } = useTranslation('emergency');
  const [isExpanded, setIsExpanded] = useState(unreadCount > 0);
  const [quickReplyText, setQuickReplyText] = useState('');

  const lastMessage = messages[0];
  const isLastMessageIncoming = lastMessage?.from_user_id !== currentUserId;

  const handleQuickReply = () => {
    if (quickReplyText.trim()) {
      onQuickReply(unitId, quickReplyText);
      setQuickReplyText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickReply();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Thread Header - Clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Badge variant="outline" className="font-mono">
            {unitCode}
          </Badge>
          <span className="text-sm font-medium">{unitName}</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} {t('communications.unread')}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {lastMessage && (
            <>
              <span className="flex items-center gap-1">
                {isLastMessageIncoming ? (
                  <ArrowLeft className="h-3 w-3 text-blue-500" />
                ) : (
                  <ArrowRight className="h-3 w-3 text-green-500" />
                )}
                {lastMessage.message_content.substring(0, 30)}
                {lastMessage.message_content.length > 30 && '...'}
              </span>
              <span>•</span>
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
            </>
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t">
          {/* Messages List */}
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((message) => {
              const isOutgoing = message.from_user_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-2 ${
                      isOutgoing
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border'
                    }`}
                  >
                    {/* Direction indicator and metadata */}
                    <div className={`flex items-center gap-2 mb-1 text-xs ${
                      isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {isOutgoing ? (
                        <ArrowRight className="h-3 w-3" />
                      ) : (
                        <ArrowLeft className="h-3 w-3" />
                      )}
                      <span>
                        {isOutgoing 
                          ? t('communications.outgoing') 
                          : `${message.profiles?.full_name || t('communications.unknownOfficer')}`
                        }
                      </span>
                      {message.is_radio_code && (
                        <Badge variant={isOutgoing ? "secondary" : "outline"} className="text-xs h-5">
                          <Radio className="h-2 w-2 mr-1" />
                          {message.radio_code}
                        </Badge>
                      )}
                      <Badge 
                        variant={isOutgoing ? "secondary" : getPriorityColor(message.priority_level) as any} 
                        className="text-xs h-5"
                      >
                        {getPriorityLabel(message.priority_level)}
                      </Badge>
                    </div>

                    {/* Message content */}
                    <div className="text-sm">{message.message_content}</div>

                    {/* Footer with time and status */}
                    <div className={`flex items-center justify-between mt-1 text-xs ${
                      isOutgoing ? 'text-primary-foreground/60' : 'text-muted-foreground'
                    }`}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                      {!isOutgoing && !message.acknowledged && (
                        <Button
                          size="sm"
                          variant={isOutgoing ? "secondary" : "outline"}
                          className="h-6 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAcknowledge(message.id);
                          }}
                        >
                          {t('communications.acknowledge')}
                        </Button>
                      )}
                      {message.acknowledged && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCheck className="h-3 w-3" />
                          {t('communications.acknowledged')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reply Input */}
          <div className="border-t p-2 bg-muted/20">
            <div className="flex gap-2">
              <Input
                placeholder={t('communications.typeReply')}
                value={quickReplyText}
                onChange={(e) => setQuickReplyText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 h-8 text-sm"
              />
              <Button
                size="sm"
                onClick={handleQuickReply}
                disabled={!quickReplyText.trim()}
                className="h-8"
              >
                <Send className="h-3 w-3 mr-1" />
                {t('communications.reply')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitConversationThread;
