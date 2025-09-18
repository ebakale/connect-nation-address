import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import type { AddressScope, OccupantType } from '@/types/car';

const formSchema = z.object({
  scope: z.enum(['BUILDING', 'UNIT'] as const),
  uac: z.string().min(1, 'UAC is required'),
  unit_uac: z.string().optional(),
  effective_from: z.date().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SetPrimaryAddressFormProps {
  onSuccess?: () => void;
}

export function SetPrimaryAddressForm({ onSuccess }: SetPrimaryAddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setPrimaryAddress } = useCitizenAddresses();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scope: 'BUILDING',
      effective_from: new Date(),
    },
  });

  const scope = form.watch('scope');

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      await setPrimaryAddress({
        scope: data.scope,
        uac: data.uac,
        unit_uac: data.scope === 'UNIT' ? data.unit_uac : undefined,
        effective_from: data.effective_from?.toISOString().split('T')[0],
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
                Choose whether you're registering for the entire building or a specific unit within it.
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
                Enter the official UAC for this address. This should be provided by the National Address Registry.
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
          name="effective_from"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Effective From</FormLabel>
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
                        <span>Pick a date</span>
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
                Date when this address becomes your primary residence.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Set as Primary Address
        </Button>
      </form>
    </Form>
  );
}