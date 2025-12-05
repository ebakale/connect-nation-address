import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, RefreshCw, AlertTriangle, MapPin, FileText, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface RejectedItem {
  id: string;
  item_type: 'request' | 'address';
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  rejection_reason?: string;
  reviewer_notes?: string;
  rejected_at: string;
  created_at: string;
}

export const RejectedItemsManager = () => {
  const { t } = useTranslation('address');
  const [rejectedItems, setRejectedItems] = useState<RejectedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: RejectedItem | null }>({ open: false, item: null });
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRejectedItems = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch rejected address requests for the current user
      const { data: requests, error: requestsError } = await supabase
        .from('address_requests')
        .select('id, country, region, city, street, building, address_type, rejection_reason, rejection_notes, rejected_at, created_at')
        .eq('requester_id', user.id)
        .eq('status', 'rejected')
        .order('rejected_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Map to unified format
      const items: RejectedItem[] = (requests || []).map(req => ({
        id: req.id,
        item_type: 'request' as const,
        country: req.country,
        region: req.region,
        city: req.city,
        street: req.street,
        building: req.building,
        address_type: req.address_type,
        rejection_reason: req.rejection_reason,
        reviewer_notes: req.rejection_notes,
        rejected_at: req.rejected_at,
        created_at: req.created_at,
      }));

      setRejectedItems(items);
    } catch (error) {
      console.error('Failed to fetch rejected items:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadRejectedAddresses'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRejectedItems();
  }, [user]);

  const formatAddress = (item: RejectedItem) => {
    const parts = [item.building, item.street, item.city, item.region, item.country].filter(Boolean);
    return parts.join(', ');
  };

  const handleDelete = async () => {
    if (!deleteDialog.item) return;
    
    setDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_rejected_request', {
        p_request_id: deleteDialog.item.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string };
      if (!result.success) {
        throw new Error(result.error || t('deleteFailed'));
      }

      setRejectedItems(prev => prev.filter(i => i.id !== deleteDialog.item?.id));
      toast({
        title: t('success'),
        description: t('deleteSuccess'),
      });
      setDeleteDialog({ open: false, item: null });
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('deleteFailed'),
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <CardTitle>{t('loadingRejectedAddresses')}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {t('rejectedRequests')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{t('retentionPolicy')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button
              onClick={fetchRejectedItems}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {rejectedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('noRejectedAddresses')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rejectedItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {item.item_type === 'request' ? (
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm break-words">{formatAddress(item)}</span>
                      <Badge variant="destructive" className="flex-shrink-0">
                        {item.item_type === 'request' ? t('requestLabel') : t('addressLabel')}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{t('rejectedOn', { date: format(new Date(item.rejected_at), 'MMM dd, yyyy HH:mm') })}</p>
                      <p>{t('addressTypeLabel')}: {t(`addressType.${item.address_type.toLowerCase()}`, item.address_type)}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setDeleteDialog({ open: true, item })}
                    variant="destructive"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('deleteRejectedRequest')}
                  </Button>
                </div>

                {(item.rejection_reason || item.reviewer_notes) && (
                  <div className="pt-3 border-t">
                    <span className="text-sm font-medium">{t('rejectionReason')}</span>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.rejection_reason || item.reviewer_notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmationTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? t('deleting') : t('deleteRejectedRequest')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};