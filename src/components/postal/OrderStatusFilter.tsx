import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { DeliveryStats, DeliveryStatus } from '@/types/postal';

interface OrderStatusFilterProps {
  activeFilter: DeliveryStatus | 'all';
  onFilterChange: (status: DeliveryStatus | 'all') => void;
  stats: DeliveryStats | null;
}

const statusOptions: { value: DeliveryStatus | 'all'; labelKey: string; countKey?: keyof DeliveryStats }[] = [
  { value: 'all', labelKey: 'filters.all' },
  { value: 'pending_intake', labelKey: 'status.pending_intake', countKey: 'pending_intake' },
  { value: 'ready_for_assignment', labelKey: 'status.ready_for_assignment', countKey: 'ready_for_assignment' },
  { value: 'assigned', labelKey: 'status.assigned', countKey: 'assigned' },
  { value: 'out_for_delivery', labelKey: 'status.out_for_delivery', countKey: 'out_for_delivery' },
  { value: 'delivered', labelKey: 'status.delivered', countKey: 'delivered' },
  { value: 'failed_delivery', labelKey: 'status.failed_delivery', countKey: 'failed' },
  { value: 'address_not_found', labelKey: 'status.address_not_found' },
  { value: 'returned_to_sender', labelKey: 'status.returned_to_sender', countKey: 'returned' },
];

export function OrderStatusFilter({ activeFilter, onFilterChange, stats }: OrderStatusFilterProps) {
  const { t } = useTranslation('postal');

  const getCount = (countKey?: keyof DeliveryStats): number | undefined => {
    if (!stats || !countKey) return undefined;
    return stats[countKey] as number;
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">{t('filters.filterByStatus')}</p>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {statusOptions.map((option) => {
            const count = getCount(option.countKey);
            const isActive = activeFilter === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(option.value)}
                className="flex-shrink-0"
              >
                {t(option.labelKey)}
                {count !== undefined && (
                  <Badge 
                    variant={isActive ? 'secondary' : 'outline'} 
                    className="ml-2"
                  >
                    {count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
