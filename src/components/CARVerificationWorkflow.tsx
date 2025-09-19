import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle, Clock, AlertTriangle, User, Home, 
  FileText, Eye, Settings, Users, Shield 
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from '@/hooks/useUserRole';
import { CitizenAddress } from '@/types/car';

interface CARVerificationWorkflowProps {
  onUpdate?: () => void;
}

export function CARVerificationWorkflow({ onUpdate }: CARVerificationWorkflowProps) {
  const [pendingAddresses, setPendingAddresses] = useState<CitizenAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { hasCARAccess, hasCARManagementAccess } = useUserRole();

  useEffect(() => {
    if (hasCARAccess) {
      fetchPendingAddresses();
    }
  }, [hasCARAccess]);

  const fetchPendingAddresses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('citizen_address_with_details')
        .select('*')
        .eq('status', 'SELF_DECLARED')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingAddresses(data || []);
    } catch (error) {
      console.error('Error fetching pending addresses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (addressId: string, newStatus: 'CONFIRMED' | 'REJECTED') => {
    if (!hasCARAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to update address status",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('set_citizen_address_status', {
        p_address_id: addressId,
        p_status: newStatus
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Address ${newStatus.toLowerCase()} successfully`,
      });

      await fetchPendingAddresses();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating address status:', error);
      toast({
        title: "Error",
        description: "Failed to update address status",
        variant: "destructive",
      });
    }
  };

  if (!hasCARAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            CAR Verification Workflow
          </CardTitle>
          <CardDescription>
            Access denied. You need CAR review permissions to access this workflow.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            CAR Verification Workflow
          </CardTitle>
          <CardDescription>
            Review and verify citizen address declarations
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingAddresses.length})</TabsTrigger>
          <TabsTrigger value="workflow">Workflow Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAddresses.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Reviews</h3>
                <p className="text-muted-foreground">All citizen address declarations have been processed.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingAddresses.map((address) => (
                <Card key={address.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          {address.address_kind} Address Declaration
                        </CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          {address.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-700 border-green-700 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(address.id!, 'CONFIRMED')}
                          disabled={!hasCARAccess}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-700 border-red-700 hover:bg-red-50"
                          onClick={() => handleStatusUpdate(address.id!, 'REJECTED')}
                          disabled={!hasCARAccess}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Address Details</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">UAC:</span> {address.uac}</p>
                          <p><span className="font-medium">Scope:</span> {address.scope}</p>
                          {address.unit_uac && (
                            <p><span className="font-medium">Unit UAC:</span> {address.unit_uac}</p>
                          )}
                          <p><span className="font-medium">Occupant Type:</span> {address.occupant}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Location Information</h4>
                        <div className="space-y-1 text-sm">
                          {address.street && <p><span className="font-medium">Street:</span> {address.street}</p>}
                          {address.city && <p><span className="font-medium">City:</span> {address.city}</p>}
                          {address.region && <p><span className="font-medium">Region:</span> {address.region}</p>}
                          {address.latitude && address.longitude && (
                            <p><span className="font-medium">Coordinates:</span> {address.latitude}, {address.longitude}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Person ID: {address.person_id?.slice(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Declared: {new Date(address.created_at!).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Source: {address.source}</span>
                      </div>
                    </div>

                    {address.notes && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Notes</h5>
                        <p className="text-sm text-muted-foreground">{address.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CAR Verification Process</CardTitle>
              <CardDescription>Step-by-step guide for reviewing citizen address declarations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">1</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Review Declaration</h4>
                    <p className="text-sm text-muted-foreground">
                      Examine the citizen's address declaration, including UAC, scope, and occupant type.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">2</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Verify Location</h4>
                    <p className="text-sm text-muted-foreground">
                      Cross-reference the declared UAC with the NAR system to ensure address validity.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">3</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Check Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      If required, review supporting documentation for residency or ownership claims.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-medium text-sm">4</div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Make Decision</h4>
                    <p className="text-sm text-muted-foreground">
                      Confirm the address if valid, or reject with appropriate reasoning if issues are found.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important Guidelines</h4>
                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                  <li>Primary addresses take precedence over secondary addresses</li>
                  <li>Unit-level addresses require valid unit UACs</li>
                  <li>Check for duplicate person records before confirming</li>
                  <li>Document any concerns or special circumstances in notes</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}