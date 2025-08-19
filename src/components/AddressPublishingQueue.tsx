import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/useAddresses";
import { Globe, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddressPublishingQueue = () => {
  const { addresses, loading, updateAddressStatus, fetchAddresses } = useAddresses();
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const unpublishedAddresses = addresses.filter(addr => addr.verified && !addr.public);

  const handlePublish = async (addressId: string, isPublic: boolean) => {
    await updateAddressStatus(addressId, { public: isPublic });
    toast({
      title: "Success",
      description: `Address ${isPublic ? 'published' : 'unpublished'} successfully`
    });
  };

  const handlePublishAll = async () => {
    try {
      const publishPromises = unpublishedAddresses.map(address => 
        updateAddressStatus(address.id, { public: true })
      );
      
      await Promise.all(publishPromises);
      
      toast({
        title: "Success",
        description: `${unpublishedAddresses.length} addresses published successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to publish some addresses",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading publishing queue...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Publishing Queue ({unpublishedAddresses.length})</h3>
        {unpublishedAddresses.length > 0 && (
          <Button onClick={handlePublishAll} className="flex items-center gap-1">
            <Globe className="h-4 w-4" />
            Publish All ({unpublishedAddresses.length})
          </Button>
        )}
      </div>
      
      {unpublishedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No addresses pending publication</p>
          </CardContent>
        </Card>
      ) : (
        unpublishedAddresses.map((address) => (
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
                  <Badge variant="default">Verified</Badge>
                  <Badge variant="outline">Private</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="font-medium">Type:</span> {address.address_type}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(address.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePublish(address.id, true)}
                  className="flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  Publish to National Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};