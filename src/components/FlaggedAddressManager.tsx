import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Building, Calendar, Flag, CheckCircle, AlertTriangle, BarChart3, FileText } from "lucide-react";
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
  flag_reason?: string;
  flagged_at?: string;
  status: string;
  justification?: string;
  verification_analysis?: any;
  verification_recommendations?: string[];
  auto_verification_analysis?: any;
  reviewer_notes?: string;
  rejection_reason?: string;
  rejection_notes?: string;
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

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      const { error } = await supabase.rpc('approve_address_request', {
        p_request_id: requestId
      });

      if (error) throw error;

      toast.success("Flagged request approved successfully");
      onUpdate();
    } catch (error) {
      console.error('Error approving flagged request:', error);
      toast.error("Failed to approve flagged request");
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
      const { error } = await supabase.rpc('reject_address_request_with_feedback', {
        p_request_id: selectedAddressId,
        p_rejection_reason: reason,
        p_rejection_notes: notes
      });

      if (error) throw error;

      toast.success("Flagged request rejected with feedback");
      onUpdate();
    } catch (error) {
      console.error('Error rejecting flagged request:', error);
      toast.error("Failed to reject flagged request");
    } finally {
      setRejectionDialogOpen(false);
      setSelectedAddressId(null);
    }
  };

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No flagged requests</h3>
        <p className="text-muted-foreground">All address requests are clear for review.</p>
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
                <CardTitle className="text-lg">Flagged Address Request</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    <Flag className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                  <Badge variant="outline">{address.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Address Information */}
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
                    Coordinates: {address.latitude}, {address.longitude}
                  </p>
                  <p className="text-xs text-muted-foreground pl-6">
                    Request ID: {address.id.slice(0, 8)}...
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

              {/* Justification and Description */}
              {address.justification && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Justification</span>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">{address.justification}</p>
                </div>
              )}

              {address.description && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Description</span>
                  <p className="text-sm text-muted-foreground">{address.description}</p>
                </div>
              )}

              {/* Flag Information */}
              {address.flag_reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Flag Reason</span>
                  <p className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">{address.flag_reason}</p>
                </div>
              )}

              {/* Manual Verification Analysis */}
              {address.verification_analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Manual Verification Analysis</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3">
                    {address.verification_analysis.overallScore && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className="text-sm font-bold text-blue-700">
                            {address.verification_analysis.overallScore}%
                          </span>
                        </div>
                        <Progress value={address.verification_analysis.overallScore} className="h-2" />
                      </div>
                    )}
                    
                    {address.verification_analysis.accuracy && (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Accuracy:</span>
                          <p>{address.verification_analysis.accuracy.precision}</p>
                          <p>Score: {address.verification_analysis.accuracy.score}%</p>
                        </div>
                        {address.verification_analysis.consistency && (
                          <div>
                            <span className="font-medium">Consistency:</span>
                            <p>Score: {address.verification_analysis.consistency.score}%</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {address.verification_analysis.reasoning && (
                      <p className="text-xs text-blue-800">{address.verification_analysis.reasoning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-Verification Analysis */}
              {address.auto_verification_analysis && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Auto-Verification Analysis</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-4 space-y-3">
                    {address.auto_verification_analysis.overallScore && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Overall Score</span>
                          <span className="text-sm font-bold text-purple-700">
                            {address.auto_verification_analysis.overallScore}%
                          </span>
                        </div>
                        <Progress value={address.auto_verification_analysis.overallScore} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {address.auto_verification_analysis.coordinateValidity && (
                        <div>
                          <span className="font-medium">Coordinate Validity:</span>
                          <p>{address.auto_verification_analysis.coordinateValidity}%</p>
                        </div>
                      )}
                      {address.auto_verification_analysis.addressConsistency && (
                        <div>
                          <span className="font-medium">Address Consistency:</span>
                          <p>{address.auto_verification_analysis.addressConsistency}%</p>
                        </div>
                      )}
                      {address.auto_verification_analysis.completeness && (
                        <div>
                          <span className="font-medium">Completeness:</span>
                          <p>{address.auto_verification_analysis.completeness}%</p>
                        </div>
                      )}
                      {address.auto_verification_analysis.fraudRisk && (
                        <div>
                          <span className="font-medium">Fraud Risk:</span>
                          <p className="text-red-600">{address.auto_verification_analysis.fraudRisk}%</p>
                        </div>
                      )}
                    </div>
                    
                    {address.auto_verification_analysis.reasoning && (
                      <p className="text-xs text-purple-800">{address.auto_verification_analysis.reasoning}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Recommendations */}
              {address.verification_recommendations && address.verification_recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Verification Recommendations</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <ul className="text-sm space-y-1">
                      {address.verification_recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span className="text-yellow-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Auto-Verification Recommendations */}
              {address.auto_verification_analysis?.recommendations && address.auto_verification_analysis.recommendations.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Auto-Verification Recommendations</span>
                  <div className="bg-gray-50 border border-gray-200 rounded p-3">
                    <ul className="text-sm space-y-1">
                      {address.auto_verification_analysis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-gray-600 mt-1">•</span>
                          <span className="text-gray-800">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Reviewer Notes */}
              {address.reviewer_notes && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Reviewer Notes</span>
                  <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded border">{address.reviewer_notes}</p>
                </div>
              )}

              {/* Previous Rejection Information */}
              {address.rejection_reason && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Previous Rejection</span>
                  <div className="bg-red-50 border border-red-200 rounded p-3 space-y-2">
                    <p className="text-sm text-red-700"><strong>Reason:</strong> {address.rejection_reason}</p>
                    {address.rejection_notes && (
                      <p className="text-sm text-red-600"><strong>Notes:</strong> {address.rejection_notes}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Photo */}
              {address.photo_url && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Verification Photo</span>
                  <img 
                    src={address.photo_url} 
                    alt="Address verification photo"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Metadata */}
              <Separator />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Flagged {address.flagged_at ? new Date(address.flagged_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>User ID: {address.user_id.slice(0, 8)}...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => handleApprove(address.id)}
                  disabled={processing === address.id}
                  className="flex-1"
                >
                  {processing === address.id ? "Approving..." : "Approve Request"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(address)}
                  disabled={processing === address.id}
                  className="flex-1"
                >
                  Reject Request
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
        itemType="flagged_request"
        item={selectedAddress}
      />
    </>
  );
}