import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Calendar,
  User,
  Search,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { VerificationReviewDialog } from './VerificationReviewDialog';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  claimant_relationship: string;
  primary_document_type: string;
  primary_document_url?: string;
  status: string;
  consent_given: boolean;
  privacy_level: string;
  verification_notes?: string;
  created_at: string;
  verified_at?: string;
  verified_by?: string;
  address_request_id?: string;
  citizen_address_id?: string;
  uac?: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

export const ResidencyVerificationManager = () => {
  const { t } = useTranslation(['admin', 'common']);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);
  
  const { canVerifyAddresses, hasAdminAccess, isResidencyVerifier, roleMetadata, loading: roleLoading } = useUserRole();
  const { toast } = useToast();

  // Get geographical scope from role metadata
  const geographicScope = roleMetadata.find(m => 
    m.scope_type === 'region' || m.scope_type === 'province' || m.scope_type === 'city' || m.scope_type === 'geographic'
  );

  const fetchVerifications = useCallback(async () => {
    if (!canVerifyAddresses && !hasAdminAccess) {
      // Keep current list to avoid flicker when permissions are still loading
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching verifications with permissions:', { canVerifyAddresses, hasAdminAccess, statusFilter, geographicScope });
      
      let query = supabase
        .from('residency_ownership_verifications')
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;
      
      console.log('Verification fetch result:', { dataCount: data?.length, error });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Enrich with address info without relying on PostgREST relationships
      const base = data || [];
      const reqIds = Array.from(new Set(base.filter((v: any) => v.address_request_id).map((v: any) => v.address_request_id)));
      const citizenIds = Array.from(new Set(base.filter((v: any) => v.citizen_address_id).map((v: any) => v.citizen_address_id)));

      // Fetch related datasets in parallel
      const [
        reqRes,
        citizenRes,
      ] = await Promise.all([
        reqIds.length
          ? supabase.from('address_requests').select('id, city, region').in('id', reqIds)
          : Promise.resolve({ data: [], error: null } as any),
        citizenIds.length
          ? supabase.from('citizen_address').select('id, uac').in('id', citizenIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      if ((reqRes as any).error) console.error('Address requests fetch error:', (reqRes as any).error);
      if ((citizenRes as any).error) console.error('Citizen address fetch error:', (citizenRes as any).error);

      // If we have citizen addresses, fetch addresses by UAC to get region/city
      let uacToCityRegion = new Map<string, { city: string | null; region: string | null }>();
      const uacs = ((citizenRes as any).data || []).map((c: any) => c.uac).filter(Boolean);
      if (uacs.length) {
        const { data: addrRows, error: addrErr } = await supabase
          .from('addresses')
          .select('uac, city, region')
          .in('uac', Array.from(new Set(uacs)));
        if (addrErr) {
          console.error('Addresses by UAC fetch error:', addrErr);
        } else {
          addrRows?.forEach((a: any) => uacToCityRegion.set(a.uac, { city: a.city, region: a.region }));
        }
      }

      const reqMap = new Map<string, { city: string | null; region: string | null }>();
      ((reqRes as any).data || []).forEach((r: any) => reqMap.set(r.id, { city: r.city, region: r.region }));

      const citizenIdToUac = new Map<string, string>();
      ((citizenRes as any).data || []).forEach((c: any) => citizenIdToUac.set(c.id, c.uac));

      const combined = base.map((v: any) => {
        let info: { city: string | null; region: string | null } | null = null;
        let uac: string | null = null;
        
        if (v.address_request_id && reqMap.has(v.address_request_id)) {
          info = reqMap.get(v.address_request_id)!;
        } else if (v.citizen_address_id) {
          const citizenUac = citizenIdToUac.get(v.citizen_address_id);
          uac = citizenUac || null;
          if (citizenUac && uacToCityRegion.has(citizenUac)) {
            info = uacToCityRegion.get(citizenUac)!;
          }
        }
        return { ...v, address_info: info, uac };
      });
      // Filter by geographical scope if applicable
      let filteredData: any[] = combined;
      if (!hasAdminAccess && geographicScope && filteredData.length > 0) {
        filteredData = filteredData.filter((v: any) => {
          const info = v.address_info;
          if (!info) return false;
          if (geographicScope.scope_type === 'city') {
            return info.city?.toLowerCase() === geographicScope.scope_value?.toLowerCase();
          } else if (geographicScope.scope_type === 'region' || geographicScope.scope_type === 'province') {
            return info.region?.toLowerCase() === geographicScope.scope_value?.toLowerCase();
          }
          return false;
        });
      }
      
      // If we have verifications, fetch the associated profiles separately
      if (filteredData && filteredData.length > 0) {
        const userIds = filteredData.map(v => v.user_id);
        console.log('Fetching profiles for user IDs:', userIds);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        console.log('Profiles fetch result:', { profiles, profilesError });

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
          // Still proceed with verification data even if profiles fail
        }

        // Combine the data
        const combinedData = filteredData.map(verification => {
          const profile = profiles?.find(p => p.user_id === verification.user_id);
          console.log(`Mapping verification ${verification.id} with user_id ${verification.user_id}:`, { profile });
          return {
            ...verification,
            profiles: profile ? { 
              full_name: profile.full_name || t('admin:unknownUser'), 
              email: profile.email || t('admin:unknownEmail') 
            } : { full_name: t('admin:unknownUser'), email: t('admin:unknownEmail') }
          };
        });
        
        console.log('Final combined data:', combinedData);
        setVerifications(combinedData as unknown as VerificationRequest[]);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: t('common:error', { defaultValue: 'Error' }),
        description: t('admin:failedToFetchVerificationRequests', { defaultValue: 'Failed to fetch verification requests' }),
        variant: 'destructive'
      });
      setVerifications([]); // Ensure we clear the list on error
    } finally {
      setLoading(false);
    }
  }, [canVerifyAddresses, hasAdminAccess, statusFilter, geographicScope, toast]);

  const updateVerificationStatus = async (verificationId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('residency_ownership_verifications')
        .update({
          status: newStatus as any,
          verification_notes: notes,
          verified_by: newStatus !== 'pending' ? (await supabase.auth.getUser()).data.user?.id : null,
          verified_at: newStatus !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: t('admin:statusUpdated'),
        description: t('admin:verificationStatusUpdated', { status: newStatus }),
      });

      await fetchVerifications();
      setSelectedVerification(null);
      setReviewNotes('');
      setReviewStatus('');
    } catch (error: any) {
      console.error('Error updating verification:', error);
      toast({
        title: t('common:error', { defaultValue: 'Error' }),
        description: error.message || t('admin:failedToUpdateVerificationStatus', { defaultValue: 'Failed to update verification status' }),
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'under_investigation':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_investigation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = !searchTerm || 
      verification.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.primary_document_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Initial fetch and when permissions or filter change
  useEffect(() => {
    if (!roleLoading && (canVerifyAddresses || hasAdminAccess)) {
      fetchVerifications();
    }
  }, [roleLoading, canVerifyAddresses, hasAdminAccess, statusFilter, geographicScope?.scope_type, geographicScope?.scope_value]);


  if (roleLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">{t('common:loading')}</h3>
        </CardContent>
      </Card>
    );
  }

  if (!(canVerifyAddresses || hasAdminAccess || isResidencyVerifier)) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">{t('admin:accessDenied')}</h3>
          <p className="text-muted-foreground">
            {t('admin:noPermissionManageVerificationRequests')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6" />
        <h2 className="text-2xl font-bold">{t('admin:verificationManagement')}</h2>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="search">{t('common:buttons.search')}</Label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              id="search"
              placeholder={t('admin:searchByNameEmailDocumentType')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="statusFilter">{t('admin:statusFilter')}</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin:allStatuses')}</SelectItem>
              <SelectItem value="pending">{t('admin:pending')}</SelectItem>
              <SelectItem value="document_review">{t('admin:documentReview')}</SelectItem>
              <SelectItem value="field_verification">{t('admin:fieldVerification')}</SelectItem>
              <SelectItem value="legal_review">{t('admin:legalReview')}</SelectItem>
              <SelectItem value="approved">{t('admin:approved')}</SelectItem>
              <SelectItem value="rejected">{t('admin:rejected')}</SelectItem>
              <SelectItem value="under_investigation">{t('admin:underInvestigation')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>{t('admin:actions')}</Label>
          <Button 
            onClick={fetchVerifications} 
            disabled={loading}
            variant="outline"
            size="default"
          >
            {loading ? t('common:buttons.loading') : t('common:buttons.refresh')}
          </Button>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="grid gap-4">
        {filteredVerifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t('admin:noVerificationRequests')}</h3>
              <p className="text-muted-foreground">
                {t('admin:noVerificationRequestsMatchFilters')}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVerifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(verification.status)}
                       {t(`admin:verificationType.${verification.verification_type}`, { defaultValue: formatStatus(verification.verification_type) })} {t('admin:verification')}
                     </CardTitle>
                     <CardDescription>
                       {t('admin:submittedBy')} {verification.profiles?.full_name} ({verification.profiles?.email}) 
                       {t('admin:onDate')} {format(new Date(verification.created_at), 'PPP')}
                     </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge 
                       variant="outline" 
                       className={getStatusColor(verification.status)}
                     >
                       {t(`admin:${verification.status}`)}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setReviewDialog(true);
                      }}
                    >
                       <Eye className="w-4 h-4 mr-1" />
                       {t('admin:review')}
                     </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                       <p className="text-sm font-medium">{t('admin:claimantType')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t(`admin:claimantRelationship.${verification.claimant_relationship}`, { defaultValue: formatStatus(verification.claimant_relationship) })}
                        </p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-muted-foreground" />
                     <div>
                       <p className="text-sm font-medium">{t('admin:documentTypeLabel')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`admin:documentType.${(verification.primary_document_type || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}`, { defaultValue: formatStatus(verification.primary_document_type) })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('admin:submitted')}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(verification.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Shared Review Dialog */}
      <VerificationReviewDialog
        isOpen={reviewDialog}
        onClose={() => {
          setReviewDialog(false);
          setSelectedVerification(null);
          setReviewNotes('');
          setReviewStatus('');
          fetchVerifications();
        }}
        verification={selectedVerification}
        reviewStatus={reviewStatus}
        reviewNotes={reviewNotes}
        onReviewStatusChange={setReviewStatus}
        onReviewNotesChange={setReviewNotes}
        onUpdateStatus={updateVerificationStatus}
      />
    </div>
  );
};