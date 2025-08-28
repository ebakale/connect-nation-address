import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, FileX } from "lucide-react";

interface AddressRejectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string, notes: string) => void;
  itemType: 'request' | 'flagged_address' | 'flagged_request';
  item: any;
}

const REJECTION_REASONS = {
  request: [
    "Incomplete or inaccurate address information",
    "Invalid coordinates - location not accessible",
    "Insufficient verification documentation",
    "Property ownership documentation required",
    "Address already exists in system",
    "Location violates zoning regulations",
    "Duplicate request detected",
    "Other (specify in notes)"
  ],
  flagged_address: [
    "Failed verification analysis",
    "Coordinates do not match address",
    "Property ownership cannot be verified",
    "Address information is outdated",
    "Location inaccessible or does not exist",
    "Violates address standards",
    "Security or safety concerns",
    "Other (specify in notes)"
  ],
  flagged_request: [
    "Coordinates still inaccurate after flagging",
    "Address information remains inconsistent",
    "Location verification failed",
    "Insufficient corrections made",
    "Safety or accessibility concerns remain",
    "Documentation still inadequate",
    "Does not meet address standards",
    "Other (specify in notes)"
  ]
};

export const AddressRejectionDialog = ({
  isOpen,
  onClose,
  onReject,
  itemType,
  item
}: AddressRejectionDialogProps) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReject = async () => {
    if (!selectedReason) return;
    
    setIsSubmitting(true);
    try {
      await onReject(selectedReason, rejectionNotes);
      onClose();
      setSelectedReason("");
      setRejectionNotes("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons = REJECTION_REASONS[itemType] || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <FileX className="h-5 w-5" />
            Reject {itemType === 'request' ? 'Address Request' : itemType === 'flagged_request' ? 'Flagged Request' : 'Flagged Address'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Summary */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium text-sm">
              {item?.building && `${item.building}, `}
              {item?.street}, {item?.city}, {item?.region}
            </p>
            {item?.uac && (
              <p className="text-xs text-muted-foreground mt-1">UAC: {item.uac}</p>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">Important:</p>
              <p className="text-yellow-700">
                {itemType === 'request' 
                  ? "This request will be sent back to the user with your feedback for corrections and resubmission."
                  : itemType === 'flagged_request'
                  ? "This flagged request will be rejected. The user will need to submit a new corrected request."
                  : "This address will be marked as rejected with your feedback. The user can address the issues and request re-verification."
                }
              </p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason *</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a rejection reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="rejection-notes">
              Additional Notes & Feedback 
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="rejection-notes"
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Provide specific guidance on what needs to be corrected for resubmission..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {rejectionNotes.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={!selectedReason || isSubmitting}
          >
            {isSubmitting ? "Rejecting..." : "Reject & Send Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};