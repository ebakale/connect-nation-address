import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, MessageSquare, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface AddressRequest {
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
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  reviewer_notes?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  pending: { color: 'bg-yellow-500', key: 'pending' },
  under_review: { color: 'bg-blue-500', key: 'underReview' },
  approved: { color: 'bg-green-500', key: 'approved' },
  rejected: { color: 'bg-red-500', key: 'rejected' },
  completed: { color: 'bg-purple-500', key: 'completed' }
};

export const AddressRequestStatus = () => {
  const { t } = useTranslation('address');
  const [requests, setRequests] = useState<AddressRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('address_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }) as { data: AddressRequest[] | null, error: any };

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: t('error'),
        description: t('errorFetchingRequests'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user]);

  // Reset pagination when requests change
  useEffect(() => {
    setCurrentPage(1);
  }, [requests]);

  // Calculate pagination
  const totalPages = Math.ceil(requests.length / requestsPerPage);
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginatedRequests = requests.slice(startIndex, startIndex + requestsPerPage);

  const getStatusBadge = (status: AddressRequest['status']) => {
    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className="text-white" style={{ backgroundColor: config.color }}>
        {t(config.key)}
      </Badge>
    );
  };

  const formatAddress = (request: AddressRequest) => {
    const parts = [request.street];
    if (request.building) parts.push(request.building);
    parts.push(request.city, request.region, request.country);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          {t('loadingRequests')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('requestStatusTitle')}</CardTitle>
            <CardDescription>
              {t('requestStatusDescription')}
            </CardDescription>
          </div>
          <Button onClick={fetchRequests} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('refresh')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{t('noRequestsFound')}</p>
            <p className="text-sm">{t('noRequestsDesc')}</p>
          </div>
        ) : (
          <>
            {/* Results count and pagination info */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <span>
                {t('showingResults', { 
                  start: startIndex + 1, 
                  end: Math.min(startIndex + requestsPerPage, requests.length), 
                  total: requests.length 
                })}
              </span>
              {totalPages > 1 && (
                <span>
                  {t('pageOf', { current: currentPage, total: totalPages })}
                </span>
              )}
            </div>

            <div className="space-y-4">
              {paginatedRequests.map((request) => (
                <Card key={request.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold">{formatAddress(request)}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="w-4 h-4" />
                            <span>{t('submittedDate', { date: format(new Date(request.created_at), 'MMM dd, yyyy') })}</span>
                          </div>
                          <span>{t('type', { type: (() => {
                            const v = request.address_type as string | undefined;
                            const hasBraces = v ? v.includes('{{') || v.includes('}}') : false;
                            const cleaned = v ? v.replace(/[{}]/g, '').trim() : '';
                            const safe = !v || hasBraces || cleaned.toLowerCase() === 'type' || cleaned === '' ? 'unknown' : cleaned;
                            return safe;
                          })() })}</span>
                        </div>
                      </div>
                    <div className="ml-4">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">{t('justificationLabel')}</h4>
                      <p className="text-sm text-muted-foreground">{request.justification}</p>
                    </div>

                    {request.description && (
                      <div>
                        <h4 className="font-medium mb-1">{t('descriptionLabel')}</h4>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                    )}

                    {request.reviewer_notes && (
                      <div>
                        <h4 className="font-medium mb-1">{t('reviewerNotes')}</h4>
                        <p className="text-sm text-muted-foreground">{request.reviewer_notes}</p>
                      </div>
                    )}

                    {request.latitude && request.longitude && (
                      <div>
                        <h4 className="font-medium mb-1">{t('coordinates')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {request.latitude}, {request.longitude}
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {t('lastUpdated', { date: format(new Date(request.updated_at), 'MMM dd, yyyy HH:mm') })}
                        </p>
                    </div>
                  </div>
                </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="min-w-[36px]"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};