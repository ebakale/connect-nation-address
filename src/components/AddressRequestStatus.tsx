import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, MessageSquare, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface AddressRequestData {
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
  const [requests, setRequests] = useState<AddressRequestData[]>([]);
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
      const { data, error } = await supabase
        .from('address_requests')
        .select('id, country, region, city, street, building, latitude, longitude, address_type, description, justification, status, reviewer_notes, created_at, updated_at')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setRequests(data || []);
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

  const formatAddress = (request: AddressRequestData) => {
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

  // Pagination logic
  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const endIndex = startIndex + requestsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('noRequests')}</h3>
            <p className="text-muted-foreground">{t('noRequestsDescription')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{t('yourAddressRequests')}</h2>
        <Button
          variant="outline"
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </Button>
      </div>

      <div className="space-y-4">
        {currentRequests.map((request) => {
          const isExpanded = expandedCards.has(request.id);
          
          return (
            <Card key={request.id} className="border-l-4 border-l-primary/20">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {formatAddress(request)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </span>
                      <span className="capitalize">{request.address_type}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCardExpansion(request.id)}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">{t('requestDetails')}</h4>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t('status')}:</dt>
                          <dd className="capitalize">{request.status}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t('type')}:</dt>
                          <dd className="capitalize">{request.address_type}</dd>
                        </div>
                        {request.latitude && request.longitude && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{t('coordinates')}:</dt>
                            <dd>{request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">{t('justification')}</h4>
                      <p className="text-muted-foreground text-sm">{request.justification}</p>
                      
                      {request.description && (
                        <>
                          <h4 className="font-medium mb-2 mt-4">{t('description')}</h4>
                          <p className="text-muted-foreground text-sm">{request.description}</p>
                        </>
                      )}

                      {request.reviewer_notes && (
                        <>
                          <h4 className="font-medium mb-2 mt-4 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {t('reviewerNotes')}
                          </h4>
                          <p className="text-muted-foreground text-sm bg-muted p-2 rounded">
                            {request.reviewer_notes}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      {t('lastUpdated')}: {format(new Date(request.updated_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground px-4">
            {t('pageXOfY', { current: currentPage, total: totalPages })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};