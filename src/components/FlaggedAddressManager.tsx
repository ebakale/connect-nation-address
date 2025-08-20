import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle2, X, Clock, MapPin, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddressLocationMap } from "@/components/AddressLocationMap";

interface FlaggedAddress {
  id: string;
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  flagged: boolean;
  flag_reason: string;
  flagged_at: string;
  flagged_by: string;
  verified: boolean;
  photo_url?: string;
}

export const FlaggedAddressManager = () => {
  const [flaggedAddresses, setFlaggedAddresses] = useState<FlaggedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<FlaggedAddress | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadFlaggedAddresses();
  }, []);

  const loadFlaggedAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('flagged', true)
        .order('flagged_at', { ascending: false });

      if (error) throw error;
      setFlaggedAddresses(data || []);
    } catch (error) {
      console.error('Failed to load flagged addresses:', error);
      toast({
        title: "Error",
        description: "Unable to load flagged addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const unflagAddress = async (addressId: string) => {
    try {
      const { error } = await supabase.rpc('unflag_address', {
        p_address_id: addressId
      });

      if (error) throw error;

      toast({
        title: "Address Unflagged",
        description: "Address has been removed from review queue",
      });

      loadFlaggedAddresses();
    } catch (error) {
      console.error('Failed to unflag address:', error);
      toast({
        title: "Error",
        description: "Failed to unflag address",
        variant: "destructive",
      });
    }
  };

  const resolveAndVerify = async (addressId: string) => {
    try {
      const { error: unflagError } = await supabase.rpc('unflag_address', {
        p_address_id: addressId
      });

      if (unflagError) throw unflagError;

      const { error: verifyError } = await supabase
        .from('addresses')
        .update({ verified: true })
        .eq('id', addressId);

      if (verifyError) throw verifyError;

      toast({
        title: "Address Resolved",
        description: "Address has been verified and unflagged",
      });

      loadFlaggedAddresses();
    } catch (error) {
      console.error('Failed to resolve address:', error);
      toast({
        title: "Error",
        description: "Failed to resolve address",
        variant: "destructive",
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      toast({
        title: "Address Deleted",
        description: "Problematic address has been removed from the system",
        variant: "destructive",
      });

      loadFlaggedAddresses();
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading flagged addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Flagged Addresses</h2>
          <p className="text-muted-foreground">
            Manage addresses that require human review and attention
          </p>
        </div>
        <Button onClick={loadFlaggedAddresses} variant="outline">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Refresh ({flaggedAddresses.length})
        </Button>
      </div>

      {flaggedAddresses.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
              <p className="text-lg font-medium">No Flagged Addresses</p>
              <p className="text-sm">All addresses are in good standing</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flaggedAddresses.map((address) => (
            <Card key={address.id} className="border-orange-200 bg-orange-50/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      {address.uac}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {address.street}, {address.city}, {address.region}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">
                    Flagged for Review
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{address.latitude}, {address.longitude}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Flagged: {new Date(address.flagged_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Reason:</span>
                      <p className="text-muted-foreground mt-1 p-2 bg-orange-100 rounded text-xs">
                        {address.flag_reason}
                      </p>
                    </div>
                  </div>
                </div>

                {address.photo_url && (
                  <div className="mt-4">
                    <img 
                      src={address.photo_url} 
                      alt="Address photo" 
                      className="w-full max-w-md h-32 object-cover rounded border"
                    />
                  </div>
                )}

                <div className="flex gap-2 flex-wrap pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAddress(address);
                      setMapDialogOpen(true);
                    }}
                    variant="outline"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => resolveAndVerify(address.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Resolve & Verify
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => unflagAddress(address.id)}
                    variant="secondary"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Unflag Only
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => deleteAddress(address.id)}
                    variant="destructive"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Delete Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Flagged Address Review - {selectedAddress?.uac}
            </DialogTitle>
          </DialogHeader>
          {selectedAddress && (
            <AddressLocationMap
              latitude={selectedAddress.latitude}
              longitude={selectedAddress.longitude}
              address={{
                street: selectedAddress.street,
                city: selectedAddress.city,
                region: selectedAddress.region,
                country: selectedAddress.country,
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