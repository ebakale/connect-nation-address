import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  status: string;
  claimant_relationship?: string;
  primary_document_type?: string;
  privacy_level?: string;
  consent_given?: boolean;
  primary_document_url?: string;
  verification_notes?: string;
  created_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface VerificationReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  verification: VerificationRequest | null;
  reviewStatus: string;
  reviewNotes: string;
  onReviewStatusChange: (status: string) => void;
  onReviewNotesChange: (notes: string) => void;
  onUpdateStatus: (verificationId: string, status: string, notes: string) => void;
}

export function VerificationReviewDialog({
  isOpen,
  onClose,
  verification,
  reviewStatus,
  reviewNotes,
  onReviewStatusChange,
  onReviewNotesChange,
  onUpdateStatus
}: VerificationReviewDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation(['admin', 'common']);

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const handleViewDocument = async () => {
    if (!verification?.primary_document_url) return;

    try {
      const rawUrl = verification.primary_document_url;
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('admin:verificationRequestReview')}</DialogTitle>
          <DialogDescription>{t('admin:reviewVerificationDetailsAndTakeAction')}</DialogDescription>
        </DialogHeader>
        {verification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('admin:applicant')}</Label>
                <p className="text-sm">{verification.profiles?.full_name}</p>
                <p className="text-xs text-muted-foreground">{verification.profiles?.email}</p>
              </div>
              <div>
                <Label>{t('admin:verificationTypeLabel')}</Label>
                <p className="text-sm">{t(`admin:verificationType.${verification.verification_type}`, { defaultValue: formatStatus(verification.verification_type) })}</p>
              </div>
              {verification.claimant_relationship && (
                <div>
                  <Label>{t('admin:claimantRelationshipLabel')}</Label>
                  <p className="text-sm">{t(`admin:claimantRelationship.${verification.claimant_relationship}`, { defaultValue: formatStatus(verification.claimant_relationship) })}</p>
                </div>
              )}
              {verification.primary_document_type && (
                <div>
                  <Label>{t('admin:documentTypeLabel')}</Label>
                  <p className="text-sm">{t(`admin:documentType.${verification.primary_document_type}`, { defaultValue: formatStatus(verification.primary_document_type) })}</p>
                </div>
              )}
              {verification.privacy_level && (
                <div>
                  <Label>{t('admin:privacyLevel')}</Label>
                  <p className="text-sm">{t(`admin:privacyLevel.${verification.privacy_level}`, { defaultValue: formatStatus(verification.privacy_level) })}</p>
                </div>
              )}
              {verification.consent_given !== undefined && (
                <div>
                  <Label>{t('admin:consentGiven')}</Label>
                  <p className="text-sm">{verification.consent_given ? t('common:yes') : t('common:no')}</p>
                </div>
              )}
            </div>

            {verification.primary_document_url && (
              <div>
                <Label>{t('admin:submittedDocument')}</Label>
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {verification.primary_document_type ? 
                        t(`admin:documentType.${verification.primary_document_type}`, { defaultValue: formatStatus(verification.primary_document_type) }) :
                        'Document'
                      }
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleViewDocument}>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('admin:viewDocument')}
                  </Button>
                </div>
              </div>
            )}

            {verification.verification_notes && (
              <div>
                <Label>{t('admin:currentNotes')}</Label>
                <p className="text-sm bg-muted p-2 rounded">
                  {verification.verification_notes}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reviewStatus">{t('admin:updateStatus')}</Label>
              <Select value={reviewStatus} onValueChange={onReviewStatusChange}>
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
                onChange={(e) => onReviewNotesChange(e.target.value)}
                placeholder={t('admin:addNotesAboutReview')}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => onUpdateStatus(verification.id, reviewStatus, reviewNotes)}
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
  );
}