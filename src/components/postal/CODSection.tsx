import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

interface CODSectionProps {
  codRequired: boolean;
  codAmount: number | null;
  currency?: string;
  onCodRequiredChange: (required: boolean) => void;
  onCodAmountChange: (amount: number | null) => void;
  onCurrencyChange?: (currency: string) => void;
  disabled?: boolean;
}

const currencies = ['XAF', 'EUR', 'USD'];

export const CODSection = ({
  codRequired,
  codAmount,
  currency = 'XAF',
  onCodRequiredChange,
  onCodAmountChange,
  onCurrencyChange,
  disabled = false,
}: CODSectionProps) => {
  const { t } = useTranslation('postal');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <Label>{t('cod.enableCOD')}</Label>
        </div>
        <Switch
          checked={codRequired}
          onCheckedChange={onCodRequiredChange}
          disabled={disabled}
        />
      </div>

      {codRequired && (
        <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
          <div className="space-y-2">
            <Label>{t('cod.amount')} *</Label>
            <Input
              type="number"
              min={0}
              step={100}
              value={codAmount || ''}
              onChange={(e) => onCodAmountChange(e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="0.00"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('cod.currency')}</Label>
            <Select
              value={currency}
              onValueChange={onCurrencyChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>
                    {curr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
