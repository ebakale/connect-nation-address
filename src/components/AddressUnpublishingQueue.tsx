import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddresses } from "@/hooks/useAddresses";
import { EyeOff, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AddressUnpublishingQueue = () => {
  const { addresses, loading, updateAddressStatus, fetchAddresses } = useAddresses();
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const publishedAddresses = addresses.filter(addr => addr.verified && addr.public);

  const handleUnpublish = async (addressId: string) => {
    await updateAddressStatus(addressId, { public: false });
    toast({
      title: "Success",
      description: "Address removed from public registry successfully"
    });
  };

  const handleUnpublishAll = async () => {
    try {
      const unpublishPromises = publishedAddresses.map(address => 
        updateAddressStatus(address.id, { public: false })
      );
      
      await Promise.all(unpublishPromises);
      
      toast({
        title: "Success",
        description: `${publishedAddresses.length} addresses removed from public registry`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove some addresses from public registry",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading published addresses...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Published Addresses ({publishedAddresses.length})</h3>
        {publishedAddresses.length > 0 && (
          <Button 
            onClick={handleUnpublishAll} 
            variant="outline"
            className="flex items-center gap-1"
          >
            <EyeOff className="h-4 w-4" />
            Remove All from Public Registry ({publishedAddresses.length})
          </Button>
        )}
      </div>
      
      {publishedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No published addresses found</p>
          </CardContent>
        </Card>
      ) : (
        publishedAddresses.map((address) => (
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
                  <Badge variant="default">
                    <Globe className="h-3 w-3 mr-1" />
                    Published
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
                  <span className="font-medium">Created:</span> {new Date(address.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleUnpublish(address.id)}
                  className="flex items-center gap-1"
                >
                  <EyeOff className="h-4 w-4" />
                  Remove from Public Registry
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};