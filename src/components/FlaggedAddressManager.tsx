import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Building, Calendar, Flag, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressRejectionDialog } from "./AddressRejectionDialog";

interface FlaggedAddress {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  street: string;
  city: string;
  region: string;
  country: string;
  building?: string;
  address_type: string;
  description?: string;
  photo_url?: string;
  uac: string;
  flag_reason?: string;
  flagged_at?: string;
}

interface FlaggedAddressManagerProps {
  addresses: FlaggedAddress[];
  onUpdate: () => void;
}

export function FlaggedAddressManager({ addresses, onUpdate }: FlaggedAddressManagerProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<FlaggedAddress | null>(null);

  const handleUnflag = async (addressId: string) => {
    setProcessing(addressId);
    try {
      const { error } = await supabase.rpc('unflag_address', {
        p_address_id: addressId
      });

      if (error) throw error;

      toast.success("Address unflagged successfully");
      onUpdate();
    } catch (error) {
      console.error('Error unflagging address:', error);
      toast.error("Failed to unflag address");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = (address: FlaggedAddress) => {
    setSelectedAddressId(address.id);
    setSelectedAddress(address);
    setRejectionDialogOpen(true);
  };

  const handleRejectWithFeedback = async (reason: string, notes?: string) => {
    if (!selectedAddressId) return;

    try {
      const { error } = await supabase.rpc('reject_flagged_address_with_feedback', {
        p_address_id: selectedAddressId,
        p_rejection_reason: reason,
        p_rejection_notes: notes
      });

      if (error) throw error;

      toast.success("Flagged address rejected with feedback");
      onUpdate();
    } catch (error) {
      console.error('Error rejecting flagged address:', error);
      toast.error("Failed to reject flagged address");
    } finally {
      setRejectionDialogOpen(false);
      setSelectedAddressId(null);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No flagged addresses</h3>
        <p className="text-muted-foreground">All addresses are in good standing.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id} className="border-l-4 border-l-red-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Flagged Address</CardTitle>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <Flag className="h-3 w-3 mr-1" />
                  Flagged
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-sm pl-6">
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}, {address.country}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    UAC: {address.uac}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  <p className="text-sm pl-6 capitalize">{address.address_type}</p>
                </div>
              </div>

              {address.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Description</span>
                  <p className="text-sm text-muted-foreground">{address.description}</p>
                </div>
              )}

              {address.flag_reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Flag Reason</span>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{address.flag_reason}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Flagged {address.flagged_at ? new Date(address.flagged_at).toLocaleDateString() : 'Unknown'}</span>
                <User className="h-3 w-3 ml-4" />
                <span>User ID: {address.user_id.slice(0, 8)}...</span>
              </div>

              {address.photo_url && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Photo</span>
                  <img 
                    src={address.photo_url} 
                    alt="Address verification photo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleUnflag(address.id)}
                  disabled={processing === address.id}
                  className="flex-1"
                >
                  {processing === address.id ? "Unflagging..." : "Approve & Unflag"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(address)}
                  disabled={processing === address.id}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddressRejectionDialog
        isOpen={rejectionDialogOpen}
        onClose={() => setRejectionDialogOpen(false)}
        onReject={handleRejectWithFeedback}
        itemType="flagged_address"
        item={selectedAddress}
      />
    </>
  );
}