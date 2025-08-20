import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddresses } from "@/hooks/useAddresses";
import { CheckCircle, XCircle, Eye, MapPin, FileText, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddressLocationMap } from "@/components/AddressLocationMap";
import { supabase } from "@/integrations/supabase/client";

export const AddressVerificationQueue = () => {
  const { updateAddressStatus } = useAddresses();
  const { toast } = useToast();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionItem, setRejectionItem] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    console.log('AddressVerificationQueue: Component mounted, fetching review queue...');
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      console.log('Fetching review queue...');
      const { data, error } = await supabase.rpc('get_review_queue');
      
      if (error) throw error;
      
      console.log('Review queue fetched:', data?.length || 0, 'items');
      setReviewItems(data || []);
    } catch (error) {
      console.error('Failed to fetch review queue:', error);
      toast({
        title: "Error",
        description: "Failed to load review queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (item: any, verified: boolean) => {
    if (!verified) {
      // Open rejection dialog for detailed feedback
      setRejectionItem(item);
      setRejectionDialogOpen(true);
      return;
    }

    console.log('Verifying item:', item.id, 'source:', item.source_type, 'verified:', verified);
    try {
      if (item.source_type === 'request') {
        // Handle address request verification
        const { error } = await supabase
          .from('address_requests')
          .update({ status: 'approved' })
          .eq('id', item.id);
        
        if (error) throw error;
      } else if (item.source_type === 'flagged_address') {
        // Handle flagged address verification - unflag and verify
        const { error: unflagError } = await supabase.rpc('unflag_address', {
          p_address_id: item.id
        });
        
        if (unflagError) throw unflagError;
        
        const { error: verifyError } = await supabase
          .from('addresses')
          .update({ verified: true })
          .eq('id', item.id);
          
        if (verifyError) throw verifyError;
      }
      
      toast({
        title: "Success",
        description: `${item.source_type === 'request' ? 'Request' : 'Address'} verified successfully`,
      });
      
      fetchReviewQueue(); // Refresh the queue
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithFeedback = async () => {
    if (!rejectionItem || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Rejection reason is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (rejectionItem.source_type === 'request') {
        const { error } = await supabase.rpc('reject_address_request_with_feedback', {
          p_request_id: rejectionItem.id,
          p_rejection_reason: rejectionReason,
          p_rejection_notes: rejectionNotes || null
        });
        
        if (error) throw error;
      } else if (rejectionItem.source_type === 'flagged_address') {
        const { error } = await supabase.rpc('reject_flagged_address_with_feedback', {
          p_address_id: rejectionItem.id,
          p_rejection_reason: rejectionReason,
          p_rejection_notes: rejectionNotes || null
        });
        
        if (error) throw error;
      }
      
      toast({
        title: "Success",
        description: `${rejectionItem.source_type === 'request' ? 'Request' : 'Address'} rejected with feedback`,
      });
      
      // Reset form and close dialog
      setRejectionReason("");
      setRejectionNotes("");
      setRejectionDialogOpen(false);
      setRejectionItem(null);
      
      fetchReviewQueue(); // Refresh the queue
    } catch (error) {
      console.error('Rejection failed:', error);
      toast({
        title: "Error",
        description: "Failed to reject with feedback",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (item: any, isPublic: boolean) => {
    if (item.source_type !== 'flagged_address') return;
    
    console.log('Publishing address:', item.id, 'public:', isPublic);
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ public: isPublic })
        .eq('id', item.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Address ${isPublic ? 'published' : 'made private'} successfully`,
      });
      
      fetchReviewQueue(); // Refresh the queue
    } catch (error) {
      console.error('Publishing failed:', error);
      toast({
        title: "Error",
        description: "Failed to update publishing status",
        variant: "destructive",
      });
    }
  };

  const handleViewOnMap = (item) => {
    setSelectedAddress(item);
    setMapDialogOpen(true);
  };

  console.log('AddressVerificationQueue: Rendering with', reviewItems.length, 'review items');

  if (loading) {
    console.log('AddressVerificationQueue: Still loading...');
    return <div className="p-4">Loading verification queue...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Review Queue ({reviewItems.length})</h3>
      
      {reviewItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No items pending verification</p>
          </CardContent>
        </Card>
      ) : (
        reviewItems.map((item) => {
          const isRequest = item.source_type === 'request';
          const isFlagged = item.source_type === 'flagged_address';
          const isPropertyClaim = item.claimant_type === 'owner';
          
          return (
          <Card key={`${item.source_type}-${item.id}`} className={`${isPropertyClaim ? 'border-l-4 border-l-orange-500' : ''} ${isFlagged ? 'border-red-200 bg-red-50/30' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {item.uac || `New ${isRequest ? 'Request' : 'Address'}`}
                    {isFlagged && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </CardTitle>
                  <CardDescription>
                    {item.building && `${item.building}, `}
                    {item.street}, {item.city}, {item.region}
                  </CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={isRequest ? "secondary" : isFlagged ? "destructive" : "default"}>
                    {isRequest ? "New Request" : isFlagged ? "Flagged for Review" : item.status}
                  </Badge>
                  {item.public !== null && (
                    <Badge variant={item.public ? "default" : "outline"}>
                      {item.public ? "Public" : "Private"}
                    </Badge>
                  )}
                  {isPropertyClaim && (
                    <Badge variant="default" className="bg-orange-500">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Property Claim
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Type:</span> {item.address_type}
                </div>
                <div>
                  <span className="font-medium">Coordinates:</span> {item.latitude}, {item.longitude}
                </div>
                {isPropertyClaim && (
                  <div className="col-span-2">
                    <span className="font-medium">Claimant:</span> 
                    <span className="ml-1 text-orange-600 font-medium">Property Owner</span>
                  </div>
                )}
              </div>
              
              {item.description && (
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              )}
              
              {/* Flag reason and analysis for flagged addresses */}
              {isFlagged && item.flag_reason && (
                <div className="mb-4 space-y-3">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900">🚩 FLAGGED FOR REVIEW</span>
                    </div>
                    <p className="text-sm text-red-800 font-medium">{item.flag_reason}</p>
                    {item.flagged_at && (
                      <p className="text-xs text-red-600 mt-1">
                        Flagged: {new Date(item.flagged_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  {/* Display verification analysis if available */}
                  {item.verification_analysis && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Verification Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {item.verification_analysis.overallScore && (
                          <div>
                            <span className="font-medium">Overall Score:</span>
                            <span className={`ml-1 ${item.verification_analysis.overallScore < 70 ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                              {item.verification_analysis.overallScore}%
                            </span>
                          </div>
                        )}
                        {item.verification_analysis.accuracy && (
                          <div>
                            <span className="font-medium">Precision:</span>
                            <span className="ml-1">{item.verification_analysis.accuracy.precision}</span>
                          </div>
                        )}
                        {item.verification_analysis.consistency && (
                          <div className="col-span-2">
                            <span className="font-medium">Address Match:</span>
                            <span className={`ml-1 ${item.verification_analysis.consistency.addressMatch ? 'text-green-600' : 'text-red-600'}`}>
                              {item.verification_analysis.consistency.addressMatch ? '✓ Match' : '✗ No Match'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Display recommendations */}
                  {item.verification_recommendations && item.verification_recommendations.length > 0 && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">⚠️ Verification Recommendations</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        {item.verification_recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Justification for requests */}
              {isRequest && item.justification && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="font-medium text-blue-900">Justification:</span>
                  <p className="text-sm text-blue-800 mt-1">{item.justification}</p>
                </div>
              )}

              {/* Property Ownership Alert for Verifiers */}
              {isPropertyClaim && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900">Property Ownership Verification Required</span>
                  </div>
                  <p className="text-sm text-orange-800 mb-2">
                    This address was claimed by a property owner. Verify ownership documentation and cross-check against official records.
                  </p>
                  {item.proof_of_ownership_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(item.proof_of_ownership_url, '_blank')}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      View Ownership Document
                    </Button>
                  )}
                </div>
              )}

              {/* Address Photo if available */}
              {item.photo_url && (
                <div className="mb-4">
                  <span className="font-medium text-sm">Address Photo:</span>
                  <img
                    src={item.photo_url}
                    alt="Address location"
                    className="w-full max-h-32 object-cover border rounded mt-1"
                  />
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => handleVerify(item, true)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isRequest ? 'Approve' : 'Verify'}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleVerify(item, false)}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject with Feedback
                </Button>
                {isFlagged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePublish(item, !item.public)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    {item.public ? "Make Private" : "Make Public"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleViewOnMap(item)}
                  className="flex items-center gap-1"
                >
                  <MapPin className="h-4 w-4" />
                  View on Map
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })
      )}

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Address Location: {selectedAddress?.uac}
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <AddressLocationMap
              latitude={Number(selectedAddress.latitude)}
              longitude={Number(selectedAddress.longitude)}
              address={{
                street: selectedAddress.street,
                city: selectedAddress.city,
                region: selectedAddress.region,
                country: selectedAddress.country,
                building: selectedAddress.building
              }}
              onClose={() => setMapDialogOpen(false)}
              allowResize={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Feedback Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Reject {rejectionItem?.source_type === 'request' ? 'Request' : 'Address'} with Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 bg-muted border rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Address:</span> {rejectionItem?.building && `${rejectionItem.building}, `}
                {rejectionItem?.street}, {rejectionItem?.city}, {rejectionItem?.region}
              </p>
              {rejectionItem?.uac && (
                <p className="text-sm">
                  <span className="font-medium">UAC:</span> {rejectionItem.uac}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Input
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Brief reason for rejection (e.g., Invalid coordinates, Missing documentation)"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rejectionNotes">Additional Notes (Optional)</Label>
              <Textarea
                id="rejectionNotes"
                value={rejectionNotes}
                onChange={(e) => setRejectionNotes(e.target.value)}
                placeholder="Detailed explanation or specific instructions for resubmission..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectionDialogOpen(false);
                  setRejectionReason("");
                  setRejectionNotes("");
                  setRejectionItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectWithFeedback}
                disabled={!rejectionReason.trim()}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject with Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};