import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Flag, Clock, Eye, Trash2 } from 'lucide-react';
import { format } from "date-fns";
import { useAddressReviewQueue } from '@/hooks/useCAR';
import type { CitizenAddress, AddressStatus } from '@/types/car';

interface BulkActionsPanelProps {
  selectedAddresses: CitizenAddress[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export function BulkActionsPanel({ selectedAddresses, onClearSelection, onRefresh }: BulkActionsPanelProps) {
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'flag' | ''>('');
  const [bulkReason, setBulkReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateAddressStatus } = useAddressReviewQueue();

  const handleBulkAction = async () => {
    if (!bulkAction || selectedAddresses.length === 0) return;
    
    try {
      setIsProcessing(true);
      
      const statusMap: Record<string, AddressStatus> = {
        'approve': 'CONFIRMED',
        'reject': 'REJECTED',
        'flag': 'SELF_DECLARED' // Keep as pending but flag
      };

      const promises = selectedAddresses.map(address => 
        updateAddressStatus(address.id, statusMap[bulkAction])
      );
      
      await Promise.all(promises);
      
      onClearSelection();
      onRefresh();
      setBulkAction('');
      setBulkReason('');
    } catch (error) {
      // Error handling is done in individual hooks
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedAddresses.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Bulk Actions</CardTitle>
            <CardDescription>
              {selectedAddresses.length} address{selectedAddresses.length !== 1 ? 'es' : ''} selected
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedAddresses.slice(0, 5).map((address) => (
            <Badge key={address.id} variant="outline" className="font-mono text-xs">
              {address.uac}
            </Badge>
          ))}
          {selectedAddresses.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{selectedAddresses.length - 5} more
            </Badge>
          )}
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Action</label>
            <Select value={bulkAction} onValueChange={(value: 'approve' | 'reject' | 'flag' | '') => setBulkAction(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bulk action..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Approve All
                  </div>
                </SelectItem>
                <SelectItem value="reject">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    Reject All
                  </div>
                </SelectItem>
                <SelectItem value="flag">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-orange-600" />
                    Flag All for Review
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(bulkAction === 'reject' || bulkAction === 'flag') && (
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Reason</label>
              <Textarea
                placeholder={`Enter ${bulkAction} reason...`}
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                className="min-h-[40px]"
              />
            </div>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={!bulkAction || isProcessing || ((bulkAction === 'reject' || bulkAction === 'flag') && !bulkReason.trim())}
              >
                {isProcessing ? 'Processing...' : `${bulkAction ? bulkAction.charAt(0).toUpperCase() + bulkAction.slice(1) : 'Execute'} ${selectedAddresses.length} Request${selectedAddresses.length !== 1 ? 's' : ''}`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to {bulkAction} {selectedAddresses.length} address request{selectedAddresses.length !== 1 ? 's' : ''}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkAction} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}