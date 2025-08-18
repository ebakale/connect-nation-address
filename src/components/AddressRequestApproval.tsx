import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, MapPin, User, Calendar, Map } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddressLocationMap } from "@/components/AddressLocationMap";

interface AddressRequest {
  id: string;
  user_id: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  address_type: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  justification: string;
  status: string;
  created_at: string;
  reviewer_notes?: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export const AddressRequestApproval = () => {
  const [requests, setRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewerNotes, setReviewerNotes] = useState<{ [key: string]: string }>({});
  const [showMapView, setShowMapView] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPendingRequests = async () => {
    setLoading(true);
    try {
      const { data: requests, error } = await supabase
        .from('address_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!requests || requests.length === 0) {
        setRequests([]);
        return;
      }

      // Get user IDs from requests
      const userIds = requests.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const combinedData = requests.map(request => {
        const profile = profiles?.find(p => p.user_id === request.user_id);
        return {
          ...request,
          profiles: {
            full_name: profile?.full_name || 'Unknown User',
            email: profile?.email || 'unknown@example.com'
          }
        };
      });

      setRequests(combinedData);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      toast({
        title: "Error",
        description: "Failed to load address requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const generateUAC = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleApproval = async (requestId: string, approved: boolean) => {
    if (!user) return;

    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    const notes = reviewerNotes[requestId] || '';

    try {
      if (approved) {
        // Create address entry
        const { error: addressError } = await supabase
          .from('addresses')
          .insert({
            user_id: request.user_id,
            uac: generateUAC(),
            country: request.country,
            region: request.region,
            city: request.city,
            street: request.street,
            building: request.building,
            address_type: request.address_type,
            latitude: request.latitude || 0,
            longitude: request.longitude || 0,
            description: request.description,
            verified: false,
            public: false
          });

        if (addressError) throw addressError;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('address_requests')
        .update({
          status: approved ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: `Request ${approved ? 'approved' : 'rejected'} successfully`,
      });

      // Remove from local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      setReviewerNotes(prev => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });

    } catch (error) {
      console.error('Approval process failed:', error);
      toast({
        title: "Error",
        description: "Failed to process request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="p-4">Loading address requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Address Request Approval ({requests.length})</h3>
        <Button variant="outline" onClick={fetchPendingRequests}>
          Refresh
        </Button>
      </div>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No pending address requests</p>
          </CardContent>
        </Card>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="border-l-4 border-l-amber-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {request.building && `${request.building}, `}
                    {request.street}, {request.city}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {request.profiles?.full_name} ({request.profiles?.email})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {request.address_type}
                </div>
                <div>
                  <span className="font-medium">Region:</span> {request.region}, {request.country}
                </div>
                {request.latitude && request.longitude && (
                  <div className="col-span-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="font-medium">Coordinates:</span> {request.latitude}, {request.longitude}
                  </div>
                )}
              </div>
              
              <div>
                <span className="font-medium text-sm">Justification:</span>
                <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                  {request.justification}
                </p>
              </div>

              {request.description && (
                <div>
                  <span className="font-medium text-sm">Description:</span>
                  <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted rounded">
                    {request.description}
                  </p>
                </div>
              )}

              {/* Map View Section */}
              {request.latitude && request.longitude && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Location Verification</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMapView(prev => ({
                        ...prev,
                        [request.id]: !prev[request.id]
                      }))}
                      className="flex items-center gap-1"
                    >
                      <Map className="h-3 w-3" />
                      {showMapView[request.id] ? 'Hide Map' : 'View on Map'}
                    </Button>
                  </div>
                  
                  {showMapView[request.id] && (
                    <AddressLocationMap
                      latitude={request.latitude}
                      longitude={request.longitude}
                      address={{
                        street: request.street,
                        city: request.city,
                        region: request.region,
                        country: request.country,
                        building: request.building
                      }}
                      onClose={() => setShowMapView(prev => ({
                        ...prev,
                        [request.id]: false
                      }))}
                    />
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`notes-${request.id}`}>Reviewer Notes (Optional)</Label>
                <Textarea
                  id={`notes-${request.id}`}
                  placeholder="Add notes about your decision..."
                  value={reviewerNotes[request.id] || ''}
                  onChange={(e) => setReviewerNotes(prev => ({
                    ...prev,
                    [request.id]: e.target.value
                  }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleApproval(request.id, true)}
                  className="flex items-center gap-1 flex-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Create Address
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleApproval(request.id, false)}
                  className="flex items-center gap-1 flex-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Request
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};