import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Edit,
  Calendar,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ResidencyVerificationForm } from './ResidencyVerificationForm';
import { useTranslation } from 'react-i18next';

interface VerificationRequest {
  id: string;
  citizen_address_id: string;
  address_request_id: string | null; // For backward compatibility
  verification_type: string;
  claimant_relationship: string;
  primary_document_type: string;
  primary_document_url?: string;
  status: string;
  consent_given: boolean;
  verification_notes?: string;
  created_at: string;
  verified_at?: string;
}

export const UserVerificationRequests = () => {
  const { t } = useTranslation(['address', 'common']);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerification, setSelectedVerification] = useState<VerificationRequest | null>(null);
  const [editingVerificationId, setEditingVerificationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserVerifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('residency_ownership_verifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching user verifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      case 'document_review':
      case 'field_verification':
      case 'legal_review':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'requires_additional_documents':
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
      case 'document_review':
      case 'field_verification':
      case 'legal_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'requires_additional_documents':
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

  const canEdit = (verification: VerificationRequest) => {
    return ['pending', 'requires_additional_documents', 'rejected'].includes(verification.status);
  };

  useEffect(() => {
    fetchUserVerifications();
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h2 className="text-2xl font-bold">{t('address:myVerificationRequests')}</h2>
        </div>
        <Button onClick={fetchUserVerifications} disabled={loading}>
          {loading ? t('common:buttons.loading') : t('common:buttons.refresh')}
        </Button>
      </div>

      {/* Verification Requests */}
      <div className="grid gap-4">
        {verifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">{t('address:noVerificationRequests')}</h3>
              <p className="text-muted-foreground">
                {t('address:noVerificationRequestsMessage')}
              </p>
            </CardContent>
          </Card>
        ) : (
          verifications.map((verification) => (
            <Card key={verification.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(verification.status)}
                      {t(`address:verificationType.${verification.verification_type}`)} {t('address:verification')}
                    </CardTitle>
                    <CardDescription>
                      {t('address:submittedOn')} {format(new Date(verification.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(verification.status)}
                    >
                      {t(`address:verificationStatus.${verification.status}`)}
                    </Badge>
                    {canEdit(verification) && (
                      <Dialog 
                        open={editingVerificationId === verification.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setEditingVerificationId(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingVerificationId(verification.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            {t('common:buttons.edit')}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{t('address:editVerificationRequest')}</DialogTitle>
                          </DialogHeader>
                          {editingVerificationId === verification.id && (
                            <>
                              {verification.citizen_address_id ? (
                                <ResidencyVerificationForm
                                  citizenAddressId={verification.citizen_address_id}
                                  editingVerification={verification}
                                  onSuccess={() => {
                                    setEditingVerificationId(null);
                                    fetchUserVerifications();
                                  }}
                                  onCancel={() => {
                                    console.log('UserVerificationRequests onCancel called, setting editingVerificationId to null');
                                    setEditingVerificationId(null);
                                  }}
                                />
                              ) : (
                                <div className="p-6 space-y-4">
                                  <div className="text-center">
                                    <h3 className="text-lg font-medium mb-2">{t('address:legacyVerificationRequest')}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {t('address:legacyVerificationMessage')}
                                    </p>
                                    <ol className="text-sm text-left space-y-2 max-w-md mx-auto">
                                      <li>{t('address:legacyStep1')}</li>
                                      <li>{t('address:legacyStep2')}</li>
                                      <li>{t('address:legacyStep3')}</li>
                                    </ol>
                                  </div>
                                  <div className="flex justify-center gap-2 pt-4">
                                    <Button onClick={() => setEditingVerificationId(null)}>
                                      {t('common:buttons.close')}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('address:claimantType')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`address:claimantRelationship.${verification.claimant_relationship}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{t('address:documentType')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t(`address:documentTypes.${verification.primary_document_type}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        {formatStatus(verification.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {verification.verification_notes && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Reviewer Notes:</p>
                    <p className="text-sm">{verification.verification_notes}</p>
                  </div>
                )}

                {verification.status === 'requires_additional_documents' && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm font-medium text-orange-800 mb-1">Action Required:</p>
                    <p className="text-sm text-orange-700">
                      Please review the notes above and update your verification request with the requested changes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};