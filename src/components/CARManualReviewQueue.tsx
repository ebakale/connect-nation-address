import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, CheckCircle, Clock, MapPin, 
  User, Eye, FileText, Navigation
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import type { CitizenAddress } from '@/types/car';

interface ReviewQueueItem {
  id?: string;
  person_id?: string;
  address_kind?: string;
  scope?: string;
  uac?: string;
  unit_uac?: string;
  occupant?: string;
  status?: string;
  effective_from?: string;
  effective_to?: string;
  source?: string;
  notes?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  building?: string;
  address_type?: string;
  address_description?: string;
  latitude?: number;
  longitude?: number;
  nar_verified?: boolean;
  nar_public?: boolean;
  verification_status?: 'UAC_NOT_FOUND' | 'UAC_UNVERIFIED' | 'UAC_VERIFIED';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  person?: {
    id: string;
    national_id?: string;
  };
}

export function CARManualReviewQueue() {
  const { toast } = useToast();
  const { t } = useTranslation(['admin']);
  
  const [queueItems, setQueueItems] = useState<ReviewQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      
      // Fetch addresses that need manual review
      const { data, error } = await supabase
        .from('citizen_address_manual_review_queue')
        .select('*')
        .in('verification_status', ['UAC_NOT_FOUND', 'UAC_UNVERIFIED'])
        .order('created_at', { ascending: true });

      if (error) throw error;

      setQueueItems((data || []) as ReviewQueueItem[]);
    } catch (error) {
      console.error('Error fetching review queue:', error);
      toast({
        title: "Error",
        description: "Failed to load review queue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAddressStatus = async (addressId: string, status: 'CONFIRMED' | 'REJECTED') => {
    try {
      setProcessing(addressId);
      
      const { error } = await supabase.rpc('set_citizen_address_status', {
        p_address_id: addressId,
        p_status: status
      });

      if (error) throw error;

      // Remove from queue
      setQueueItems(prev => prev.filter(item => item.id !== addressId));
      
      toast({
        title: "Success",
        description: `Address ${status.toLowerCase()} successfully`
      });
    } catch (error) {
      console.error('Error updating address status:', error);
      toast({
        title: "Error",
        description: "Failed to update address status",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'UAC_NOT_FOUND':
        return <Badge variant="destructive">UAC Not Found</Badge>;
      case 'UAC_UNVERIFIED':
        return <Badge variant="outline" className="text-yellow-600">UAC Unverified</Badge>;
      case 'CONFIRMED':
        return <Badge variant="outline" className="text-green-600">Confirmed</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getKindBadge = (kind?: string) => {
    switch (kind) {
      case 'PRIMARY':
        return <Badge variant="default">Primary</Badge>;
      case 'SECONDARY':
        return <Badge variant="outline">Secondary</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const getScopeBadge = (scope?: string) => {
    switch (scope) {
      case 'BUILDING':
        return <Badge variant="outline">Building</Badge>;
      case 'UNIT':
        return <Badge variant="outline">Unit</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const uacNotFoundItems = queueItems.filter(item => item.verification_status === 'UAC_NOT_FOUND');
  const uacUnverifiedItems = queueItems.filter(item => item.verification_status === 'UAC_UNVERIFIED');

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{queueItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Require manual review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UAC Not Found</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{uacNotFoundItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Invalid UAC references
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">UAC Unverified</CardTitle>
            <Eye className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{uacUnverifiedItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Unverified UAC references
            </p>
          </CardContent>
        </Card>
      </div>

      {queueItems.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
            <p className="text-muted-foreground">No addresses require manual review at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="uac-not-found" className="space-y-4">
          <TabsList>
            <TabsTrigger value="uac-not-found">
              UAC Not Found ({uacNotFoundItems.length})
            </TabsTrigger>
            <TabsTrigger value="uac-unverified">
              UAC Unverified ({uacUnverifiedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="uac-not-found" className="space-y-4">
            {uacNotFoundItems.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No addresses with missing UAC references.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {uacNotFoundItems.map((item) => (
                  <Card key={item.id} className="border-red-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.uac}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {item.street}, {item.city}, {item.region}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(item.verification_status)}
                          {getKindBadge(item.address_kind)}
                          {getScopeBadge(item.scope)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Issue:</strong> Referenced UAC "{item.uac}" does not exist in the NAR system.
                            This address needs verification or the UAC needs to be corrected.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Address Kind:</span> {item.address_kind}
                          </div>
                          <div>
                            <span className="font-medium">Scope:</span> {item.scope}
                          </div>
                          <div>
                            <span className="font-medium">Occupant:</span> {item.occupant}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span> {item.source}
                          </div>
                        </div>

                        {item.notes && (
                          <div className="bg-muted p-3 rounded">
                            <div className="text-sm font-medium mb-1">Notes:</div>
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => updateAddressStatus(item.id!, 'CONFIRMED')}
                            disabled={processing === item.id}
                            size="sm"
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Anyway
                          </Button>
                          <Button
                            onClick={() => updateAddressStatus(item.id!, 'REJECTED')}
                            disabled={processing === item.id}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="uac-unverified" className="space-y-4">
            {uacUnverifiedItems.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  No addresses with unverified UAC references.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {uacUnverifiedItems.map((item) => (
                  <Card key={item.id} className="border-yellow-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{item.uac}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" />
                            {item.street}, {item.city}, {item.region}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {getStatusBadge(item.verification_status)}
                          {getKindBadge(item.address_kind)}
                          {getScopeBadge(item.scope)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Alert>
                          <Eye className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Notice:</strong> Referenced UAC "{item.uac}" exists but is not verified in the NAR system.
                            Review and decide whether to approve this citizen address.
                          </AlertDescription>
                        </Alert>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Address Kind:</span> {item.address_kind}
                          </div>
                          <div>
                            <span className="font-medium">Scope:</span> {item.scope}
                          </div>
                          <div>
                            <span className="font-medium">Occupant:</span> {item.occupant}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span> {item.source}
                          </div>
                        </div>

                        {item.notes && (
                          <div className="bg-muted p-3 rounded">
                            <div className="text-sm font-medium mb-1">Notes:</div>
                            <div className="text-sm text-muted-foreground">{item.notes}</div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => updateAddressStatus(item.id!, 'CONFIRMED')}
                            disabled={processing === item.id}
                            size="sm"
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm
                          </Button>
                          <Button
                            onClick={() => updateAddressStatus(item.id!, 'REJECTED')}
                            disabled={processing === item.id}
                            variant="destructive"
                            size="sm"
                            className="flex-1"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}