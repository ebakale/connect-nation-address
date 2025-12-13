import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePostalAgents, PostalAgent } from '@/hooks/usePostalAgents';
import { User, Package, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeliveryAgentSelectorProps {
  selectedAgentId: string | null;
  onSelectAgent: (agent: PostalAgent) => void;
}

export const DeliveryAgentSelector = ({ 
  selectedAgentId, 
  onSelectAgent 
}: DeliveryAgentSelectorProps) => {
  const { t } = useTranslation('postal');
  const { agents, loading } = usePostalAgents();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('agent.noAgents', 'No delivery agents available')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {agents.map((agent) => {
        const isSelected = selectedAgentId === agent.id;
        const workloadLevel = agent.activeAssignments === 0 
          ? 'low' 
          : agent.activeAssignments <= 5 
            ? 'medium' 
            : 'high';

        return (
          <Card
            key={agent.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary border-primary'
            )}
            onClick={() => onSelectAgent(agent)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{agent.full_name}</p>
                    {agent.phone && (
                      <p className="text-sm text-muted-foreground truncate">{agent.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Badge 
                    variant={
                      workloadLevel === 'low' 
                        ? 'success' 
                        : workloadLevel === 'medium' 
                          ? 'warning' 
                          : 'destructive'
                    }
                    className="text-xs"
                  >
                    {agent.activeAssignments}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
