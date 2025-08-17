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

  const verifiedAddresses = addresses.filter(addr => addr.verified);

  const handlePublish = async (addressId: string, isPublic: boolean) => {
    await updateAddressStatus(addressId, { public: isPublic });
    toast({
      title: "Success",
      description: `Address ${isPublic ? 'published' : 'unpublished'} successfully`
    });
  };

  if (loading) {
    return <div className="p-4">Loading publishing queue...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Publishing Queue ({verifiedAddresses.length})</h3>
      
      {verifiedAddresses.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No verified addresses available for publishing</p>
          </CardContent>
        </Card>
      ) : (
        verifiedAddresses.map((address) => (
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
                  <Badge variant={address.public ? "default" : "outline"}>
                    {address.public ? "Published" : "Private"}
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
                {!address.public ? (
                  <Button
                    size="sm"
                    onClick={() => handlePublish(address.id, true)}
                    className="flex items-center gap-1"
                  >
                    <Globe className="h-4 w-4" />
                    Publish to National Registry
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePublish(address.id, false)}
                    className="flex items-center gap-1"
                  >
                    <EyeOff className="h-4 w-4" />
                    Remove from Public Registry
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};