import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DeliveryAgentSelector } from './DeliveryAgentSelector';
import { useAssignOrders } from '@/hooks/useAssignOrders';
import { PostalAgent } from '@/hooks/usePostalAgents';
import { UserCheck, Package, Send, X } from 'lucide-react';

interface OrderAssignmentPanelProps {
  selectedOrderIds: string[];
  onAssignmentComplete: () => void;
  onClearSelection: () => void;
}

export const OrderAssignmentPanel = ({
  selectedOrderIds,
  onAssignmentComplete,
  onClearSelection
}: OrderAssignmentPanelProps) => {
  const { t } = useTranslation('postal');
  const { assignOrders, assigning } = useAssignOrders();
  const [selectedAgent, setSelectedAgent] = useState<PostalAgent | null>(null);
  const [notes, setNotes] = useState('');

  const handleAssign = async () => {
    if (!selectedAgent || selectedOrderIds.length === 0) return;

    const result = await assignOrders({
      orderIds: selectedOrderIds,
      agentId: selectedAgent.id,
      notes: notes || undefined
    });

    if (result.success) {
      setSelectedAgent(null);
      setNotes('');
      onAssignmentComplete();
    }
  };

  const orderCount = selectedOrderIds.length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          {t('assignment.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Selected Orders Count */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {orderCount} {orderCount === 1 ? t('order.title') : t('order.orders')}
            </span>
          </div>
          {orderCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Agent Selection */}
        <div className="flex-1 overflow-hidden flex flex-col gap-2">
          <Label className="text-sm font-medium">
            {t('assignment.selectAgent')}
          </Label>
          <ScrollArea className="flex-1">
            <DeliveryAgentSelector
              selectedAgentId={selectedAgent?.id || null}
              onSelectAgent={setSelectedAgent}
            />
          </ScrollArea>
        </div>

        {/* Notes */}
        <div className="space-y-2 shrink-0">
          <Label htmlFor="assignment-notes" className="text-sm font-medium">
            {t('assignment.assignmentNotes')}
          </Label>
          <Textarea
            id="assignment-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('assignment.notesPlaceholder', 'Add notes for the agent...')}
            className="resize-none"
            rows={2}
          />
        </div>

        {/* Assign Button */}
        <Button
          onClick={handleAssign}
          disabled={!selectedAgent || orderCount === 0 || assigning}
          className="w-full shrink-0"
        >
          <Send className="h-4 w-4 mr-2" />
          {assigning 
            ? t('actions.creating', 'Assigning...') 
            : t('assignment.assign')
          }
        </Button>
      </CardContent>
    </Card>
  );
};
