/**
 * @deprecated Prefer using UnifiedAddressRequestFlow for new address declarations.
 * This component is kept for backward compatibility only.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useCitizenAddresses } from '@/hooks/useCAR';
import type { AddressScope, OccupantType } from '@/types/car';
import { useTranslation } from 'react-i18next';

const formSchema = z.object({
  scope: z.enum(['BUILDING', 'UNIT'] as const),
  uac: z.string().min(1, 'UAC is required'),
  unit_uac: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddSecondaryAddressFormProps {
  onSuccess?: () => void;
}

export function AddSecondaryAddressForm({ onSuccess }: AddSecondaryAddressFormProps) {
  const { t } = useTranslation(['address', 'common']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSecondaryAddress } = useCitizenAddresses();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scope: 'BUILDING',
    },
  });

  const scope = form.watch('scope');

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await addSecondaryAddress({
        scope: data.scope,
        uac: data.uac,
        unit_uac: data.scope === 'UNIT' ? data.unit_uac : undefined,
      });

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
                {t('address:secondaryScopeDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                />
              </FormControl>
              <FormDescription>
                {t('address:secondaryUacDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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


        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('address:addSecondary')}
        </Button>
      </form>
    </Form>
  );
}