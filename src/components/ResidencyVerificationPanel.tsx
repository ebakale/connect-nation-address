import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, Users, FileText, CheckCircle, Clock, AlertTriangle, 
  Eye, Download, Upload, Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ResidencyVerification {
  id: string;
  user_id: string;
  verification_type: string;
  status: 'pending' | 'document_review' | 'field_verification' | 'legal_review' | 'approved' | 'rejected' | 'requires_additional_documents' | 'under_investigation';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  notes?: string;
  document_url?: string;
  verification_details?: any;
  // User profile info
  profiles?: {
    full_name: string;
    email: string;
  };
}

export function ResidencyVerificationPanel() {
  const { toast } = useToast();
  const { t } = useTranslation(['dashboard', 'admin']);
  const [verifications, setVerifications] = useState<ResidencyVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVerification, setSelectedVerification] = useState<ResidencyVerification | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDialog, setReviewDialog] = useState(false);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      
      // First get verifications
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('residency_ownership_verifications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (verificationsError) throw verificationsError;

      if (verificationsData && verificationsData.length > 0) {
        // Get user profiles
        const userIds = verificationsData.map(v => v.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        if (profilesError) throw profilesError;

        // Combine data
        const combinedData = verificationsData.map(verification => ({
          id: verification.id,
          user_id: verification.user_id,
          verification_type: verification.verification_type || 'residency',
          status: verification.status as any,
          submitted_at: verification.created_at,
          reviewed_at: verification.verified_at || undefined,
          reviewed_by: verification.verified_by || undefined,
          notes: verification.verification_notes || undefined,
          document_url: verification.primary_document_url || undefined,
          verification_details: verification.verification_history || undefined,
          profiles: profilesData?.find(p => p.user_id === verification.user_id)
        }));

        setVerifications(combinedData);
      } else {
        setVerifications([]);
      }
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToLoadVerifications'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (verificationId: string, newStatus: 'pending' | 'approved' | 'rejected', notes?: string) => {
    try {
      const currentUser = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('residency_ownership_verifications')
        .update({
          status: newStatus,
          verified_at: new Date().toISOString(),
          verified_by: currentUser.data.user?.id,
          verification_notes: notes || null
        })
        .eq('id', verificationId);

      if (error) throw error;

      // Create audit log
      await supabase
        .from('document_verification_audit')
        .insert({
          verification_id: verificationId,
          performed_by: currentUser.data.user?.id,
          action: `status_change_to_${newStatus}`,
          notes: notes,
          document_hash: 'manual_review',
          verification_method: 'manual_review'
        });

      toast({
        title: t('dashboard:success'),
        description: t('dashboard:verificationStatusUpdated'),
      });

      fetchVerifications();
      setReviewDialog(false);
      setSelectedVerification(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: t('dashboard:error'),
        description: t('dashboard:failedToUpdateStatus'),
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = !searchTerm || 
      verification.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.verification_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('dashboard:totalVerifications')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('dashboard:pending')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('dashboard:approved')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('dashboard:rejected')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dashboard:filters')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">{t('dashboard:searchVerifications')}</Label>
              <Input
                id="search"
                placeholder={t('dashboard:searchByNameOrEmail')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status">{t('dashboard:filterByStatus')}</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard:allStatuses')}</SelectItem>
                  <SelectItem value="pending">{t('dashboard:pending')}</SelectItem>
                  <SelectItem value="under_review">{t('dashboard:underReview')}</SelectItem>
                  <SelectItem value="approved">{t('dashboard:approved')}</SelectItem>
                  <SelectItem value="rejected">{t('dashboard:rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification List */}
      <div className="grid gap-4">
        {filteredVerifications.map((verification) => (
          <Card key={verification.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">
                      {verification.profiles?.full_name || 'Unknown User'}
                    </div>
                    <Badge className={getStatusColor(verification.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(verification.status)}
                        {verification.status?.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>{verification.profiles?.email}</div>
                    <div className="flex items-center gap-4 mt-1">
                      <span><strong>{t('dashboard:type')}:</strong> {verification.verification_type}</span>
                      <span><strong>{t('dashboard:submitted')}:</strong> {new Date(verification.submitted_at).toLocaleDateString()}</span>
                      {verification.reviewed_at && (
                        <span><strong>{t('dashboard:reviewed')}:</strong> {new Date(verification.reviewed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {verification.notes && (
                    <div className="text-sm">
                      <span className="font-medium">{t('dashboard:notes')}:</span> {verification.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{t('dashboard:verificationDetails')}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><strong>{t('dashboard:applicant')}:</strong> {verification.profiles?.full_name}</div>
                          <div><strong>{t('dashboard:email')}:</strong> {verification.profiles?.email}</div>
                          <div><strong>{t('dashboard:type')}:</strong> {verification.verification_type}</div>
                          <div><strong>{t('dashboard:status')}:</strong> {verification.status}</div>
                          <div><strong>{t('dashboard:submitted')}:</strong> {new Date(verification.submitted_at).toLocaleDateString()}</div>
                          {verification.reviewed_at && (
                            <div><strong>{t('dashboard:reviewed')}:</strong> {new Date(verification.reviewed_at).toLocaleDateString()}</div>
                          )}
                        </div>
                        {verification.verification_details && (
                          <div>
                            <strong>{t('dashboard:details')}:</strong>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto">
                              {JSON.stringify(verification.verification_details, null, 2)}
                            </pre>
                          </div>
                        )}
                        {verification.notes && (
                          <div>
                            <strong>{t('dashboard:reviewNotes')}:</strong>
                            <p className="mt-1 text-muted-foreground">{verification.notes}</p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {verification.status === 'pending' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedVerification(verification);
                        setReviewDialog(true);
                      }}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVerifications.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('dashboard:noVerificationsFound')}</h3>
              <p className="text-muted-foreground">{t('dashboard:tryAdjustingFilters')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard:reviewVerification')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedVerification && (
              <div className="bg-muted p-4 rounded-lg">
                <div className="font-medium">{selectedVerification.profiles?.full_name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedVerification.verification_type} | {selectedVerification.profiles?.email}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="review-notes">{t('dashboard:reviewNotes')}</Label>
              <Textarea
                id="review-notes"
                placeholder={t('dashboard:addNotesAboutReview')}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => updateVerificationStatus(selectedVerification?.id!, 'approved', reviewNotes)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('dashboard:approve')}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => updateVerificationStatus(selectedVerification?.id!, 'rejected', reviewNotes)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t('dashboard:reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ResidencyVerificationPanel;