import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const getSelectedLabel = () => {
    const selected = statusOptions.find(opt => opt.value === activeFilter);
    if (!selected) return t('filters.selectStatus');
    const count = getCount(selected.countKey);
    return count !== undefined ? `${t(selected.labelKey)} (${count})` : t(selected.labelKey);
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">{t('filters.filterByStatus')}</p>
      <Select 
        value={activeFilter} 
        onValueChange={(value) => onFilterChange(value as DeliveryStatus | 'all')}
      >
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue>{getSelectedLabel()}</SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-background z-50">
          {statusOptions.map((option) => {
            const count = getCount(option.countKey);
            return (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {t(option.labelKey)}
                  {count !== undefined && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {count}
                    </Badge>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
