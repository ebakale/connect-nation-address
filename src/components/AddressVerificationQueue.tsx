import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/useAddresses";
import { CheckCircle, XCircle, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddressVerificationQueue = () => {
  const { addresses, loading, updateAddressStatus, fetchAddresses } = useAddresses();
  const { toast } = useToast();

  useEffect(() => {
    console.log('AddressVerificationQueue: Fetching addresses...');
    fetchAddresses();
  }, [fetchAddresses]);

  const pendingAddresses = addresses.filter(addr => !addr.verified);

  const handleVerify = async (addressId: string, verified: boolean) => {
    console.log('Verifying address:', addressId, 'verified:', verified);
    try {
      await updateAddressStatus(addressId, { verified });
      toast({
        title: "Success",
        description: `Address ${verified ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      console.error('Verification failed:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status",
        variant: "destructive",
      });
    }
  };

  const handlePublish = async (addressId: string, isPublic: boolean) => {
    console.log('Publishing address:', addressId, 'public:', isPublic);
    try {
      await updateAddressStatus(addressId, { public: isPublic });
      toast({
        title: "Success",
        description: `Address ${isPublic ? 'published' : 'made private'} successfully`,
      });
    } catch (error) {
      console.error('Publishing failed:', error);
      toast({
        title: "Error",
        description: "Failed to update publishing status",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading verification queue...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Verification Queue ({pendingAddresses.length})</h3>
      
      {pendingAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No addresses pending verification</p>
          </CardContent>
        </Card>
      ) : (
        pendingAddresses.map((address) => (
          <Card key={address.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{address.uac}</CardTitle>
                  <CardDescription>
                    {address.building && `${address.building}, `}
                    {address.street}, {address.city}, {address.region}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={address.verified ? "default" : "secondary"}>
                    {address.verified ? "Verified" : "Pending"}
                  </Badge>
                  <Badge variant={address.public ? "default" : "outline"}>
                    {address.public ? "Public" : "Private"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Type:</span> {address.address_type}
                </div>
                <div>
                  <span className="font-medium">Coordinates:</span> {address.latitude}, {address.longitude}
                </div>
              </div>
              
              {address.description && (
                <p className="text-sm text-muted-foreground mb-4">{address.description}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleVerify(address.id, true)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleVerify(address.id, false)}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePublish(address.id, !address.public)}
                  className="flex items-center gap-1"
                >
                  <Eye className="h-4 w-4" />
                  {address.public ? "Make Private" : "Make Public"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};