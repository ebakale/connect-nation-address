import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { BulkImportJob, BulkImportOrder, ImportStatus, BulkImportRowData } from '@/types/postalEnhanced';
import type { PackageType } from '@/types/postal';

const VALID_PACKAGE_TYPES: PackageType[] = [
  'letter', 'small_parcel', 'medium_parcel', 'large_parcel',
  'document', 'registered_mail', 'express', 'government_document'
];

export const useBulkImport = () => {
  const { t } = useTranslation('postal');
  const { user } = useAuth();
  const [jobs, setJobs] = useState<BulkImportJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('bulk_import_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as ImportStatus,
        error_summary: (item.error_summary || []) as BulkImportJob['error_summary']
      }));
      
      setJobs(typedData);
    } catch (error) {
      console.error('Error fetching import jobs:', error);
      toast.error(t('messages.errorLoading'));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  const getJobOrders = async (jobId: string): Promise<BulkImportOrder[]> => {
    try {
      const { data, error } = await supabase
        .from('bulk_import_orders')
        .select('*')
        .eq('import_job_id', jobId)
        .order('row_number', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        raw_data: item.raw_data as BulkImportOrder['raw_data']
      }));
    } catch (error) {
      console.error('Error fetching import orders:', error);
      return [];
    }
  };

  const validateRow = (row: BulkImportRowData): { valid: boolean; error?: string } => {
    if (!row.sender_name?.trim()) {
      return { valid: false, error: t('validation.senderNameRequired') };
    }
    if (!row.recipient_name?.trim()) {
      return { valid: false, error: t('validation.recipientNameRequired') };
    }
    if (!row.recipient_address_uac?.trim()) {
      return { valid: false, error: t('validation.recipientAddressRequired') };
    }
    if (!row.package_type || !VALID_PACKAGE_TYPES.includes(row.package_type as PackageType)) {
      return { valid: false, error: t('bulkImport.invalidPackageType') };
    }
    if (row.priority_level) {
      const priority = parseInt(row.priority_level);
      if (isNaN(priority) || priority < 1 || priority > 5) {
        return { valid: false, error: t('bulkImport.invalidPriority') };
      }
    }
    if (row.cod_amount) {
      const amount = parseFloat(row.cod_amount);
      if (isNaN(amount) || amount < 0) {
        return { valid: false, error: t('bulkImport.invalidCODAmount') };
      }
    }
    return { valid: true };
  };

  const processImport = async (
    fileName: string,
    rows: BulkImportRowData[]
  ): Promise<BulkImportJob | null> => {
    if (!user) return null;

    try {
      // Create import job
      const jobInsertData = {
        uploaded_by: user.id,
        file_name: fileName,
        total_rows: rows.length,
        status: 'processing',
        started_at: new Date().toISOString(),
      };

      const { data: job, error: jobError } = await supabase
        .from('bulk_import_jobs')
        .insert(jobInsertData as never)
        .select()
        .single();

      if (jobError) throw jobError;

      // Process each row
      let successCount = 0;
      let errorCount = 0;
      const errorSummary: Array<{ row: number; error: string }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const validation = validateRow(row);

        if (!validation.valid) {
          errorCount++;
          errorSummary.push({ row: i + 1, error: validation.error || 'Unknown error' });
          
          await supabase.from('bulk_import_orders').insert({
            import_job_id: job.id,
            row_number: i + 1,
            raw_data: row,
            status: 'error',
            error_message: validation.error,
          } as never);
          continue;
        }

        // Validate UAC exists
        const { data: addressData } = await supabase
          .from('addresses')
          .select('uac')
          .eq('uac', row.recipient_address_uac)
          .maybeSingle();

        if (!addressData) {
          errorCount++;
          errorSummary.push({ row: i + 1, error: t('validation.invalidUAC') });
          
          await supabase.from('bulk_import_orders').insert({
            import_job_id: job.id,
            row_number: i + 1,
            raw_data: row,
            status: 'error',
            error_message: t('validation.invalidUAC'),
          } as never);
          continue;
        }

        // Create delivery order
        const codAmount = row.cod_amount ? parseFloat(row.cod_amount) : null;
        
        const { data: order, error: orderError } = await supabase
          .from('delivery_orders')
          .insert({
            sender_name: row.sender_name,
            sender_phone: row.sender_phone || null,
            recipient_name: row.recipient_name,
            recipient_address_uac: row.recipient_address_uac,
            recipient_phone: row.recipient_phone || null,
            recipient_email: row.recipient_email || null,
            package_type: row.package_type as PackageType,
            weight_grams: row.weight_grams ? parseInt(row.weight_grams) : null,
            declared_value: row.declared_value ? parseFloat(row.declared_value) : null,
            priority_level: row.priority_level ? parseInt(row.priority_level) : 3,
            notes: row.notes || null,
            cod_required: codAmount !== null && codAmount > 0,
            cod_amount: codAmount,
            created_by: user.id,
          } as never)
          .select()
          .single();

        if (orderError) {
          errorCount++;
          errorSummary.push({ row: i + 1, error: orderError.message });
          
          await supabase.from('bulk_import_orders').insert({
            import_job_id: job.id,
            row_number: i + 1,
            raw_data: row,
            status: 'error',
            error_message: orderError.message,
          } as never);
        } else {
          successCount++;
          
          await supabase.from('bulk_import_orders').insert({
            import_job_id: job.id,
            row_number: i + 1,
            raw_data: row,
            order_id: order.id,
            status: 'success',
            processed_at: new Date().toISOString(),
          } as never);
        }

        // Update job progress
        await supabase
          .from('bulk_import_jobs')
          .update({
            processed_rows: i + 1,
            success_count: successCount,
            error_count: errorCount,
          })
          .eq('id', job.id);
      }

      // Finalize job
      const finalStatus: ImportStatus = errorCount === 0 
        ? 'completed' 
        : successCount === 0 
          ? 'failed' 
          : 'partial';

      const { data: finalJob, error: finalError } = await supabase
        .from('bulk_import_jobs')
        .update({
          status: finalStatus,
          success_count: successCount,
          error_count: errorCount,
          error_summary: errorSummary,
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)
        .select()
        .single();

      if (finalError) throw finalError;

      toast.success(t('bulkImport.importComplete', { 
        success: successCount, 
        total: rows.length 
      }));
      
      await fetchJobs();
      
      return {
        ...finalJob,
        status: finalJob.status as ImportStatus,
        error_summary: (finalJob.error_summary || []) as BulkImportJob['error_summary']
      };
    } catch (error) {
      console.error('Error processing import:', error);
      toast.error(t('bulkImport.importError'));
      return null;
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'sender_name',
      'sender_phone',
      'recipient_name',
      'recipient_address_uac',
      'recipient_phone',
      'recipient_email',
      'package_type',
      'weight_grams',
      'declared_value',
      'priority_level',
      'notes',
      'cod_amount'
    ];

    const sampleRow = [
      'Juan García',
      '+240222123456',
      'María López',
      'GQ-BN-MAL-001A00-XY',
      '+240222654321',
      'maria@example.com',
      'letter',
      '250',
      '10000',
      '3',
      'Handle with care',
      ''
    ];

    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'postal_import_template.csv';
    link.click();
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, fetchJobs]);

  return {
    jobs,
    loading,
    fetchJobs,
    getJobOrders,
    processImport,
    downloadTemplate,
    validateRow,
  };
};
