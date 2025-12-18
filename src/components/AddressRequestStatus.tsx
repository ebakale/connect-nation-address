import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CalendarDays, MapPin, MessageSquare, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, FileText, AlertTriangle, Copy, CheckCircle2, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { AddressResubmissionDialog } from '@/components/AddressResubmissionDialog';
import { QRCodeGenerator } from '@/components/QRCodeGenerator';

interface AddressRequestData {
  id: string;
  requester_id?: string;
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
  rejection_reason?: string;
  rejection_notes?: string;
  rejected_by?: string;
  rejected_at?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  approved_address_id?: string;
  approved_uac?: string;
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
  const [activeTab, setActiveTab] = useState<'all' | 'rejected'>('all');
  const requestsPerPage = 5;
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [copiedUac, setCopiedUac] = useState<string | null>(null);
  const [resubmissionDialog, setResubmissionDialog] = useState<{
    open: boolean;
    address: AddressRequestData | null;
  }>({ open: false, address: null });

  const copyUacToClipboard = async (uac: string) => {
    try {
      await navigator.clipboard.writeText(uac);
      setCopiedUac(uac);
      toast({
        title: t('common:success'),
        description: t('toast.uacCopied'),
      });
      setTimeout(() => setCopiedUac(null), 2000);
    } catch (error) {
      toast({
        title: t('common:error'),
        description: t('copyFailed'),
        variant: "destructive",
      });
    }
  };

  const fetchRequests = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch requests with their approved address UACs
      const { data: requestsData, error } = await supabase
        .from('address_requests')
        .select('id, requester_id, country, region, city, street, building, latitude, longitude, address_type, description, justification, status, reviewer_notes, rejection_reason, rejection_notes, rejected_by, rejected_at, photo_url, created_at, updated_at, approved_address_id')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }

      // For approved requests with approved_address_id, fetch the UAC
      const requestsWithUac = await Promise.all(
        (requestsData || []).map(async (request) => {
          if (request.status === 'approved' && request.approved_address_id) {
            const { data: addressData } = await supabase
              .from('addresses')
              .select('uac')
              .eq('id', request.approved_address_id)
              .single();
            
            return {
              ...request,
              approved_uac: addressData?.uac || undefined
            };
          }
          return request;
        })
      );
      
      setRequests(requestsWithUac);
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

  const handleResubmit = (request: AddressRequestData) => {
    setResubmissionDialog({ open: true, address: request });
  };

  const handleResubmissionSuccess = () => {
    setResubmissionDialog({ open: false, address: null });
    fetchRequests();
    toast({
      title: t('success'),
      description: t('resubmissionSuccessful'),
    });
  };

  // Filter requests
  const allRequests = requests;
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

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

  const displayRequests = activeTab === 'all' ? allRequests : rejectedRequests;
  const totalPagesForTab = Math.ceil(displayRequests.length / requestsPerPage);
  const startIndexForTab = (currentPage - 1) * requestsPerPage;
  const endIndexForTab = startIndexForTab + requestsPerPage;
  const currentDisplayRequests = displayRequests.slice(startIndexForTab, endIndexForTab);

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

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'all' | 'rejected'); setCurrentPage(1); }}>
        <TabsList>
          <TabsTrigger value="all">{t('allRequests')}</TabsTrigger>
          <TabsTrigger value="rejected">
            {t('rejectedOnly')}
            {rejectedRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{rejectedRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {currentDisplayRequests.map((request) => {
          const isExpanded = expandedCards.has(request.id);
          const isApproved = request.status === 'approved';
          
          return (
            <Card key={request.id} className={`border-l-4 ${isApproved ? 'border-l-green-500' : 'border-l-primary/20'}`}>
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
                      <span>{t(`addressType.${request.address_type.toLowerCase()}`)}</span>
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

                {/* UAC Display for Approved Requests */}
                {isApproved && request.approved_uac && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-xs text-green-700 dark:text-green-300 font-medium">{t('yourUAC')}</p>
                          <p className="text-lg font-mono font-bold text-green-800 dark:text-green-200">{request.approved_uac}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyUacToClipboard(request.approved_uac!)}
                          className="flex items-center gap-1"
                        >
                          {copiedUac === request.approved_uac ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copiedUac === request.approved_uac ? t('common:copied') : t('common:buttons.copy')}
                        </Button>
                        <QRCodeGenerator 
                          uac={request.approved_uac} 
                          addressText={formatAddress(request)}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">{t('requestDetails')}</h4>
                      <dl className="space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t('statusLabel')}:</dt>
                          <dd className="capitalize">{request.status}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">{t('type')}:</dt>
                          <dd>{t(`addressType.${request.address_type.toLowerCase()}`)}</dd>
                        </div>
                        {request.latitude && request.longitude && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{t('coordinates')}:</dt>
                            <dd>{request.latitude.toFixed(6)}, {request.longitude.toFixed(6)}</dd>
                          </div>
                        )}
                        {isApproved && request.approved_uac && (
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{t('uac')}:</dt>
                            <dd className="font-mono font-semibold">{request.approved_uac}</dd>
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
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4 mt-4">
          {currentDisplayRequests.map((request) => {
            const isExpanded = expandedCards.has(request.id);
            
            return (
              <Card key={request.id} className="border-l-4 border-l-destructive">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {formatAddress(request)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date(request.created_at), 'MMM d, yyyy')}
                        </span>
                        <span>{t(`addressType.${request.address_type.toLowerCase()}`)}</span>
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

                  {/* Rejection Alert */}
                  {request.rejection_reason && (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-destructive mb-1">{t('rejectionDetails')}</h4>
                          <p className="text-sm text-destructive/90">{request.rejection_reason}</p>
                          {request.rejection_notes && (
                            <p className="text-sm text-muted-foreground mt-2">{request.rejection_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">{t('requestDetails')}</h4>
                        <dl className="space-y-1">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{t('statusLabel')}:</dt>
                            <dd className="capitalize">{request.status}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">{t('type')}:</dt>
                            <dd>{t(`addressType.${request.address_type.toLowerCase()}`)}</dd>
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
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {t('lastUpdated')}: {format(new Date(request.updated_at), 'MMM d, yyyy HH:mm')}
                      </p>
                      <Button
                        onClick={() => handleResubmit(request)}
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        {t('guidedResubmission')}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalPagesForTab > 1 && (
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
            {t('pageXOfY', { current: currentPage, total: totalPagesForTab })}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPagesForTab}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Resubmission Dialog */}
      {resubmissionDialog.address && resubmissionDialog.address.latitude !== undefined && resubmissionDialog.address.longitude !== undefined && (
        <AddressResubmissionDialog
          open={resubmissionDialog.open}
          onOpenChange={(open) => setResubmissionDialog({ open, address: open ? resubmissionDialog.address : null })}
          rejectedAddress={{
            ...resubmissionDialog.address,
            latitude: resubmissionDialog.address.latitude,
            longitude: resubmissionDialog.address.longitude,
            rejected_by: resubmissionDialog.address.rejected_by || '',
            rejected_at: resubmissionDialog.address.rejected_at || new Date().toISOString(),
            rejection_reason: resubmissionDialog.address.rejection_reason || '',
          }}
          onSuccess={handleResubmissionSuccess}
        />
      )}
    </div>
  );
};