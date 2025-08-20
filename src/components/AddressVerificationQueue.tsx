import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    console.log('Verifying item:', item.id, 'source:', item.source_type, 'verified:', verified);
    try {
      if (item.source_type === 'request') {
        // Handle address request verification
        const { error } = await supabase
          .from('address_requests')
          .update({ status: verified ? 'approved' : 'rejected' })
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
          .update({ verified })
          .eq('id', item.id);
          
        if (verifyError) throw verifyError;
      }
      
      toast({
        title: "Success",
        description: `${item.source_type === 'request' ? 'Request' : 'Address'} ${verified ? 'verified' : 'rejected'} successfully`,
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
              
              {/* Flag reason for flagged addresses */}
              {isFlagged && item.flag_reason && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-900">Flagged for Review</span>
                  </div>
                  <p className="text-sm text-red-800">{item.flag_reason}</p>
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
                  Reject
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
    </div>
  );
};