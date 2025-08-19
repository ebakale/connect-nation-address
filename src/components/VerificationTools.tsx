import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Search, Image, MessageSquare, Clock, CheckCircle2, AlertTriangle, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddressLocationMap } from "@/components/AddressLocationMap";

interface VerificationRecord {
  id: string;
  address_id: string;
  verifier_notes: string;
  verification_date: string;
  coordinates_accuracy: number;
  photo_quality_score: number;
}

interface AddressDetails {
  id: string;
  uac: string;
  street: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  description?: string;
  verified: boolean;
  public: boolean;
  created_at: string;
}

export const VerificationTools = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [coordinatesAccuracy, setCoordinatesAccuracy] = useState<number>(95);
  const [photoQualityScore, setPhotoQualityScore] = useState<number>(90);
  const [searchResults, setSearchResults] = useState<AddressDetails[]>([]);
  const [pendingAddresses, setPendingAddresses] = useState<AddressDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load pending addresses on component mount
  useEffect(() => {
    loadPendingAddresses();
  }, []);

  // Load addresses that need verification
  const loadPendingAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAddresses(data || []);
    } catch (error) {
      console.error('Failed to load pending addresses:', error);
      toast({
        title: "Error",
        description: "Unable to load pending addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search addresses for verification
  const searchAddresses = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .or(`uac.ilike.%${searchQuery}%,street.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Unable to search addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save verification record
  const saveVerificationRecord = async () => {
    if (!selectedAddress || !user) return;

    try {
      // For now, we'll save notes in the address table
      // In a real system, you might have a separate verification_records table
      const { error } = await supabase
        .from('addresses')
        .update({
          description: verificationNotes ? 
            (selectedAddress.description ? 
              `${selectedAddress.description}\n\nVerifier Notes: ${verificationNotes}` : 
              `Verifier Notes: ${verificationNotes}`) : 
            selectedAddress.description
        })
        .eq('id', selectedAddress.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Verification record saved successfully",
      });

      setVerificationNotes("");
    } catch (error) {
      console.error('Failed to save verification record:', error);
      toast({
        title: "Error",
        description: "Failed to save verification record",
        variant: "destructive",
      });
    }
  };

  // Bulk verification actions
  const bulkVerifyAddresses = async (addressIds: string[], verified: boolean) => {
    try {
      const { error } = await supabase
        .from('addresses')
        .update({ verified })
        .in('id', addressIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${addressIds.length} addresses ${verified ? 'verified' : 'rejected'} successfully`,
      });

      // Refresh search results
      if (searchQuery) {
        searchAddresses();
      }
    } catch (error) {
      console.error('Bulk verification failed:', error);
      toast({
        title: "Error",
        description: "Bulk verification failed",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {pendingAddresses.length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Verified Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {searchResults.filter(addr => addr.verified).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((coordinatesAccuracy + photoQualityScore) / 2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Pending Verification</TabsTrigger>
          <TabsTrigger value="individual">Individual Verify</TabsTrigger>
          <TabsTrigger value="verify">Verification Tools</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Addresses Pending Verification
              </CardTitle>
              <CardDescription>
                Review and select addresses that need verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pending addresses...</p>
                </div>
              ) : pendingAddresses.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {pendingAddresses.map((address) => (
                    <Card 
                      key={address.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedAddress?.id === address.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{address.uac}</h4>
                            <p className="text-sm text-muted-foreground">
                              {address.street}, {address.city}, {address.region}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="text-xs">{address.latitude}, {address.longitude}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(address.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Badge variant="secondary">
                              Pending Verification
                            </Badge>
                            <Badge variant={address.public ? "default" : "outline"}>
                              {address.public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No addresses pending verification</p>
                  <p className="text-sm">All addresses have been verified!</p>
                </div>
              )}
              
              {pendingAddresses.length > 0 && (
                <Button 
                  onClick={loadPendingAddresses} 
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Refresh List
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Individual Address Verification
              </CardTitle>
              <CardDescription>
                Verify or reject individual addresses with detailed status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAddress ? (
                <>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label>Address Details</Label>
                      <div className="p-4 bg-muted rounded-md space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-lg">{selectedAddress.uac}</p>
                            <p className="text-muted-foreground">
                              {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.region}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Coordinates: {selectedAddress.latitude}, {selectedAddress.longitude}
                            </p>
                            {selectedAddress.description && (
                              <p className="text-sm mt-2">{selectedAddress.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge variant={selectedAddress.verified ? "default" : "secondary"}>
                              {selectedAddress.verified ? "Verified" : "Pending"}
                            </Badge>
                            <Badge variant={selectedAddress.public ? "default" : "outline"}>
                              {selectedAddress.public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedAddress.photo_url && (
                      <div>
                        <Label>Address Photo</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <img 
                            src={selectedAddress.photo_url} 
                            alt="Address photo" 
                            className="w-full max-w-md h-48 object-cover rounded-md mx-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ verified: true })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: "Address Verified",
                            description: `Address ${selectedAddress.uac} has been verified successfully`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, verified: true} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Verification failed:', error);
                          toast({
                            title: "Error",
                            description: "Failed to verify address",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1"
                      disabled={selectedAddress.verified}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {selectedAddress.verified ? "Already Verified" : "Verify Address"}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ verified: false })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: "Address Rejected",
                            description: `Address ${selectedAddress.uac} has been rejected`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, verified: false} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Rejection failed:', error);
                          toast({
                            title: "Error",
                            description: "Failed to reject address",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reject Address
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('addresses')
                            .update({ public: !selectedAddress.public })
                            .eq('id', selectedAddress.id);

                          if (error) throw error;

                          toast({
                            title: "Status Updated",
                            description: `Address is now ${!selectedAddress.public ? 'public' : 'private'}`,
                          });

                          // Update selected address state
                          setSelectedAddress(prev => prev ? {...prev, public: !prev.public} : null);
                          
                          // Refresh pending addresses list
                          loadPendingAddresses();
                        } catch (error) {
                          console.error('Status update failed:', error);
                          toast({
                            title: "Error",
                            description: "Failed to update status",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="flex-1"
                    >
                      Make {selectedAddress.public ? 'Private' : 'Public'}
                    </Button>
                    
                    <Button
                      variant="secondary"
                      onClick={() => setMapDialogOpen(true)}
                      className="flex-1"
                    >
                      <Map className="h-4 w-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an address from the search results to verify individually</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Verification Details
              </CardTitle>
              <CardDescription>
                Add verification notes and quality assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedAddress ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Selected Address</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">{selectedAddress.uac}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.street}, {selectedAddress.city}
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label>Coordinates</Label>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm">{selectedAddress.latitude}, {selectedAddress.longitude}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="verification-notes">Verification Notes</Label>
                    <Textarea
                      id="verification-notes"
                      placeholder="Add verification notes, observations, or quality assessments..."
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="coords-accuracy">Coordinates Accuracy (%)</Label>
                      <Input
                        id="coords-accuracy"
                        type="number"
                        min="0"
                        max="100"
                        value={coordinatesAccuracy}
                        onChange={(e) => setCoordinatesAccuracy(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="photo-quality">Photo Quality Score (%)</Label>
                      <Input
                        id="photo-quality"
                        type="number"
                        min="0"
                        max="100"
                        value={photoQualityScore}
                        onChange={(e) => setPhotoQualityScore(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <Button onClick={saveVerificationRecord} className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Save Verification Record
                  </Button>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an address from the search results to begin verification</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Quality Control & Bulk Actions
              </CardTitle>
              <CardDescription>
                Perform bulk verification and quality control operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {searchResults.length > 0 ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => bulkVerifyAddresses(
                        searchResults.filter(addr => !addr.verified).map(addr => addr.id), 
                        true
                      )}
                      className="flex-1"
                      disabled={searchResults.filter(addr => !addr.verified).length === 0}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Verify All Pending ({searchResults.filter(addr => !addr.verified).length})
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => bulkVerifyAddresses(
                        searchResults.filter(addr => addr.verified).map(addr => addr.id), 
                        false
                      )}
                      disabled={searchResults.filter(addr => addr.verified).length === 0}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reject All Verified ({searchResults.filter(addr => addr.verified).length})
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Quality Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">Verification Rate</p>
                        <p className="text-muted-foreground">
                          {searchResults.length > 0 ? 
                            Math.round((searchResults.filter(addr => addr.verified).length / searchResults.length) * 100) : 0}%
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <p className="font-medium">Public Addresses</p>
                        <p className="text-muted-foreground">
                          {searchResults.filter(addr => addr.public).length} of {searchResults.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Search for addresses to access quality control tools</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Address Verification - Location View
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