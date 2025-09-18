import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, MessageSquare, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface SimpleAddressRequest {
  id: string;
  country: string;
  region: string;
  city: string;
  street: string;
  building?: string;
  latitude?: number;
  longitude?: number;
  address_type: string;
  description?: string;
  justification: string;
  status: string;
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<string, { color: string; key: string }> = {
  pending: { color: 'bg-yellow-500', key: 'pending' },
  under_review: { color: 'bg-blue-500', key: 'underReview' },
  approved: { color: 'bg-green-500', key: 'approved' },
  rejected: { color: 'bg-red-500', key: 'rejected' },
  completed: { color: 'bg-purple-500', key: 'completed' }
};

export const AddressRequestStatus = () => {
  const { t } = useTranslation('address');
  const [requests, setRequests] = useState<SimpleAddressRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Simple direct query to avoid type recursion
      const query = supabase
        .from('address_requests')
        .select('id, country, region, city, street, building, latitude, longitude, address_type, description, justification, status, reviewer_notes, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      const result = await query;
      
      if (result.error) throw result.error;
      setRequests(result.data || []);
    } catch (error) {
      console.error('Error fetching address requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch address requests',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { color: 'bg-gray-500', key: 'unknown' };
    return (
      <Badge className={`${config.color} text-white`}>
        {t(config.key)}
      </Badge>
    );
  };

  const formatAddress = (request: SimpleAddressRequest) => {
    const parts = [
      request.building,
      request.street,
      request.city,
      request.region,
      request.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const toggleCardExpansion = (requestId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedCards(newExpanded);
  };

  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  if (loading) {
    return (
      <Card>
        <CardHeader className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <CardTitle>Loading requests...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Address Request Status
            </CardTitle>
            <CardDescription>
              Track your address submissions
            </CardDescription>
          </div>
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No requests found</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentRequests.map((request) => {
                const isExpanded = expandedCards.has(request.id);
                return (
                  <div key={request.id} className="border rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatAddress(request)}</span>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>Submitted: {format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {request.address_type}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardExpansion(request.id)}
                        className="ml-2"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t">
                        {request.description && (
                          <div>
                            <span className="text-sm font-medium">Description:</span>
                            <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                          </div>
                        )}
                        
                        <div>
                          <span className="text-sm font-medium">Justification:</span>
                          <p className="text-sm text-muted-foreground mt-1">{request.justification}</p>
                        </div>

                        {request.reviewer_notes && (
                          <div>
                            <span className="text-sm font-medium">Reviewer Notes:</span>
                            <p className="text-sm text-muted-foreground mt-1">{request.reviewer_notes}</p>
                          </div>
                        )}

                        {request.latitude && request.longitude && (
                          <div>
                            <span className="text-sm font-medium">Coordinates:</span>
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          <span>Last Updated: {format(new Date(request.updated_at), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};