import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Calendar, User, CheckCircle, XCircle, Flag, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
import { format } from "date-fns";
import type { CitizenAddress, AddressStatus } from '@/types/car';

interface AddressRequestReviewCardProps {
  address: CitizenAddress;
  onStatusUpdate: (addressId: string, status: AddressStatus) => Promise<void>;
  onRefresh: () => void;
  showFlaggedInfo?: boolean;
  showHistory?: boolean;
}

export function AddressRequestReviewCard({ 
  address, 
  onStatusUpdate, 
  onRefresh,
  showFlaggedInfo = false,
  showHistory = false
}: AddressRequestReviewCardProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleApprove = async () => {
    try {
      setIsProcessing(true);
      await onStatusUpdate(address.id, 'CONFIRMED');
      onRefresh();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await onStatusUpdate(address.id, 'REJECTED');
      setRejectionReason('');
      onRefresh();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SELF_DECLARED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getKindColor = (kind: string) => {
    return kind === 'PRIMARY' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  const isPending = address.status === 'SELF_DECLARED';

  return (
    <Card className={`${address.flagged ? 'border-orange-200 bg-orange-50/50' : ''} ${isPending ? 'border-blue-200 bg-blue-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-mono">{address.uac}</CardTitle>
              {address.unit_uac && (
                <CardDescription className="font-mono text-sm">
                  Unit: {address.unit_uac}
                </CardDescription>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {address.flagged && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                <Flag className="h-3 w-3 mr-1" />
                Flagged
              </Badge>
            )}
            <Badge className={getKindColor(address.address_kind)}>
              {address.address_kind}
            </Badge>
            <Badge className={getStatusColor(address.status)}>
              {address.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Address Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Scope & Occupant</p>
              <p className="text-muted-foreground">
                {address.scope} - {address.occupant}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Submitted</p>
              <p className="text-muted-foreground">
                {format(new Date(address.created_at), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Source</p>
              <p className="text-muted-foreground">{address.source}</p>
            </div>
          </div>
        </div>

        {/* Flagged Information */}
        {showFlaggedInfo && address.flagged && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <p className="font-medium text-orange-800">Flagged for Review</p>
            </div>
            <p className="text-sm text-orange-700">
              <strong>Reason:</strong> {address.flag_reason || 'No reason provided'}
            </p>
            {address.flagged_at && (
              <p className="text-sm text-orange-600 mt-1">
                Flagged on {format(new Date(address.flagged_at), 'MMM d, yyyy HH:mm')}
              </p>
            )}
          </div>
        )}

        {/* Notes */}
        {address.notes && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm">
              <strong>Notes:</strong> {address.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Address Request Details - Pending Approval</DialogTitle>
                  <DialogDescription>
                    Request details for UAC {address.uac} - requires approval before becoming a verified address
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium">UAC</label>
                      <p className="font-mono text-sm">{address.uac}</p>
                    </div>
                    {address.unit_uac && (
                      <div>
                        <label className="font-medium">Unit UAC</label>
                        <p className="font-mono text-sm">{address.unit_uac}</p>
                      </div>
                    )}
                    <div>
                      <label className="font-medium">Address Kind</label>
                      <p className="text-sm">{address.address_kind}</p>
                    </div>
                    <div>
                      <label className="font-medium">Scope</label>
                      <p className="text-sm">{address.scope}</p>
                    </div>
                    <div>
                      <label className="font-medium">Occupant Type</label>
                      <p className="text-sm">{address.occupant}</p>
                    </div>
                    <div>
                      <label className="font-medium">Status</label>
                      <Badge className={getStatusColor(address.status)}>
                        {address.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-medium">Effective Period</label>
                    <p className="text-sm">
                      From: {format(new Date(address.effective_from), 'MMM d, yyyy')}
                      {address.effective_to && ` - To: ${format(new Date(address.effective_to), 'MMM d, yyyy')}`}
                    </p>
                  </div>

                  {address.notes && (
                    <div>
                      <label className="font-medium">Notes</label>
                      <p className="text-sm">{address.notes}</p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isPending && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Address Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reject the address request. Please provide a reason for rejection.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || isProcessing}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isProcessing ? 'Rejecting...' : 'Reject Request'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" disabled={isProcessing}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Address Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will approve the request and create a verified address in the system. The address will then be available for publication.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleApprove} disabled={isProcessing}>
                      {isProcessing ? 'Approving...' : 'Approve Request'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}