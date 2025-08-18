import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Search, Image, MessageSquare, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

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
              {searchResults.filter(addr => !addr.verified).length}
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Address Search</TabsTrigger>
          <TabsTrigger value="verify">Verification Tools</TabsTrigger>
          <TabsTrigger value="quality">Quality Control</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Address Search & Review
              </CardTitle>
              <CardDescription>
                Search for addresses to review and verify
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by UAC, street, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchAddresses()}
                />
                <Button onClick={searchAddresses} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((address) => (
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
                          </div>
                          <div className="flex gap-1">
                            <Badge variant={address.verified ? "default" : "secondary"}>
                              {address.verified ? "Verified" : "Pending"}
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
    </div>
  );
};