import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Building, Calendar, CheckCircle, X, Zap, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddressRejectionDialog } from "./AddressRejectionDialog";
import { AddressMapDialog } from "./AddressMapDialog";

interface AddressRequest {
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
  justification: string;
  created_at: string;
}

interface AddressRequestApprovalProps {
  requests: AddressRequest[];
  onUpdate: () => void;
}

export function AddressRequestApproval({ requests, onUpdate }: AddressRequestApprovalProps) {
  const [processing, setProcessing] = useState<string | null>(null);
  const [autoVerifying, setAutoVerifying] = useState<string | null>(null);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AddressRequest | null>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = useState<AddressRequest | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('approve_address_request', {
        p_request_id: requestId
      });

      if (error) throw error;

      toast.success("Address request approved and address created successfully");
      onUpdate();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error("Failed to approve address request");
    } finally {
      setProcessing(null);
    }
  };

  const handleViewOnMap = (request: AddressRequest) => {
    setSelectedMapAddress(request);
    setMapDialogOpen(true);
  };

  const handleReject = (request: AddressRequest) => {
    setSelectedRequestId(request.id);
    setSelectedRequest(request);
    setRejectionDialogOpen(true);
  };

  const handleRejectWithFeedback = async (reason: string, notes?: string) => {
    if (!selectedRequestId) return;

    try {
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: selectedRequestId,
        p_rejection_reason: reason,
        p_rejection_notes: notes
      });

      if (error) throw error;

      toast.success("Address request rejected with feedback");
      onUpdate();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error("Failed to reject address request");
    } finally {
      setRejectionDialogOpen(false);
      setSelectedRequestId(null);
    }
  };

  const handleAutoVerify = async (requestId: string) => {
    setAutoVerifying(requestId);
    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-address', {
        body: { requestId, mode: 'single' }
      });

      if (error) throw error;

      toast.success(`Auto-verification: ${data.decision.action} (Score: ${data.analysis.overallScore}%)`);
      onUpdate();
    } catch (error) {
      console.error('Auto-verification failed:', error);
      toast.error("Auto-verification failed");
    } finally {
      setAutoVerifying(null);
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No pending requests</h3>
        <p className="text-muted-foreground">All address requests have been processed.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-yellow-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Address Request</CardTitle>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  Pending Approval
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
                    {request.building && `${request.building}, `}
                    {request.street}, {request.city}, {request.region}, {request.country}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    {request.latitude}, {request.longitude}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Type</span>
                  </div>
                  <p className="text-sm pl-6 capitalize">{request.address_type}</p>
                </div>
              </div>

              {request.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Description</span>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <span className="text-sm font-medium">Justification</span>
                <p className="text-sm text-muted-foreground">{request.justification}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Submitted {new Date(request.created_at).toLocaleDateString()}</span>
                <User className="h-3 w-3 ml-4" />
                <span>User ID: {request.user_id.slice(0, 8)}...</span>
              </div>

              {request.photo_url && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Photo</span>
                  <img 
                    src={request.photo_url} 
                    alt="Address verification photo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="flex-1"
                >
                  {processing === request.id ? "Approving..." : "Approve"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(request)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleViewOnMap(request)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View on Map
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAutoVerify(request.id)}
                  disabled={processing === request.id || autoVerifying === request.id}
                  className="flex items-center gap-2"
                >
                  {autoVerifying === request.id ? (
                    <>
                      <Zap className="h-4 w-4 animate-pulse" />
                      Auto-Verifying...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Auto-Verify
                    </>
                  )}
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
        itemType="request"
        item={selectedRequest}
      />

      {selectedMapAddress && (
        <AddressMapDialog
          isOpen={mapDialogOpen}
          onClose={() => setMapDialogOpen(false)}
          address={selectedMapAddress}
        />
      )}
    </>
  );
}