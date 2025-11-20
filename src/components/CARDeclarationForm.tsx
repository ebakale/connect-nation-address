import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCitizenAddresses } from '@/hooks/useCAR';
import type { AddressScope } from '@/types/car';

const formSchema = z.object({
  addressKind: z.enum(['PRIMARY', 'SECONDARY']),
  scope: z.enum(['BUILDING', 'UNIT'] as const),
  uac: z.string().min(1, 'UAC is required'),
  unit_uac: z.string().optional(),
  effective_from: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CARDeclarationFormProps {
  prefilledUAC?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CARDeclarationForm({ prefilledUAC, onSuccess, onCancel }: CARDeclarationFormProps) {
  const { t } = useTranslation(['address', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPrimaryAddress, addSecondaryAddress } = useCitizenAddresses();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addressKind: 'PRIMARY',
      scope: 'BUILDING',
      uac: prefilledUAC || '',
      effective_from: new Date(),
    },
  });

  const scope = form.watch('scope');
  const addressKind = form.watch('addressKind');

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      if (data.addressKind === 'PRIMARY') {
        await setPrimaryAddress({
          scope: data.scope,
          uac: data.uac,
          unit_uac: data.scope === 'UNIT' ? data.unit_uac : undefined,
          effective_from: data.effective_from?.toISOString().split('T')[0],
        });
      } else {
        await addSecondaryAddress({
          scope: data.scope,
          uac: data.uac,
          unit_uac: data.scope === 'UNIT' ? data.unit_uac : undefined,
        });
      }

      form.reset();
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Address Kind Selection */}
        <FormField
          control={form.control}
          name="addressKind"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address:addressKind')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PRIMARY">{t('address:primaryAddress')}</SelectItem>
                  <SelectItem value="SECONDARY">{t('address:secondaryAddress')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {addressKind === 'PRIMARY' 
                  ? t('address:primaryAddressDescription')
                  : t('address:secondaryAddressDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Scope Selection */}
        <FormField
          control={form.control}
          name="scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address:scope')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('address:selectScope')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BUILDING">{t('address:entireBuilding')}</SelectItem>
                  <SelectItem value="UNIT">{t('address:specificUnit')}</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('address:scopeDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* UAC Input */}
        <FormField
          control={form.control}
          name="uac"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address:uacCode')}</FormLabel>
              <FormControl>
                <Input 
                  placeholder={t('address:uacPlaceholder')} 
                  {...field} 
                  className="font-mono"
                  disabled={!!prefilledUAC}
                />
              </FormControl>
              <FormDescription>
                {prefilledUAC 
                  ? t('address:uacPrefilledDescription')
                  : t('address:uacDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Unit UAC (conditional) */}
        {scope === 'UNIT' && (
          <FormField
            control={form.control}
            name="unit_uac"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('address:unitUac')}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t('address:unitUacPlaceholder')} 
                    {...field} 
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  {t('address:unitUacDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Effective From Date (only for primary) */}
        {addressKind === 'PRIMARY' && (
          <FormField
            control={form.control}
            name="effective_from"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('address:effectiveFrom')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>{t('address:pickDate')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  {t('address:effectiveFromDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              {t('common:cancel')}
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {addressKind === 'PRIMARY' 
              ? t('address:setAsPrimary')
              : t('address:addSecondary')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
