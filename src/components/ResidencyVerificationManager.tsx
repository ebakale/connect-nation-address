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
  
  const { canVerifyAddresses, hasAdminAccess } = useUserRole();
  const { toast } = useToast();

  const fetchVerifications = useCallback(async () => {
    if (!canVerifyAddresses && !hasAdminAccess) {
      // Keep current list to avoid flicker when permissions are still loading
      return;
    }
    
    setLoading(true);
    try {
      console.log('Fetching verifications with permissions:', { canVerifyAddresses, hasAdminAccess, statusFilter });
      
      let query = supabase
        .from('residency_ownership_verifications')
        .select(`
          *
        `)
        .order('updated_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;
      
      console.log('Verification fetch result:', { data, error, count: data?.length });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // If we have verifications, fetch the associated profiles separately
      if (data && data.length > 0) {
        const userIds = data.map(v => v.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) {
          console.error('Profiles fetch error:', profilesError);
          // Still proceed with verification data even if profiles fail
        }

        // Combine the data
        const combinedData = data.map(verification => {
          const profile = profiles?.find(p => p.user_id === verification.user_id);
          return {
            ...verification,
            profiles: profile || { full_name: 'Unknown User', email: 'Unknown Email' }
          };
        });
        
        setVerifications(combinedData as unknown as VerificationRequest[]);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: t('common:error'),
        description: t('admin:failedToFetchVerificationRequests'),
        variant: 'destructive'
      });
      setVerifications([]); // Ensure we clear the list on error
    } finally {
      setLoading(false);
    }
  }, [canVerifyAddresses, hasAdminAccess, statusFilter, toast]);

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
        title: 'Error',
        description: error.message || 'Failed to update verification status',
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
    if (canVerifyAddresses || hasAdminAccess) {
      fetchVerifications();
    }
  }, [canVerifyAddresses, hasAdminAccess, statusFilter]);


  if (!canVerifyAddresses && !hasAdminAccess) {
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
          <Label htmlFor="search">{t('common:search')}</Label>
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
            {loading ? t('common:loading') : t('common:refresh')}
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
                       {formatStatus(verification.verification_type)} {t('admin:verification')}
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
                    <Dialog onOpenChange={(open) => { if (!open) { fetchVerifications(); setSelectedVerification(null); setReviewNotes(''); setReviewStatus(''); } }}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedVerification(verification)}
                        >
                           <Eye className="w-4 h-4 mr-1" />
                           {t('admin:review')}
                         </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                         <DialogHeader>
                           <DialogTitle>{t('admin:verificationRequestReview')}</DialogTitle>
                           <DialogDescription>{t('admin:reviewVerificationDetailsAndTakeAction')}</DialogDescription>
                         </DialogHeader>
                        {selectedVerification && (
                          <div className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                               <div>
                                 <Label>{t('admin:applicant')}</Label>
                                 <p className="text-sm">{selectedVerification.profiles?.full_name}</p>
                                 <p className="text-xs text-muted-foreground">{selectedVerification.profiles?.email}</p>
                               </div>
                               <div>
                                 <Label>{t('admin:verificationType')}</Label>
                                 <p className="text-sm">{formatStatus(selectedVerification.verification_type)}</p>
                               </div>
                               <div>
                                 <Label>{t('admin:claimantRelationship')}</Label>
                                 <p className="text-sm">{formatStatus(selectedVerification.claimant_relationship)}</p>
                               </div>
                               <div>
                                 <Label>{t('admin:documentType')}</Label>
                                 <p className="text-sm">{formatStatus(selectedVerification.primary_document_type)}</p>
                               </div>
                               <div>
                                 <Label>{t('admin:privacyLevel')}</Label>
                                 <p className="text-sm">{formatStatus(selectedVerification.privacy_level)}</p>
                               </div>
                               <div>
                                 <Label>{t('admin:consentGiven')}</Label>
                                 <p className="text-sm">{selectedVerification.consent_given ? t('common:yes') : t('common:no')}</p>
                               </div>
                             </div>

                            {selectedVerification.primary_document_url && (
                              <div>
                                <Label>{t('admin:submittedDocument')}</Label>
                                <div className="border rounded-lg p-4 bg-muted/50">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {formatStatus(selectedVerification.primary_document_type)}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const rawUrl = selectedVerification.primary_document_url!;
                                        console.log('Raw document URL:', rawUrl);
                                        
                                        // For direct file paths (most common case)
                                        let filePath = rawUrl;
                                        
                                        // Extract file path from URL - handle different URL formats
                                        if (rawUrl.includes('/storage/v1/object/public/residency-documents/')) {
                                          filePath = rawUrl.split('/storage/v1/object/public/residency-documents/')[1];
                                        } else if (rawUrl.includes('/storage/v1/object/residency-documents/')) {
                                          filePath = rawUrl.split('/storage/v1/object/residency-documents/')[1];
                                        } else if (rawUrl.includes('residency-documents/')) {
                                          filePath = rawUrl.split('residency-documents/')[1];
                                        } else if (rawUrl.startsWith('http')) {
                                          // Try to extract the file path from full URL
                                          const urlParts = rawUrl.split('/');
                                          const residencyIndex = urlParts.findIndex(part => part === 'residency-documents');
                                          if (residencyIndex !== -1 && residencyIndex < urlParts.length - 1) {
                                            filePath = urlParts.slice(residencyIndex + 1).join('/');
                                          }
                                        } else {
                                          // Already a file path, just clean it
                                          filePath = rawUrl.replace(/^\/+/, '');
                                        }
                                        
                                        console.log('Extracted file path:', filePath);
                                        
                                        if (!filePath) {
                                          throw new Error('Could not extract file path from URL');
                                        }
                                        
                                        // First, try to find the actual file in the user's folder
                                        const userId = filePath.split('/')[0];
                                        console.log('Checking user folder:', userId);
                                        
                                        const { data: allFiles, error: listError } = await supabase.storage
                                          .from('residency-documents')
                                          .list(userId);
                                        
                                        console.log('All files in user folder:', allFiles);
                                        
                                        if (listError) {
                                          console.error('Error listing files:', listError);
                                          throw new Error('Could not access document folder');
                                        }
                                        
                                        if (!allFiles || allFiles.length === 0) {
                                          throw new Error('No documents found in user folder. The document may have been deleted or not uploaded properly.');
                                        }
                                        
                                        // Find the correct file - try exact match first, then most recent
                                        const fileName = filePath.split('/')[1];
                                        let targetFile = allFiles.find((file: any) => file.name === fileName);
                                        
                                        if (!targetFile) {
                                          // If exact match not found, get the most recent file
                                          const sortedFiles = allFiles.sort((a: any, b: any) => {
                                            const dateA = new Date(b.updated_at || b.created_at || '1970-01-01').getTime();
                                            const dateB = new Date(a.updated_at || a.created_at || '1970-01-01').getTime();
                                            return dateA - dateB;
                                          });
                                          targetFile = sortedFiles[0];
                                           
                                          console.log('Using most recent file:', targetFile?.name);
                                          filePath = `${userId}/${targetFile?.name}`;
                                        }

                                        // Create signed URL for the file
                                        const { data, error } = await supabase.storage
                                          .from('residency-documents')
                                          .createSignedUrl(filePath, 3600);
                                        
                                        if (error) {
                                          console.error('Signed URL error:', error);
                                          throw new Error(`Document access failed: ${error.message}`);
                                        }
                                        
                                        if (data?.signedUrl) {
                                          console.log('Opening signed URL:', data.signedUrl);
                                          window.open(data.signedUrl, '_blank');
                                        } else {
                                          throw new Error('No signed URL generated');
                                        }
                                      } catch (error: any) {
                                        console.error('Error viewing document:', error);
                                         toast({
                                           title: t('admin:documentAccessError'),
                                           description: error.message || t('admin:couldNotAccessDocumentReupload'),
                                           variant: 'destructive'
                                         });
                                      }
                                    }}
                                  >
                                     <Eye className="w-4 h-4 mr-1" />
                                     {t('admin:viewDocument')}
                                   </Button>
                                </div>
                              </div>
                            )}

                            {selectedVerification.verification_notes && (
                              <div>
                                <Label>{t('admin:currentNotes')}</Label>
                                <p className="text-sm bg-muted p-2 rounded">
                                  {selectedVerification.verification_notes}
                                </p>
                              </div>
                            )}

                            <div className="space-y-2">
                               <Label htmlFor="reviewStatus">{t('admin:updateStatus')}</Label>
                               <Select value={reviewStatus} onValueChange={setReviewStatus}>
                                 <SelectTrigger>
                                   <SelectValue placeholder={t('admin:selectNewStatus')} />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="document_review">{t('admin:documentReview')}</SelectItem>
                                   <SelectItem value="field_verification">{t('admin:fieldVerification')}</SelectItem>
                                   <SelectItem value="legal_review">{t('admin:legalReview')}</SelectItem>
                                   <SelectItem value="approved">{t('admin:approved')}</SelectItem>
                                   <SelectItem value="rejected">{t('admin:rejected')}</SelectItem>
                                   <SelectItem value="requires_additional_documents">{t('admin:requestChanges')}</SelectItem>
                                   <SelectItem value="under_investigation">{t('admin:underInvestigation')}</SelectItem>
                                 </SelectContent>
                               </Select>
                            </div>

                            <div className="space-y-2">
                               <Label htmlFor="reviewNotes">{t('admin:reviewNotes')}</Label>
                               <Textarea
                                 id="reviewNotes"
                                 value={reviewNotes}
                                 onChange={(e) => setReviewNotes(e.target.value)}
                                 placeholder={t('admin:addNotesAboutReview')}
                                 rows={3}
                               />
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateVerificationStatus(selectedVerification.id, reviewStatus, reviewNotes)}
                                disabled={!reviewStatus}
                                className="flex-1"
                              >
                                {t('admin:updateStatus')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
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
                       <p className="text-sm font-medium">{t('admin:documentType')}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatStatus(verification.primary_document_type)}
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
    </div>
  );
};