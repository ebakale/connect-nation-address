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

const formSchema = z.object({
  scope: z.enum(['BUILDING', 'UNIT'] as const),
  uac: z.string().min(1, 'UAC is required'),
  unit_uac: z.string().optional(),
  occupant: z.enum(['OWNER', 'TENANT', 'FAMILY', 'OTHER'] as const).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddSecondaryAddressFormProps {
  onSuccess?: () => void;
}

export function AddSecondaryAddressForm({ onSuccess }: AddSecondaryAddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addSecondaryAddress } = useCitizenAddresses();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scope: 'BUILDING',
      occupant: 'OTHER',
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
        occupant: data.occupant,
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
              <FormLabel>Address Scope</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select address scope" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BUILDING">Entire Building</SelectItem>
                  <SelectItem value="UNIT">Specific Unit</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose whether this secondary address covers the entire building or a specific unit.
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
              <FormLabel>UAC (Unified Address Code)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., GQ-BN-MAL-ABC123-XY" 
                  {...field} 
                  className="font-mono"
                />
              </FormControl>
              <FormDescription>
                Enter the official UAC for this secondary address.
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
                <FormLabel>Unit UAC</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., GQ-BN-MAL-ABC123-U01-XY" 
                    {...field} 
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  Enter the UAC for the specific unit within the building.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="occupant"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupant Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupant type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="TENANT">Tenant</SelectItem>
                  <SelectItem value="FAMILY">Family Member</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Specify your relationship to this secondary address.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Secondary Address
        </Button>
      </form>
    </Form>
  );
}